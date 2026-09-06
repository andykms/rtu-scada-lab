import { EAppErrorCodes } from "../../classes/app-error/app-error-codes";
import { AppError } from "../../classes/app-error/app-error.class";
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
import { EDataTypes } from "../../types/data-types/base-data-type.type";
import { IProjectFile } from "../../types/project/project-file/project-file.type";
import { ProjectContructorTools } from "./project-contructor-tools.tool";

export class ProjectConstructorManager extends ProjectContructorTools {
  constructor(currProjectState: IProjectFile) {
    super(currProjectState);
  }

  async setTcpServerBlock(
    config: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    this.upsertNetworkBlock("tcpServers", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.typeRequestData,
      config.typeResponseData,
    );
  }

  async setTcpClientBlock(
    config: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    this.upsertNetworkBlock("tcpClients", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.typeRequestData,
      config.typeResponseData,
    );
  }

  async setMqttBlock(
    config: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    this.upsertNetworkBlock("mqttClients", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.typeRequestData,
      config.typeResponseData,
    );
  }

  async setModbusRtuBlock(
    config: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    if (inputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок протокола Modbus RTU с id ${config.blockId} не принимает данные`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertNetworkBlock("modbusRtu", config);
    await this.syncBlockEdges(
      config.blockId,
      [],
      outputBlocks,
      null,
      config.typeResponseData,
    );
  }

  async setModbusTcpBlock(
    config: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    if (inputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок протокола Modbus TCP с id ${config.blockId} не принимает данные`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertNetworkBlock("modbusTcp", config);
    await this.syncBlockEdges(
      config.blockId,
      [],
      outputBlocks,
      null,
      config.typeResponseData,
    );
  }

  async setHttpClientBlock(
    config: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    const outputDataType = this.getHttpClientOutputDataType(config);
    if (outputDataType == null && outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `В блоке HTTP клиента с id ${config.blockId} не настроен тип отдаваемых данных. Проверьте конфигурацию блока с id ${config.blockId}`,
          EAppErrorCodes.NotFullConfigurations,
        ),
      );
    }
    const inputDataType =
      config.requestData.typeRequestData == EDataTypes.NOTHING
        ? null
        : config.requestData.typeRequestData;
    if (inputDataType == null && inputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок HTTP клиента с id ${config.blockId} не принимает данные от других блоков`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertNetworkBlock("httpClients", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      inputDataType,
      outputDataType,
    );
  }

  async setComBlock(
    config: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    this.upsertNetworkBlock("com", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.typeRequestData,
      config.typeResponseData,
    );
  }

  async setConverterBlock(
    config: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    const outputDataType = this.getConverterOutputDataType(config);
    if (outputDataType == null) {
      return Promise.reject(
        new AppError(
          `В блоке преобразователя с id ${config.blockId} не настроен тип отдаваемых данных. Проверьте конфигурацию блока с id ${config.blockId}`,
          EAppErrorCodes.NotFullConfigurations,
        ),
      );
    }
    this.upsertInternalBlock("converters", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.inputDataType,
      outputDataType,
    );
  }

  async setIndicatorsBlock(
    config: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    const outputDataType =
      config.typeResponseData == EDataTypes.NOTHING
        ? null
        : config.typeResponseData;
    if (outputDataType == null && outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок показателей с id ${config.blockId} не отдаёт данные в другие блоки`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertInternalBlock("indicators", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      outputBlocks,
      config.typeRequestData,
      outputDataType,
    );
  }

  async setGraphBlock(
    config: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    if (outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок графиков с id ${config.blockId} не отдаёт данные в другие блоки`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertInternalBlock("graphs", config);

    const graphSources = this.getGraphSources(config);
    const validatedInputBlocks: number[] = [];
    try {
      for (const inputBlockId of inputBlocks) {
        const graphSource = graphSources.find(
          (source) => source.sourceBlockId == inputBlockId,
        );
        if (!graphSource) {
          return Promise.reject(
            new AppError(
              `Блок графиков с id ${config.blockId} не принимает данные от блока с id ${inputBlockId}.
                        Добавьте блок с id ${inputBlockId} в источники графика
                        `,
              EAppErrorCodes.BlockNotAcceptData,
            ),
          );
        }
        const edges = await this.updateEdgesByInputBlocks(
          graphSource.typeRequestData,
          config.blockId,
          [inputBlockId],
        );
        validatedInputBlocks.push(...edges);
      }
    } catch (error) {
      return Promise.reject(error);
    }

    this.currProjectState.projectData.edges[config.blockId] = [];
    for (const inputBlockId of validatedInputBlocks) {
      if (!this.currProjectState.projectData.edges[inputBlockId]) {
        this.currProjectState.projectData.edges[inputBlockId] = [];
      }
      if (
        !this.currProjectState.projectData.edges[inputBlockId].some(
          (edge) => edge == config.blockId,
        )
      ) {
        this.currProjectState.projectData.edges[inputBlockId].push(
          config.blockId,
        );
      }
    }
  }

  async setMediaBlock(
    config: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    if (outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок медиа с id ${config.blockId} не отдаёт данные в другие блоки`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    this.upsertInternalBlock("media", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      [],
      config.typeRequestData,
      null,
    );
  }

  private upsertNetworkBlock<
    K extends keyof IProjectFile["projectData"]["blocks"]["networkBlocks"],
  >(
    key: K,
    config: IProjectFile["projectData"]["blocks"]["networkBlocks"][K][number],
  ): void {
    const blocks = this.currProjectState.projectData.blocks.networkBlocks[
      key
    ] as { blockId: number }[];
    const currBlockIndex = blocks.findIndex(
      (block) => block.blockId == config.blockId,
    );
    if (currBlockIndex == -1) {
      blocks.push(config);
    } else {
      blocks[currBlockIndex] = config;
    }
  }

  private upsertInternalBlock<
    K extends keyof IProjectFile["projectData"]["blocks"]["internalBlocks"],
  >(
    key: K,
    config: IProjectFile["projectData"]["blocks"]["internalBlocks"][K][number],
  ): void {
    const blocks = this.currProjectState.projectData.blocks.internalBlocks[
      key
    ] as { blockId: number }[];
    const currBlockIndex = blocks.findIndex(
      (block) => block.blockId == config.blockId,
    );
    if (currBlockIndex == -1) {
      blocks.push(config);
    } else {
      blocks[currBlockIndex] = config;
    }
  }
}
