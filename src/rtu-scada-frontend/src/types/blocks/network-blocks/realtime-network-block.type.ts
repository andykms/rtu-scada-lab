import { IOnDisconnectSettings } from "../../../../../electron/types/project/state/errors/on-disconnect.type";

export interface IRealtimeNetworkBlock {
  onDisconnect: IOnDisconnectSettings;
}
