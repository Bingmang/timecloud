import * as Agenda from 'agenda'

export interface JobConfig {
  readonly name: string
  readonly path: string
  readonly crontab: string
  readonly timeout: number
  readonly retries: number
  readonly env: any
}

export enum STATUS {
  RUN = 1,
  ABORTING = 2,
  STOP = 3,
}

export class Job {

private status: STATUS
private config: JobConfig

public constructor(config: JobConfig) {
  this.config = config
}

public isRunning(): boolean {
  return this.status === STATUS.RUN
}

public async run(): Promise<void> {

}

public async stop(): Promise<void> {

}

}
