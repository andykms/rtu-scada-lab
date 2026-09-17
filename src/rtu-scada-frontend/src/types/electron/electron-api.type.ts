import type { IConverterBlock } from "../../../../electron/types/blocks/internal-blocks/converter/converter.type";
import type { IGraphBlock } from "../../../../electron/types/blocks/internal-blocks/graphs/graphs.type";
import type { IIndicatorsBlock } from "../../../../electron/types/blocks/internal-blocks/indicators/indicators.type";
import type { IMediaBlock } from "../../../../electron/types/blocks/internal-blocks/media/media.type";
import type { IComBlock } from "../../../../electron/types/blocks/network-blocks/com/com.type";
import type { IDatabaseBlock } from "../../../../electron/types/blocks/network-blocks/database/database.type";
import type { IHttpClientBlock } from "../../../../electron/types/blocks/network-blocks/http-client/http-client.type";
import type { IModbusRtuBlock } from "../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type";
import type { IModbusTcpBlock } from "../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type";
import type { IMqttClientBlock } from "../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import type { ITcpClientBlock } from "../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type";
import type { ITcpServerBlock } from "../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type";
import type { IProjectFile } from "../../../../electron/types/project/project-file/project-file.type";
import type { EAppMode } from "../../../../electron/types/settings/settings.app-mode.type";

export interface IElectronAPI {
  getAppMode: () => Promise<EAppMode>;

  openProjectFile: (filePath: string) => Promise<IProjectFile>;

  createProject: (projectName: string) => Promise<IProjectFile>;

  setTcpServerBlock: (
    projectId: number,
    data: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setTcpClientBlock: (
    projectId: number,
    data: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setMqttClientBlock: (
    projectId: number,
    data: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setModbusRtuBlock: (
    projectId: number,
    data: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setModbusTcpBlock: (
    projectId: number,
    data: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setHttpClientBlock: (
    projectId: number,
    data: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setDatabaseBlock: (
    projectId: number,
    data: IDatabaseBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setComBlock: (
    projectId: number,
    data: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setConverterBlock: (
    projectId: number,
    data: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setGraphBlock: (
    projectId: number,
    data: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setIndicatorsBlock: (
    projectId: number,
    data: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  setMediaBlock: (
    projectId: number,
    data: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) => Promise<IProjectFile>;

  saveProject: (projectId: number) => Promise<void>;

  openDemoMode: (projectId: number) => Promise<void>;

  configureApp: (projectId: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: IElectronAPI;
  }
}

export {};
