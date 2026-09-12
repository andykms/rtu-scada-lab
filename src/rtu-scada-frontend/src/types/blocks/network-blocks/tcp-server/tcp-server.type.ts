import { IBaseBlock } from "../../base-block.type";
import { TTcpServerBlockResponseData } from "./data-types/tcp-server.response-data.type";
import { TTcpServerBlockRequestData } from "./data-types/tcp-server.request-data.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockResponseData } from "../block-response-data.type";
import { IBlockRequestData } from "../block-request-data.type";

export interface ITcpServerBlock
  extends
    IBaseBlock,
    IBaseNetworkBlock,
    IBlockResponseData<TTcpServerBlockResponseData>,
    IBlockRequestData<TTcpServerBlockRequestData> {
  tcpServerPort: number;
}
