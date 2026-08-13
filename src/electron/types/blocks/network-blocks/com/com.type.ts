import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { TComBlockRequestData } from "./com.request-data.type";
import { TComBlockResponseData } from "./com.response-data.type";

export interface IComBlock extends IBaseBlock, IBaseNetworkBlock {
  comPort: string;
  baudRate: number;
  isParity: boolean;
  dataBits: number;
  stopBits: number;
  typeRequestData: TComBlockRequestData;
  typeResponseData: TComBlockResponseData;
}