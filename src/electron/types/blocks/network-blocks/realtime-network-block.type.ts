import { IOnDisconnectSettings } from "../../project/state/errors/on-disconnect.type";

export interface IRealtimeNetworkBlock {
    onDisconnect: IOnDisconnectSettings;
}