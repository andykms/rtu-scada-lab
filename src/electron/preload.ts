import { contextBridge, ipcRenderer } from "electron";
import { ITcpServerBlock } from "./types/blocks/network-blocks/tcp-server/tcp-server.type";
import { ITcpClientBlock } from "./types/blocks/network-blocks/tcp-client/tcp-client.type";
import { IMqttClientBlock } from "./types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import { IModbusRtuBlock } from "./types/blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "./types/blocks/network-blocks/modbus/modbus-tcp.type";
import { IHttpClientBlock } from "./types/blocks/network-blocks/http-client/http-client.type";
import { IDatabaseBlock } from "./types/blocks/network-blocks/database/database.type";
import { IComBlock } from "./types/blocks/network-blocks/com/com.type";
import { IConverterBlock } from "./types/blocks/internal-blocks/converter/converter.type";
import { IGraphBlock } from "./types/blocks/internal-blocks/graphs/graphs.type";
import { IIndicatorsBlock } from "./types/blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "./types/blocks/internal-blocks/media/media.type";

contextBridge.exposeInMainWorld("electronAPI", {
  getAppMode: () => ipcRenderer.invoke("getAppMode"),

  openProjectFile: (filePath: string) =>
    ipcRenderer.invoke("openProjectFile", filePath),

  pickAndOpenProjectFile: () => ipcRenderer.invoke("pickAndOpenProjectFile"),

  createProject: (projectName: string) =>
    ipcRenderer.invoke("createProject", projectName),

  setTcpServerBlock: (
    projectId: number,
    data: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setTcpServerBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setTcpClientBlock: (
    projectId: number,
    data: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setTcpClientBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setMqttClientBlock: (
    projectId: number,
    data: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setMqttClientBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setModbusRtuBlock: (
    projectId: number,
    data: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setModbusRtuBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setModbusTcpBlock: (
    projectId: number,
    data: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setModbusTcpBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setHttpClientBlock: (
    projectId: number,
    data: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setHttpClientBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setDatabaseBlock: (
    projectId: number,
    data: IDatabaseBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setDatabaseBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setComBlock: (
    projectId: number,
    data: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setComBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),

  setConverterBlock: (
    projectId: number,
    data: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setConverterBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setGraphBlock: (
    projectId: number,
    data: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setGraphBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setIndicatorsBlock: (
    projectId: number,
    data: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setIndicatorsBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),
  setMediaBlock: (
    projectId: number,
    data: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ) =>
    ipcRenderer.invoke(
      "setMediaBlock",
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    ),

  connectBlocks: (
    projectId: number,
    fromBlockId: number,
    toBlockId: number,
  ) => ipcRenderer.invoke("connectBlocks", projectId, fromBlockId, toBlockId),

  disconnectBlocks: (
    projectId: number,
    fromBlockId: number,
    toBlockId: number,
  ) =>
    ipcRenderer.invoke("disconnectBlocks", projectId, fromBlockId, toBlockId),

  deleteBlocks: (projectId: number, blockIds: number[]) =>
    ipcRenderer.invoke("deleteBlocks", projectId, blockIds),

  setSceneNodePositions: (
    projectId: number,
    positions: { [nodeId: string]: { x: number; y: number } },
  ) => ipcRenderer.invoke("setSceneNodePositions", projectId, positions),

  saveProject: (projectId: number) =>
    ipcRenderer.invoke("saveProject", projectId),

  saveProjectAs: (projectId: number) =>
    ipcRenderer.invoke("saveProjectAs", projectId),

  openDemoMode: (projectId: number) =>
    ipcRenderer.invoke("openDemoMode", projectId),

  configureApp: (projectId: number) =>
    ipcRenderer.invoke("configureApp", projectId),
});
