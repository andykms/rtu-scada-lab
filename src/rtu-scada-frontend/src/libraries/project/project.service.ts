import { Injectable, inject, signal } from '@angular/core';
import { Observable, concatMap, from, last, tap, throwError } from 'rxjs';
import { EDataTypes } from '../../../../electron/types/data-types/base-data-type.type';
import type { IConverterBlock } from '../../../../electron/types/blocks/internal-blocks/converter/converter.type';
import type { IGraphBlock } from '../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import type { IIndicatorsBlock } from '../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import type { IMediaBlock } from '../../../../electron/types/blocks/internal-blocks/media/media.type';
import type { IComBlock } from '../../../../electron/types/blocks/network-blocks/com/com.type';
import type { IDatabaseBlock } from '../../../../electron/types/blocks/network-blocks/database/database.type';
import { EDatabaseQueryType } from '../../../../electron/types/blocks/network-blocks/database/database-query-type';
import type { IHttpClientBlock } from '../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import { EHttpClientResponseDataBodyType } from '../../../../electron/types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-type';
import { EHttpClientResponseDataType } from '../../../../electron/types/blocks/network-blocks/http-client/data-types/response/http-client.response-data-type.type';
import type { IModbusRtuBlock } from '../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type';
import type { IModbusTcpBlock } from '../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type';
import type { IMqttClientBlock } from '../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type';
import type { ITcpClientBlock } from '../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type';
import type { ITcpServerBlock } from '../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type';
import type { IProjectFile } from '../../../../electron/types/project/project-file/project-file.type';
import { ElectronAPIService } from '../electron-api/electron-api.service';
import { IProjectBlockInfo } from './project-block-info.type';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  private readonly electronApi = inject(ElectronAPIService);

  readonly projectFile = signal<IProjectFile | null>(null);
  readonly projectId = signal<number | null>(null);

  setProjectId(id: number | null): void {
    this.projectId.set(id);
  }

  setProjectFile(file: IProjectFile | null): void {
    this.projectFile.set(file);
  }

  nextBlockId(): number {
    const ids = this.listBlocks().map((block) => block.blockId);
    return ids.length ? Math.max(...ids) + 1 : 1;
  }

  listBlocks(): IProjectBlockInfo[] {
    const file = this.projectFile();
    if (!file) {
      return [];
    }

    const { networkBlocks, internalBlocks } = file.projectData.blocks;
    const blocks: IProjectBlockInfo[] = [];

    for (const block of networkBlocks.tcpServers) {
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, block.typeResponseData, 'tcpServer'));
    }
    for (const block of networkBlocks.tcpClients) {
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, block.typeResponseData, 'tcpClient'));
    }
    for (const block of networkBlocks.mqttClients) {
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, block.typeResponseData, 'mqttClient'));
    }
    for (const block of networkBlocks.httpClients) {
      const request =
        block.requestData.typeRequestData === EDataTypes.NOTHING
          ? null
          : block.requestData.typeRequestData;
      blocks.push(this.toInfo(block.blockId, block.blockName, request, this.httpOutputType(block), 'httpClient'));
    }
    for (const block of networkBlocks.modbusRtu) {
      blocks.push(this.toInfo(block.blockId, block.blockName, null, block.typeResponseData, 'modbusRtu'));
    }
    for (const block of networkBlocks.modbusTcp) {
      blocks.push(this.toInfo(block.blockId, block.blockName, null, block.typeResponseData, 'modbusTcp'));
    }
    for (const block of networkBlocks.database) {
      blocks.push(this.toInfo(block.blockId, block.blockName, this.databaseInputType(block), null, 'database'));
    }
    for (const block of networkBlocks.com) {
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, block.typeResponseData, 'comPort'));
    }
    for (const block of internalBlocks.converters) {
      blocks.push(
        this.toInfo(
          block.blockId,
          block.blockName,
          block.inputDataType,
          this.converterOutputType(block),
          'converter',
        ),
      );
    }
    for (const block of internalBlocks.graphs) {
      blocks.push(this.toInfo(block.blockId, block.blockName, null, null, 'graphs'));
    }
    for (const block of internalBlocks.indicators) {
      const response =
        block.typeResponseData === EDataTypes.NOTHING ? null : block.typeResponseData;
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, response, 'indicators'));
    }
    for (const block of internalBlocks.media) {
      blocks.push(this.toInfo(block.blockId, block.blockName, block.typeRequestData, null, 'media'));
    }

    return blocks;
  }

  listProducersOf(dataType: EDataTypes, excludeBlockId?: number): IProjectBlockInfo[] {
    return this.listBlocks().filter(
      (block) =>
        block.typeResponseData === dataType &&
        (excludeBlockId == null || block.blockId !== excludeBlockId),
    );
  }

  listConsumersOf(dataType: EDataTypes, excludeBlockId?: number): IProjectBlockInfo[] {
    return this.listBlocks().filter(
      (block) =>
        block.typeRequestData === dataType &&
        (excludeBlockId == null || block.blockId !== excludeBlockId),
    );
  }

  /** Any block that produces data (type irrelevant) — for signal triggers. */
  listAnyProducers(excludeBlockId?: number): IProjectBlockInfo[] {
    return this.listBlocks().filter(
      (block) =>
        block.typeResponseData != null &&
        (excludeBlockId == null || block.blockId !== excludeBlockId),
    );
  }

  /** Any block that accepts data (type irrelevant). */
  listAnyConsumers(excludeBlockId?: number): IProjectBlockInfo[] {
    return this.listBlocks().filter(
      (block) =>
        block.typeRequestData != null &&
        (excludeBlockId == null || block.blockId !== excludeBlockId),
    );
  }

  createTcpServerBlock(
    block: ITcpServerBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setTcpServerBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createTcpClientBlock(
    block: ITcpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setTcpClientBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createMqttClientBlock(
    block: IMqttClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setMqttClientBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createModbusRtuBlock(
    block: IModbusRtuBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setModbusRtuBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createModbusTcpBlock(
    block: IModbusTcpBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setModbusTcpBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createHttpClientBlock(
    block: IHttpClientBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setHttpClientBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createHttpClientBlocks(
    entries: Array<{
      block: IHttpClientBlock;
      inputBlocks: number[];
      outputBlocks: number[];
    }>,
  ): Observable<IProjectFile> {
    if (!entries.length) {
      return throwError(() => new Error('No HTTP client blocks to create'));
    }
    return from(entries).pipe(
      concatMap((entry) =>
        this.createHttpClientBlock(entry.block, entry.inputBlocks, entry.outputBlocks),
      ),
      last(),
    );
  }

  createDatabaseBlock(
    block: IDatabaseBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setDatabaseBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createComBlock(
    block: IComBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setComBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createConverterBlock(
    block: IConverterBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setConverterBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createGraphBlock(
    block: IGraphBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setGraphBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createIndicatorsBlock(
    block: IIndicatorsBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setIndicatorsBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  createMediaBlock(
    block: IMediaBlock,
    inputBlocks: number[],
    outputBlocks: number[],
  ): Observable<IProjectFile> {
    return this.callCreate((projectId) =>
      this.electronApi.setMediaBlock(projectId, block, inputBlocks, outputBlocks),
    );
  }

  private callCreate(
    call: (projectId: number) => Observable<IProjectFile>,
  ): Observable<IProjectFile> {
    const projectId = this.projectId();
    if (projectId == null || !this.projectFile()) {
      return throwError(() => new Error('Project is not loaded'));
    }
    return call(projectId).pipe(tap((file) => this.projectFile.set(file)));
  }

  private toInfo(
    blockId: number,
    blockName: string,
    typeRequestData: EDataTypes | null,
    typeResponseData: EDataTypes | null,
    kindLabelKey: string,
  ): IProjectBlockInfo {
    return { blockId, blockName, typeRequestData, typeResponseData, kindLabelKey };
  }

  private databaseInputType(block: IDatabaseBlock): EDataTypes | null {
    switch (block.queryType) {
      case EDatabaseQueryType.RAW:
        return block.rawQueryConfig?.typeRequestData ?? null;
      case EDatabaseQueryType.INSERT:
        return block.insertQueryConfig?.typeRequestData ?? null;
      case EDatabaseQueryType.UPDATE:
        return block.updateQueryConfig?.typeRequestData ?? null;
      default:
        return null;
    }
  }

  private converterOutputType(block: IConverterBlock): EDataTypes | null {
    const { convertTypeConfig, inputDataType } = block;
    switch (inputDataType) {
      case EDataTypes.STRING:
        return convertTypeConfig.inputTypeString?.outputType ?? null;
      case EDataTypes.NUMBER:
        return convertTypeConfig.inputTypeNumber?.outputType ?? null;
      case EDataTypes.BYTES:
        return convertTypeConfig.inputTypeBytes?.outputType ?? null;
      case EDataTypes.IMAGE:
        return convertTypeConfig.inputTypeImage?.outputType ?? null;
      case EDataTypes.VIDEO:
        return convertTypeConfig.inputTypeVideo?.outputType ?? null;
      case EDataTypes.ANY_FILE:
        return convertTypeConfig.inputTypeAnyFile?.outputType ?? null;
      case EDataTypes.JSON: {
        const jsonConfig = convertTypeConfig.inputTypeJson;
        if (!jsonConfig) {
          return null;
        }
        if (jsonConfig.jsonFieldConfig.path) {
          return jsonConfig.jsonFieldConfig.outputType;
        }
        return jsonConfig.outputType;
      }
      default:
        return null;
    }
  }

  private httpOutputType(block: IHttpClientBlock): EDataTypes | null {
    switch (block.responseData.type) {
      case EHttpClientResponseDataType.FROM_HEADERS:
        return block.responseData.fromHeaders?.typeRequestData ?? null;
      case EHttpClientResponseDataType.FROM_BODY:
        if (block.responseData.fromBody?.type === EHttpClientResponseDataBodyType.FORM_DATA) {
          return block.responseData.fromBody.formData?.typeRequestData ?? null;
        }
        return block.responseData.fromBody?.nonFormData?.typeRequestData ?? null;
      case EHttpClientResponseDataType.FROM_COOKIE:
        return block.responseData.fromCookies?.typeRequestData ?? null;
      default:
        return null;
    }
  }
}
