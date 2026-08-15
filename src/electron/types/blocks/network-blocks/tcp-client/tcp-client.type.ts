import { IBaseBlock } from "../../base-block.type";
import { TTcpClientBlockResponseData } from "./data-types/tcp-client.response-data.type";
import { TTcpClientBlockRequestData } from "./data-types/tcp-client.request-data.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockResponseData } from "../block-response-data.type";
import { IBlockRequestData } from "../block-request-data.type";
import { IRealtimeNetworkBlock } from "../realtime-network-block.type";

export interface ITcpClientBlock
  extends
    IBaseBlock,
    IBaseNetworkBlock,
    IRealtimeNetworkBlock,
    IBlockResponseData<TTcpClientBlockResponseData>,
    IBlockRequestData<TTcpClientBlockRequestData> {
  tcpClientHost: string;
  tcpClientPort: number;
}
