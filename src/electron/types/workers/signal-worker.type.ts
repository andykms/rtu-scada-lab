export interface ISignalWorker {
    signal(): (signalData: ISignalWorkerData) => void;
}

export interface ISignalWorkerData {
    initiatorId: number;
}