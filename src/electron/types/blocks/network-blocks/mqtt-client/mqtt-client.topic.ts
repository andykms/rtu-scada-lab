import { IBlockRequestData } from "../block-request-data.type";
import { IBlockResponseData } from "../block-response-data.type";
import { TMqttBlockRequestData } from "./data-types/mqtt.request-data.type";
import { TMqttBlockResponseData } from "./data-types/mqtt.response-data.type";

export interface IMqttClientBlockTopic extends IBlockRequestData<TMqttBlockRequestData>, IBlockResponseData<TMqttBlockResponseData> {
    blockId: number;
    topic: string;
}