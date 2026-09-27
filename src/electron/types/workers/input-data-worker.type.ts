import { IBaseDataType } from "../data-types/base-data-type.type";

export interface IInputWorker<T extends IBaseDataType<any, any>> {
    input: (packageData: IInputWorkerData<T>) => void;
}

export interface IInputWorkerData<T extends IBaseDataType<any, any>> {
    data: T;
    initiatorId: number;
}