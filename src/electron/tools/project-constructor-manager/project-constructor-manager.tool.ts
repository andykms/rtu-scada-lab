import { EAppErrorCodes } from "../../classes/app-error/app-error-codes";
import { AppError } from "../../classes/app-error/app-error.class";
import { IConverterBlock } from "../../types/blocks/internal-blocks/converter/converter.type";
import { IGraphBlock } from "../../types/blocks/internal-blocks/graphs/graphs.type";
import { EGraphType } from "../../types/blocks/internal-blocks/graphs/graph-type";
import { IIndicatorsBlock } from "../../types/blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "../../types/blocks/internal-blocks/media/media.type";
import { IComBlock } from "../../types/blocks/network-blocks/com/com.type";
import { EDatabaseQueryType } from "../../types/blocks/network-blocks/database/database-query-type";
import { IDatabaseBlock } from "../../types/blocks/network-blocks/database/database.type";
import { IHttpClientBlock } from "../../types/blocks/network-blocks/http-client/http-client.type";
import { IModbusRtuBlock } from "../../types/blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "../../types/blocks/network-blocks/modbus/modbus-tcp.type";
import { IMqttClientBlock } from "../../types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import { ENonRealtimeSettingOption } from "../../types/blocks/network-blocks/non-realtime-network-block.type";
import { ITcpClientBlock } from "../../types/blocks/network-blocks/tcp-client/tcp-client.type";
import { ITcpServerBlock } from "../../types/blocks/network-blocks/tcp-server/tcp-server.type";
import { EDataTypes } from "../../types/data-types/base-data-type.type";
import { IProjectFile } from "../../types/project/project-file/project-file.type";
import { ProjectContructorTools } from "./project-contructor-tools.tool";

export class ProjectConstructorManager extends ProjectContructorTools {
  async setTcpServerBlock(
    projectId: number,
    config: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    const bySignal =
      config.timeRequestSettings.timeRequestOption ===
      ENonRealtimeSettingOption.BY_SIGNAL;
    if (inputBlocks.length > 0 && !bySignal) {
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
      bySignal ? inputBlocks : [],
      outputBlocks,
      null,
      config.typeResponseData,
      { allowAnyInputType: bySignal },
    );
  }

  async setModbusTcpBlock(
    projectId: number,
    config: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    const bySignal =
      config.timeRequestSettings.timeRequestOption ===
      ENonRealtimeSettingOption.BY_SIGNAL;
    if (inputBlocks.length > 0 && !bySignal) {
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
      bySignal ? inputBlocks : [],
      outputBlocks,
      null,
      config.typeResponseData,
      { allowAnyInputType: bySignal },
    );
  }

  async setHttpClientBlock(
    projectId: number,
    config: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    const outputDataType = this.getHttpClientOutputDataType(config);
    if (outputDataType == null && outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `В блоке HTTP клиента с id ${config.blockId} не настроен тип отдаваемых данных. Проверьте конфигурацию блока с id ${config.blockId}`,
          EAppErrorCodes.NotFullConfigurations,
        ),
      );
    }
    const bySignal =
      config.timeRequestSettings.timeRequestOption ===
      ENonRealtimeSettingOption.BY_SIGNAL;
    const inputDataType =
      config.requestData.typeRequestData == EDataTypes.NOTHING
        ? null
        : config.requestData.typeRequestData;
    if (inputDataType == null && inputBlocks.length > 0 && !bySignal) {
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
      bySignal ? null : inputDataType,
      outputDataType,
      { allowAnyInputType: bySignal },
    );
  }

  async setComBlock(
    projectId: number,
    config: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    projectId: number,
    config: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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
    this.replaceIncomingEdges(config.blockId, validatedInputBlocks);
  }

  async setMediaBlock(
    projectId: number,
    config: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
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

  async setDatabaseBlock(
    projectId: number,
    config: IDatabaseBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    if (outputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `Блок базы данных с id ${config.blockId} не отдаёт данные в другие блоки`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }
    const inputDataType = this.getDatabaseInputDataType(config);
    if (inputDataType == null && inputBlocks.length > 0) {
      return Promise.reject(
        new AppError(
          `В блоке базы данных с id ${config.blockId} не настроен тип принимаемых данных. Проверьте конфигурацию блока с id ${config.blockId}`,
          EAppErrorCodes.NotFullConfigurations,
        ),
      );
    }
    this.upsertNetworkBlock("database", config);
    await this.syncBlockEdges(
      config.blockId,
      inputBlocks,
      [],
      inputDataType,
      null,
    );
  }

  private getDatabaseInputDataType(config: IDatabaseBlock): EDataTypes | null {
    switch (config.queryType) {
      case EDatabaseQueryType.RAW:
        return config.rawQueryConfig?.typeRequestData ?? null;
      case EDatabaseQueryType.INSERT:
        return config.insertQueryConfig?.typeRequestData ?? null;
      case EDatabaseQueryType.UPDATE:
        return config.updateQueryConfig?.typeRequestData ?? null;
      default:
        return null;
    }
  }

  private ensureProjectId(projectId: number): Promise<void> {
    if (!this.currProjectState) {
      return Promise.reject(
        new AppError(
          "Проект не открыт. Сначала откройте или создайте проект",
          EAppErrorCodes.ProjectNotOpened,
        ),
      );
    }
    if (this.currProjectState.projectId != projectId) {
      return Promise.reject(
        new AppError(
          `Переданный projectId ${projectId} не совпадает с id текущего проекта ${this.currProjectState.projectId}`,
          EAppErrorCodes.WrongProjectId,
        ),
      );
    }
    return Promise.resolve();
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

  async connectBlocks(
    projectId: number,
    fromBlockId: number,
    toBlockId: number,
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    this.ensureSceneState();
    if (fromBlockId === toBlockId) {
      return Promise.reject(
        new AppError(
          `Блок с id ${fromBlockId} не может быть связан сам с собой`,
          EAppErrorCodes.DataTypesNotCompatible,
        ),
      );
    }

    const outputType = this.resolveBlockOutputType(fromBlockId);
    if (outputType == null) {
      return Promise.reject(
        new AppError(
          `Блок с id ${fromBlockId} не отдаёт данные`,
          EAppErrorCodes.BlockNotAcceptData,
        ),
      );
    }

    const graphBlock = this.findGraphBlock(toBlockId);
    if (graphBlock) {
      await this.ensureGraphSource(graphBlock, fromBlockId, outputType);
    }

    const validated = await this.updateEdgesByOutputBlocks(outputType, fromBlockId, [
      toBlockId,
    ]);
    if (!this.currProjectState.projectData.edges[fromBlockId]) {
      this.currProjectState.projectData.edges[fromBlockId] = [];
    }
    for (const targetId of validated) {
      if (
        !this.currProjectState.projectData.edges[fromBlockId].some(
          (edge) => edge == targetId,
        )
      ) {
        this.currProjectState.projectData.edges[fromBlockId].push(targetId);
      }
    }
  }

  async disconnectBlocks(
    projectId: number,
    fromBlockId: number,
    toBlockId: number,
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    this.ensureSceneState();
    const outs = this.currProjectState.projectData.edges[fromBlockId];
    if (outs) {
      this.currProjectState.projectData.edges[fromBlockId] = outs.filter(
        (id) => id !== toBlockId,
      );
    }
    const graphBlock = this.findGraphBlock(toBlockId);
    if (graphBlock) {
      this.removeGraphSource(graphBlock, fromBlockId);
    }
  }

  async deleteBlocks(projectId: number, blockIds: number[]): Promise<void> {
    await this.ensureProjectId(projectId);
    this.ensureSceneState();
    const idSet = new Set(blockIds.filter((id) => Number.isFinite(id) && id > 0));
    if (idSet.size === 0) {
      return;
    }

    const { blocks } = this.currProjectState.projectData;
    const nb = blocks.networkBlocks;
    nb.tcpServers = nb.tcpServers.filter((b) => !idSet.has(b.blockId));
    nb.tcpClients = nb.tcpClients.filter((b) => !idSet.has(b.blockId));
    nb.mqttClients = nb.mqttClients.filter((b) => !idSet.has(b.blockId));
    nb.httpClients = nb.httpClients.filter((b) => !idSet.has(b.blockId));
    nb.modbusRtu = nb.modbusRtu.filter((b) => !idSet.has(b.blockId));
    nb.modbusTcp = nb.modbusTcp.filter((b) => !idSet.has(b.blockId));
    nb.database = nb.database.filter((b) => !idSet.has(b.blockId));
    nb.com = nb.com.filter((b) => !idSet.has(b.blockId));

    const ib = blocks.internalBlocks;
    ib.converters = ib.converters.filter((b) => !idSet.has(b.blockId));
    ib.graphs = ib.graphs.filter((b) => !idSet.has(b.blockId));
    ib.indicators = ib.indicators.filter((b) => !idSet.has(b.blockId));
    ib.media = ib.media.filter((b) => !idSet.has(b.blockId));

    blocks.blockIds = (blocks.blockIds ?? []).filter((id) => !idSet.has(id));
    blocks.blockNames = (blocks.blockNames ?? []).filter((id) => !idSet.has(id));

    const edges = this.currProjectState.projectData.edges;
    for (const id of idSet) {
      delete edges[id];
    }
    for (const fromKey of Object.keys(edges)) {
      const fromId = Number(fromKey);
      edges[fromId] = (edges[fromId] ?? []).filter((toId) => !idSet.has(toId));
    }

    const positions = this.currProjectState.projectData.scene.nodePositions;
    for (const key of Object.keys(positions)) {
      if (idSet.has(Number(key))) {
        delete positions[key];
        continue;
      }
      if (key.startsWith("http:")) {
        const primaryId = Number(key.slice(5));
        if (idSet.has(primaryId)) {
          delete positions[key];
        }
      }
    }

    for (const graph of ib.graphs) {
      for (const id of idSet) {
        this.removeGraphSource(graph, id);
      }
    }

    for (const indicator of ib.indicators) {
      this.cleanIndicatorOutputRefs(indicator, idSet);
    }
  }

  private cleanIndicatorOutputRefs(
    indicator: IIndicatorsBlock,
    deletedIds: Set<number>,
  ): void {
    const filterTriggers = <
      T extends { triggers?: { outputBlockId: number }[] },
    >(
      config: T | null,
    ): void => {
      if (!config?.triggers) {
        return;
      }
      config.triggers = config.triggers.filter(
        (trigger) => !deletedIds.has(trigger.outputBlockId),
      );
    };
    filterTriggers(indicator.numberConfig);
    filterTriggers(indicator.arrayNumbersConfig?.numberConfig ?? null);
    this.upsertInternalBlock("indicators", indicator);
  }

  async setSceneNodePositions(
    projectId: number,
    positions: { [nodeId: string]: { x: number; y: number } },
  ): Promise<void> {
    await this.ensureProjectId(projectId);
    this.ensureSceneState();
    this.currProjectState.projectData.scene.nodePositions = {
      ...this.currProjectState.projectData.scene.nodePositions,
      ...positions,
    };
  }

  private ensureSceneState(): void {
    if (!this.currProjectState.projectData.scene) {
      this.currProjectState.projectData.scene = { nodePositions: {} };
    }
    if (!this.currProjectState.projectData.scene.nodePositions) {
      this.currProjectState.projectData.scene.nodePositions = {};
    }
  }

  private findGraphBlock(blockId: number): IGraphBlock | null {
    return (
      this.currProjectState.projectData.blocks.internalBlocks.graphs.find(
        (block) => block.blockId === blockId,
      ) ?? null
    );
  }

  private async ensureGraphSource(
    graphBlock: IGraphBlock,
    sourceBlockId: number,
    outputType: EDataTypes,
  ): Promise<void> {
    if (outputType !== EDataTypes.NUMBER && outputType !== EDataTypes.STRING) {
      return Promise.reject(
        new AppError(
          `Блок графиков с id ${graphBlock.blockId} принимает только число или строку`,
          EAppErrorCodes.DataTypesNotCompatible,
        ),
      );
    }
    const existing = this.getGraphSources(graphBlock).find(
      (source) => source.sourceBlockId === sourceBlockId,
    );
    if (existing) {
      existing.typeRequestData = outputType;
      this.upsertInternalBlock("graphs", graphBlock);
      return;
    }

    switch (graphBlock.graphType) {
      case EGraphType.LINE: {
        if (!graphBlock.lineConfig) {
          graphBlock.lineConfig = { sources: [] };
        }
        graphBlock.lineConfig.sources.push({
          sourceBlockId,
          typeRequestData: outputType,
          unit: null,
        });
        break;
      }
      case EGraphType.BAR: {
        if (!graphBlock.barConfig) {
          graphBlock.barConfig = { columns: [] };
        }
        graphBlock.barConfig.columns.push({
          sourceBlockId,
          typeRequestData: outputType,
          columnName: `col_${sourceBlockId}`,
        });
        break;
      }
      case EGraphType.GROUPED_BAR: {
        if (!graphBlock.groupedBarConfig) {
          graphBlock.groupedBarConfig = { sources: [] };
        }
        graphBlock.groupedBarConfig.sources.push({
          sourceBlockId,
          typeRequestData: outputType,
        });
        break;
      }
      case EGraphType.HISTOGRAM: {
        if (!graphBlock.histogramConfig) {
          graphBlock.histogramConfig = {
            sources: [],
            defaultStartValue: 0,
            defaultEndValue: 100,
            defaultStep: 10,
          };
        }
        graphBlock.histogramConfig.sources.push({
          sourceBlockId,
          typeRequestData: outputType,
        });
        break;
      }
    }
    this.upsertInternalBlock("graphs", graphBlock);
  }

  private removeGraphSource(graphBlock: IGraphBlock, sourceBlockId: number): void {
    switch (graphBlock.graphType) {
      case EGraphType.LINE:
        if (graphBlock.lineConfig) {
          graphBlock.lineConfig.sources = graphBlock.lineConfig.sources.filter(
            (source) => source.sourceBlockId !== sourceBlockId,
          );
        }
        break;
      case EGraphType.BAR:
        if (graphBlock.barConfig) {
          graphBlock.barConfig.columns = graphBlock.barConfig.columns.filter(
            (column) => column.sourceBlockId !== sourceBlockId,
          );
        }
        break;
      case EGraphType.GROUPED_BAR:
        if (graphBlock.groupedBarConfig) {
          graphBlock.groupedBarConfig.sources =
            graphBlock.groupedBarConfig.sources.filter(
              (source) => source.sourceBlockId !== sourceBlockId,
            );
        }
        break;
      case EGraphType.HISTOGRAM:
        if (graphBlock.histogramConfig) {
          graphBlock.histogramConfig.sources =
            graphBlock.histogramConfig.sources.filter(
              (source) => source.sourceBlockId !== sourceBlockId,
            );
        }
        break;
    }
    this.upsertInternalBlock("graphs", graphBlock);
  }

  private resolveBlockOutputType(blockId: number): EDataTypes | null {
    const nb = this.currProjectState.projectData.blocks.networkBlocks;
    const tcpServer = nb.tcpServers.find((b) => b.blockId === blockId);
    if (tcpServer) {
      return tcpServer.typeResponseData;
    }
    const tcpClient = nb.tcpClients.find((b) => b.blockId === blockId);
    if (tcpClient) {
      return tcpClient.typeResponseData;
    }
    const mqtt = nb.mqttClients.find((b) => b.blockId === blockId);
    if (mqtt) {
      return mqtt.typeResponseData;
    }
    const http = nb.httpClients.find((b) => b.blockId === blockId);
    if (http) {
      return this.getHttpClientOutputDataType(http);
    }
    const modbusRtu = nb.modbusRtu.find((b) => b.blockId === blockId);
    if (modbusRtu) {
      return modbusRtu.typeResponseData;
    }
    const modbusTcp = nb.modbusTcp.find((b) => b.blockId === blockId);
    if (modbusTcp) {
      return modbusTcp.typeResponseData;
    }
    const com = nb.com.find((b) => b.blockId === blockId);
    if (com) {
      return com.typeResponseData;
    }
    if (nb.database.some((b) => b.blockId === blockId)) {
      return null;
    }

    const ib = this.currProjectState.projectData.blocks.internalBlocks;
    const converter = ib.converters.find((b) => b.blockId === blockId);
    if (converter) {
      return this.getConverterOutputDataType(converter);
    }
    const indicator = ib.indicators.find((b) => b.blockId === blockId);
    if (indicator) {
      return indicator.typeResponseData === EDataTypes.NOTHING
        ? null
        : indicator.typeResponseData;
    }
    return null;
  }
}
