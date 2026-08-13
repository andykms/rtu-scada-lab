import { IBaseBlock } from "../../base-block.type";
import { TTcpServerBlockResponseData } from "./tcp-server.response-data.type";
import { TTcpServerBlockRequestData } from "./tcp-server.request-data.type";
import { IBaseNetworkBlockOptions } from "../base-network-block-options.type";

export interface ITcpServerBlock extends IBaseBlock {
  tcpServerPort: number;
  typeResponseData: TTcpServerBlockResponseData;
  typeRequestData: TTcpServerBlockRequestData;
  options: IBaseNetworkBlockOptions;
}