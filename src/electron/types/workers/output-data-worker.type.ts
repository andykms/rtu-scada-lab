import { EDataTypes, IBaseDataType } from "../data-types/base-data-type.type";

export interface IOutputWorker<T extends IBaseDataType<any, any>> {
  output: () => IOutputWorkerData<T>;
}

export interface IOutputWorkerData<T extends IBaseDataType<any, any>> {
  blockId: number;
  blockName: number;
  timestamp: Date;
  data: T;
}
