import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IBlockRequestData } from "../block-request-data.type";
import { IBlockResponseData } from "../block-response-data.type";
import { IRealtimeNetworkBlock } from "../realtime-network-block.type";
import { TMqttBlockRequestData } from "./data-types/mqtt.request-data.type";
import { TMqttBlockResponseData } from "./data-types/mqtt.response-data.type";

export interface IMqttClientBlock
  extends IBaseBlock, IBaseNetworkBlock, IRealtimeNetworkBlock, IBlockRequestData<TMqttBlockRequestData>, IBlockResponseData<TMqttBlockResponseData> {
  blockName: string;
  mqttHost: string;
  mqttPort: number;
  username?: string;
  password?: string;
  clientId?: string;
  topic: string
}
