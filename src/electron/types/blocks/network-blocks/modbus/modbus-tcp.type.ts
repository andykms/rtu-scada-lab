import { IBaseModbus } from "./base-modbus.type";
import { INonRealtimeNetworkBlock } from "../non-realtime-network-block.type";
import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockResponseData } from "../block-response-data.type";
import { TMqttBlockResponseData } from "./data-types/modbus.response-data.type";

export interface IModbusTcpBlock
  extends
    INonRealtimeNetworkBlock,
    IBaseModbus,
    IBaseBlock,
    IBaseNetworkBlock,
    IBlockResponseData<TMqttBlockResponseData> {
  tcpPort: number;
  tcpHost: string;
}
