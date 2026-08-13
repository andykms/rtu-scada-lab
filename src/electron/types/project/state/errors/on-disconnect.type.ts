export enum EOnDisconnectActions {
    IGNORE,
    STOP_APP,
}

export interface IOnDisconnectSettings {
    action: EOnDisconnectActions;
    isCanUserReconnect: boolean;
    retryCount: number;
}