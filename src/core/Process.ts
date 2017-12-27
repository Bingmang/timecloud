import * as _ from 'lodash'
import * as Bluebird from 'bluebird'
import * as child_process from 'child_process'

export type PidList = number[]

enum STATUS {
  VOID,
  ALIVE,
  KILEED
}

type PidTree = {
  [pid: string]: PidList
}

type PidStatusMap = {
  [pid: string]: STATUS
}


/**
 * 建立进程树，功能是可以在任务的所有子进程下进行广播
 */
export class Process {

  private pid: number
  private pid_tree: PidTree
  private pid_list: PidList

  public constructor(pid: number) {
    this.pid = pid
    this.pid_tree = null
    this.pid_list = null
  }

  /**
   * 初始化进程树
   */
  public async init(): Promise<void> {
    this.pid_tree = await buildProcessTree(this.pid)
    this.pid_list = _.map(_.keys(this.pid_tree), _.parseInt)
  }

  /**
   * 等待一段时间后，查询进程树中任然存在的进程
   */
  public async scanAlivePids(delay: number = 0): Promise<PidList> {
    await Bluebird.delay(delay)
    if (!this.pid_tree) {
      return []
    }
    return scanAlivePids(this.pid_list)
  }

  /**
   * 为当前进程树中的每个进程发送信号
   */
  public signal(signal: string): void {
    if (!this.pid_tree || !this.pid_list.length) {
      return
    }
    signalAllPid(this.pid_tree, signal)
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
function buildProcessTree(pid: number): Promise<PidTree> {
  return new Promise((resolve, reject) => {
    let tree: PidTree = {}
    let pids_to_process: any = {}
    tree[pid] = []
    pids_to_process[pid] = STATUS.ALIVE
    _buildProcessTreeCore(pid, tree, pids_to_process, () => resolve(tree))
  })
}

function _buildProcessTreeCore(
  parent_pid: number, 
  tree: PidTree, 
  pids_to_process: PidStatusMap, 
  callback: Function
): void {
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
function scanAlivePids(pid_list: PidList): Promise<PidList> {
  return new Promise((resolve, reject) => {
    let query: string = _.join(pid_list, '|')
    let command: string = `ps -e -o pid | grep -E '${query}'`
    child_process.exec(command, (err, stdout, stderr) => {
      err ? resolve([]) : resolve(
        _.map(_.compact(_.split(stdout, '\n')), Number)
      )
    })
  })
}

/**
 * 对进程树中的所有进程传递信号
 */
function signalAllPid(tree: PidTree, signal: string): void {
  let killed: PidStatusMap = {}
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
