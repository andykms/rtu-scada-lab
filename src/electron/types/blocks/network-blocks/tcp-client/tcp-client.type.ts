import { IBaseBlock } from "../../base-block.type";
import { TTcpClientBlockResponseData } from "./tcp-client.response-data.type";
import { TTcpClientBlockRequestData } from "./tcp-client.request-data.type";
import { IOnDisconnectSettings } from "../../../project/state/errors/on-disconnect.type";
import { IBaseNetworkBlock, IBaseNetworkBlockOptions } from "../base-network-block-options.type";

export interface ITcpClientBlock extends IBaseBlock, IBaseNetworkBlock {
  tcpClientHost: string;
  tcpClientPort: number;
  typeResponseData: TTcpClientBlockResponseData;
  typeRequestData: TTcpClientBlockRequestData;
}
