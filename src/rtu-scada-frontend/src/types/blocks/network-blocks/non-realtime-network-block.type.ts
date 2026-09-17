export enum ENonRealtimeSettingOption {
    BY_INPUT_DATA,
    BY_SIGNAL,
    INTERVAL,
    INTERVAL_AFTER_INPUT_DATA,
    INTERVAL_BEFORE_INPUT_DATA,
    ONCE
}

export interface INonRealtimeNetworkBlock {
    timeRequestSettings: ITimeRequestSettings;
}

export interface ITimeRequestSettings {
    timeRequestOption: ENonRealtimeSettingOption;
    countRequest: number | null;
    period: number | null;
}