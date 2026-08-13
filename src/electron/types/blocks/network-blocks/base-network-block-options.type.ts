import { IOnDisconnectSettings } from "../../project/state/errors/on-disconnect.type";

export interface IBaseNetworkBlockOptions {
    isCanUserSendData: boolean;
    isDemoMode: boolean;
}

export interface IBaseNetworkBlock {
    options: IBaseNetworkBlockOptions;
    onDisconnect: IOnDisconnectSettings;
}