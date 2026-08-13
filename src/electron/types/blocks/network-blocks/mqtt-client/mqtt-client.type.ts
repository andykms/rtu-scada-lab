import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IMqttClientBlockTopic } from "./mqtt-client.topic";

export interface IMqttClientBlock extends IBaseNetworkBlock {
  blockName: string;
  host: string;
  port: number;
  topic: string;
  username?: string;
  password?: string;
  clientId?: string;
  topics: IMqttClientBlockTopic[];
}
