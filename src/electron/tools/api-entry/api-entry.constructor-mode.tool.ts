import { IConverterBlock } from "../../types/blocks/internal-blocks/converter/converter.type";
import { IGraphBlock } from "../../types/blocks/internal-blocks/graphs/graphs.type";
import { IIndicatorsBlock } from "../../types/blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "../../types/blocks/internal-blocks/media/media.type";
import { IComBlock } from "../../types/blocks/network-blocks/com/com.type";
import { IHttpClientBlock } from "../../types/blocks/network-blocks/http-client/http-client.type";
import { IModbusRtuBlock } from "../../types/blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "../../types/blocks/network-blocks/modbus/modbus-tcp.type";
import { IMqttClientBlock } from "../../types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import { ITcpClientBlock } from "../../types/blocks/network-blocks/tcp-client/tcp-client.type";
import { ITcpServerBlock } from "../../types/blocks/network-blocks/tcp-server/tcp-server.type";
import { FileManager } from "../file-manager/file-manager.tool";
import { ProjectConstructorManager } from "../project-constructor-manager/project-constructor-manager.tool";
import { SettingsManager } from "../settings-manager/settings-manager.tool";

export class ApiEntryConstructorMode {
  constructor(
    private readonly settings: SettingsManager,
    private readonly fileManager: FileManager,
    private readonly projectContructorManager: ProjectConstructorManager,
  ) {}

  async openProjectFile(filePath: string): Promise<void> {
    const projectFile = await this.fileManager.openProjectFile(filePath);
    this.projectContructorManager.setProjectState(projectFile, filePath);
  }

  async createNewProject(projectName: string): Promise<number> {
    const projectFile = this.projectContructorManager.createNewProject(projectName);
    this.projectContructorManager.setProjectState(projectFile);
    return projectFile.projectId;
  }

  async setTcpServerBlock(
    projectId: number,
    data: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setTcpServerBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setTcpClientBlock(
    projectId: number,
    data: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setTcpClientBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setMqttBlock(
    projectId: number,
    data: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setMqttBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setModbusRtuBlock(
    projectId: number,
    data: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setModbusRtuBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setModbusTcpBlock(
    projectId: number,
    data: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setModbusTcpBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setHttpClientBlock(
    projectId: number,
    data: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setHttpClientBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setComBlock(
    projectId: number,
    data: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setComBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setConverterBlock(
    projectId: number,
    data: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setConverterBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setIndicatorsBlock(
    projectId: number,
    data: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setIndicatorsBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setGraphBlock(
    projectId: number,
    data: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setGraphBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async setMediaBlock(
    projectId: number,
    data: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.projectContructorManager.setMediaBlock(
      projectId,
      data,
      inputBlocks,
      outputBlocks,
    );
  }

  async saveProjectFile(): Promise<void> {
    await this.fileManager.saveProjectFile(
      this.projectContructorManager.currProjectState
    );
  }
}
