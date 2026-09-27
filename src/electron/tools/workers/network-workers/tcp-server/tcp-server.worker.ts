import { ITcpServerBlock } from "../../../../types/blocks/network-blocks/tcp-server/tcp-server.type";
import { IBaseDataType } from "../../../../types/data-types/base-data-type.type";
import { IBaseWorker } from "../../../../types/workers/base-worker.type";
import { IOutputWorker, IOutputWorkerData } from "../../../../types/workers/output-data-worker.type";
import { EWorkerBlockType } from "../../../../types/workers/worker-block-types.type";
import { EWorkerStatus } from "../../../../types/workers/worker-statuses.type";
import * as net from "net";

export class TcpServerWorker<T extends IBaseDataType<any, any>> implements IBaseWorker<ITcpServerBlock>/*, IOutputWorker<T>*/ {
  readonly blockType = EWorkerBlockType.TCP_SERVER;
  status = EWorkerStatus.CRASH;
  prevStatus = EWorkerStatus.CRASH;
  private readonly server: net.Server | null = null;


  constructor(readonly blockConfig: ITcpServerBlock) {}

  initialize() {
    this.status = EWorkerStatus.INITIALIZES;
    const server = net.createServer((socket) => {
        
    })

    server.listen(this.blockConfig.tcpServerPort, "0.0.0.0")
  }

  stop() {
    if (this.status != EWorkerStatus.STOPPED) {
      this.prevStatus = this.status;
      this.status = EWorkerStatus.STOPPED;
    }
  }

  continue() {
    this.status = this.prevStatus;
  }

  output () {

  }
}

