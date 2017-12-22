import * as _ from 'lodash'
import * as Bluebird from 'bluebird'
import * as child_process from 'child_process'

export interface IPidList extends Array<number>{
  [index: number]: number
}

export interface IProcess {
  init(): Promise<void>
  scanAlivePids(delay?: number): Promise<IPidList>
  signal(signal: string): void
  killAll(): void
}

enum STATUS {
  VOID,
  ALIVE,
  KILEED
}

interface IPidTree {
  [pid: string]: IPidList
}

interface IPidStatusMap {
  [pid: string]: STATUS
}


/**
 * 建立进程树，功能是可以在任务的所有子进程下进行广播
 */
export class Process implements IProcess{

  private _pid: number
  private _pid_tree: IPidTree
  private _pid_list: IPidList

  public constructor(pid: number) {
    this._pid = pid
    this._pid_tree = null
    this._pid_list = null
  }

  /**
   * 初始化进程树
   */
  public async init(): Promise<void> {
    this._pid_tree = await buildProcessTree(this._pid)
    this._pid_list = _.map(_.keys(this._pid_tree), _.parseInt)
  }

  /**
   * 等待一段时间后，查询进程树中任然存在的进程
   */
  public async scanAlivePids(delay: number = 0): Promise<IPidList> {
    await Bluebird.delay(delay)
    if (!this._pid_tree) {
      return []
    }
    return scanAlivePids(this._pid_list)
  }

  /**
   * 为当前进程树中的每个进程发送信号
   */
  public signal(signal: string): void {
    if (!this._pid_tree || !this._pid_list.length) {
      return
    }
    signalAllPid(this._pid_tree, signal)
  }

  /**
   * 杀死所有进程
   */
  public killAll(): void {
    this.signal('SIGKILL')
  }

}

/**
 * 建立ProcessTree, 查询多次
 */
function buildProcessTree(pid: number): Promise<IPidTree> {
  return new Promise((resolve, reject) => {
    let tree: IPidTree = {}
    let pids_to_process: any = {}
    tree[pid] = []
    pids_to_process[pid] = STATUS.ALIVE
    _buildProcessTreeCore(pid, tree, pids_to_process, () => resolve(tree))
  })
}

function _buildProcessTreeCore(parent_pid: number, tree: IPidTree, pids_to_process: IPidStatusMap, callback: Function): void {
  let ps = child_process.spawn(
    'ps', ['-o', 'pid', '--no-headers', '--ppid', parent_pid.toString()])
  let all_data: string = ''
  ps.stdout.on('data', data => {
    all_data += (data as Buffer).toString('ascii')
  })
  ps.on('close', (code: number): void => {
    delete pids_to_process[parent_pid]
    if (code != 0) {
      // no more parent processes
      if (_.keys(pids_to_process).length == 0) {
        callback()
      }
      return
    }
    _.map(all_data.match(/\d+/g), Number).forEach(pid => {
      tree[parent_pid].push(pid)
      tree[pid] = []
      pids_to_process[pid] = STATUS.ALIVE
      _buildProcessTreeCore(pid, tree, pids_to_process, callback)
    })
  })
}

/**
 * 检查pid_list中还在进程中的pid, 只查询一次
 */
function scanAlivePids(pid_list: IPidList): Promise<IPidList> {
  return new Promise((resolve, reject) => {
    let query: string = _.join(pid_list, '|')
    let command: string = `ps -e -o pid | grep -E '${query}'`
    child_process.exec(command, (err, stdout, stderr) => {
      err ? resolve([]) : resolve(_.map(_.compact(_.split(stdout, '\n')), Number))
    })
  })
}

/**
 * 对进程树中的所有进程传递信号
 */
function signalAllPid(tree: IPidTree, signal: string): void {
  let killed: IPidStatusMap = {}
  _.forEach(_.keys(tree), pid => {
    _.forEach(tree[pid], ppid => {
      if (!killed[ppid]) {
        signalPid(ppid, signal)
        killed[ppid] = STATUS.KILEED
      }
    })
    if (!killed[pid]) {
      signalPid(Number(pid), signal)
      killed[pid] = STATUS.KILEED
    }
  })
}

function signalPid(pid: number, signal: string): void {
  try {
    process.kill(pid, signal)
  } catch (err) {
    if (err.code === 'ESRCH') {
      // 找不到pid, 认为该pid已退出, 不进行操作 
    } else {
      // 找到pid, 但是发送信号失败, 抛出异常
      throw err
    }
  }
}
