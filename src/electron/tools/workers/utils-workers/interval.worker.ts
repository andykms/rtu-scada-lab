export enum EIntervalWorkerStatus {
  WORK,
  STOP,
  DESTROY,
}

export abstract class IntervalWorker {
  private timer: NodeJS.Timeout | null = null;
  protected status: EIntervalWorkerStatus = EIntervalWorkerStatus.DESTROY;
  private action: (()=> void) | null = null;
  private periodMs: number = Infinity;

  startTimer(action: () => void, periodMs: number) {
    this.action = action;
    this.periodMs = periodMs;

    this.timer = setInterval(() => {
      if (this.status == EIntervalWorkerStatus.WORK) action();
    }, periodMs);
    this.status = EIntervalWorkerStatus.WORK;
  }

  stopTimer() {
    this.status = EIntervalWorkerStatus.STOP;
    this.clearTimer();
  }

  continueTimer() {
    if(this.status == EIntervalWorkerStatus.STOP && this.action) {
        this.status = EIntervalWorkerStatus.WORK;
        this.startTimer(this.action, this.periodMs);
    }
  }

  destroyTimer() {
    this.clearTimer();
    this.status = EIntervalWorkerStatus.DESTROY;
  }

  private clearTimer() {
    if(this.timer) {
        clearInterval(this.timer);
        this.timer = null;
        this.action = null;
        this.periodMs = Infinity;
    }
  }
}
