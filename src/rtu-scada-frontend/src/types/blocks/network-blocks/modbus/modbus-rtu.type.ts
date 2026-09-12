import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockResponseData } from "../block-response-data.type";
import { IComConnectOptions } from "../com/com-connect-options.type";
import { INonRealtimeNetworkBlock } from "../non-realtime-network-block.type";
import { IBaseModbus } from "./base-modbus.type";
import { TModbusBlockResponseData } from "./data-types/modbus.response-data.type";

export interface IModbusRtuBlock
  extends
    IComConnectOptions,
    INonRealtimeNetworkBlock,
    IBaseModbus,
    IBaseNetworkBlock,
    IBaseBlock,
    IBlockResponseData<TModbusBlockResponseData> {}
