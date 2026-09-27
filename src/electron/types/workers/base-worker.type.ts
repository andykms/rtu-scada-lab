import { IBaseBlock } from "../blocks/base-block.type";
import { EWorkerBlockType } from "./worker-block-types.type";
import { EWorkerStatus } from "./worker-statuses.type";

export interface IBaseWorker<T extends IBaseBlock> {
    readonly blockConfig: T;
    blockType: EWorkerBlockType;

    status: EWorkerStatus;
    prevStatus: EWorkerStatus;

    stop: ()=>void;
    continue: ()=>void;
    initialize: ()=>void;
}