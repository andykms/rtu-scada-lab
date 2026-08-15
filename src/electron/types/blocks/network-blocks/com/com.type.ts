import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockRequestData } from "../block-request-data.type";
import { IBlockResponseData } from "../block-response-data.type";
import { IRealtimeNetworkBlock } from "../realtime-network-block.type";
import { IComConnectOptions } from "./com-connect-options.type";
import { TComBlockRequestData } from "./data-types/com.request-data.type";
import { TComBlockResponseData } from "./data-types/com.response-data.type";

export interface IComBlock
  extends
    IBaseBlock,
    IBaseNetworkBlock,
    IComConnectOptions,
    IRealtimeNetworkBlock,
    IBlockRequestData<TComBlockRequestData>,
    IBlockResponseData<TComBlockResponseData> {}
