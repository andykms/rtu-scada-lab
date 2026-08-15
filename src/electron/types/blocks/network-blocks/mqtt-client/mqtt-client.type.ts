import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { IRealtimeNetworkBlock } from "../realtime-network-block.type";
import { IMqttClientBlockTopic } from "./mqtt-client.topic";

export interface IMqttClientBlock
  extends IBaseNetworkBlock, IRealtimeNetworkBlock {
  blockName: string;
  mqttHost: string;
  mqttPort: number;
  username?: string;
  password?: string;
  clientId?: string;
  topics: IMqttClientBlockTopic[];
}
