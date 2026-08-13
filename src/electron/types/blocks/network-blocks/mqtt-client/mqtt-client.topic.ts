import { TMqttBlockRequestData } from "./mqtt.request-data.type";
import { TMqttBlockResponseData } from "./mqtt.response-data.type";

export interface IMqttClientBlockTopic {
    blockId: number;
    topic: string;
    typeResponseData?: TMqttBlockResponseData;
    typeRequestData?: TMqttBlockRequestData;
}