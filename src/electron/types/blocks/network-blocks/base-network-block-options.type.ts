export interface IBaseNetworkBlockOptions {
    isCanUserSendData: boolean;
    isDemoMode: boolean;
}

export interface IBaseNetworkBlock {
    blockOptions: IBaseNetworkBlockOptions;
}