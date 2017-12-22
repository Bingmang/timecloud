import { assert } from 'chai'
import { IPidList, IProcess, Process } from '../../src/core'
import { spawn } from 'child_process' 

describe('core/Process', () => {

  it('scanAlivePids', async () => {
    let pmaster: IProcess = new Process(process.pid)
    let sp = spawn('sleep', ['1'])
    await pmaster.init()
    let alive_pids: IPidList = await pmaster.scanAlivePids()
    assert(alive_pids.includes(sp.pid))
  })

  it('signal', async () => {
    // spawn a process then kill it.
    let sp = spawn('sleep', ['3'])
    let pmaster: IProcess = new Process(process.pid)
    await pmaster.init()
    let pchild: IProcess = new Process(sp.pid)
    await pchild.init()
    let alive_pids: IPidList = await pmaster.scanAlivePids()
    // can find the sp.pid
    assert(alive_pids.includes(sp.pid))
    pchild.killAll()
    alive_pids = await pmaster.scanAlivePids()
    // after killed, can not find the sp.pid
    assert(!alive_pids.includes(sp.pid))
  })
  
})
