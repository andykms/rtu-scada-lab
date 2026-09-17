import { EOnDisconnectActions } from '../../../../../../../electron/types/project/state/errors/on-disconnect.type';
import {
  ENonRealtimeSettingOption,
  ITimeRequestSettings,
} from '../../../../../../../electron/types/blocks/network-blocks/non-realtime-network-block.type';
import { IBaseNetworkBlockOptions } from '../../../../../../../electron/types/blocks/network-blocks/base-network-block-options.type';
import { IOnDisconnectSettings } from '../../../../../../../electron/types/project/state/errors/on-disconnect.type';

export const DEFAULT_BLOCK_OPTIONS: IBaseNetworkBlockOptions = {
  isCanUserSendData: true,
  isDemoMode: false,
};

export const DEFAULT_ON_DISCONNECT: IOnDisconnectSettings = {
  action: EOnDisconnectActions.IGNORE,
  isCanUserReconnect: true,
  retryCount: 3,
};

export const DEFAULT_TIME_REQUEST_SETTINGS: ITimeRequestSettings = {
  timeRequestOption: ENonRealtimeSettingOption.INTERVAL,
  countRequest: null,
  period: 1000,
};
