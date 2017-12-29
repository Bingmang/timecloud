import { assert } from 'chai'
import { PidList, Process } from '../../src/'
import { spawn, ChildProcess } from 'child_process' 

describe('core/Process', () => {

  let pmaster: Process, pchild: Process, sp: ChildProcess

  beforeEach(() => {
    pmaster = new Process(process.pid)
    sp = spawn('sleep', ['3'])
    pchild = new Process(sp.pid)
  })

  afterEach(() => {
    pmaster = pchild = sp = undefined
  })

  it('scanAlivePids without init', async () => {
    let alive_pids: PidList = await pmaster.scanAlivePids()
    assert.lengthOf(alive_pids, 0)
  })

  it('scanAlivePids', async () => {
    await pmaster.init()
    let alive_pids: PidList = await pmaster.scanAlivePids()
    assert.include(alive_pids, sp.pid)
  })

  it('signal without init', async () => {
    pchild.signal('SIGKILL')
    assert.isFalse(sp.killed)
  })

  it('signal SIGKILL', async () => {
    await pmaster.init()
    await pchild.init()
    pchild.killAll()
    let alive_pids = await pmaster.scanAlivePids(100)
    assert.notInclude(alive_pids, sp.pid)
  })

})
