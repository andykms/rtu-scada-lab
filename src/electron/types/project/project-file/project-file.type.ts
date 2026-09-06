import { IConverterBlock } from "../../blocks/internal-blocks/converter/converter.type";
import { IGraphBlock } from "../../blocks/internal-blocks/graphs/graphs.type";
import { IIndicatorsBlock } from "../../blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "../../blocks/internal-blocks/media/media.type";
import { IComBlock } from "../../blocks/network-blocks/com/com.type";
import { IDatabaseBlock } from "../../blocks/network-blocks/database/database.type";
import { IHttpClientBlock } from "../../blocks/network-blocks/http-client/http-client.type";
import { IModbusRtuBlock } from "../../blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "../../blocks/network-blocks/modbus/modbus-tcp.type";
import { IMqttClientBlock } from "../../blocks/network-blocks/mqtt-client/mqtt-client.type";
import { ITcpClientBlock } from "../../blocks/network-blocks/tcp-client/tcp-client.type";
import { ITcpServerBlock } from "../../blocks/network-blocks/tcp-server/tcp-server.type";
import { IProjectFileInfo } from "./project-file-info.type";

export interface IProjectFile extends IProjectFileInfo {
  projectData: {
    blocks: {
      blockIds: number[];
      blockNames: number[];
      networkBlocks: {
        tcpServers: ITcpServerBlock[];
        tcpClients: ITcpClientBlock[];
        mqttClients: IMqttClientBlock[];
        httpClients: IHttpClientBlock[];
        modbusRtu: IModbusRtuBlock[];
        modbusTcp: IModbusTcpBlock[];
        database: IDatabaseBlock[];
        com: IComBlock[];
      };
      internalBlocks: {
        converters: IConverterBlock[];
        graphs: IGraphBlock[];
        indicators: IIndicatorsBlock[];
        media: IMediaBlock[];
      };
    };
    edges: {
      [key in number]: number[];
    };
  };
}
