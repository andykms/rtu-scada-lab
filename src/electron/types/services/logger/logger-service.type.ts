import { ELoggerServiceConfigType } from "./logger-service-config-type.type";

export interface ILoggerServiceConfig {
    option: ELoggerServiceConfigType,
    specificBlocksConfig: number[] | null;
}
