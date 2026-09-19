import { EAppErrorCodes } from "../../classes/app-error/app-error-codes";
import { AppError } from "../../classes/app-error/app-error.class";
import { IConverterBlock } from "../../types/blocks/internal-blocks/converter/converter.type";
import { IGraphSource } from "../../types/blocks/internal-blocks/graphs/data-types/graph-configs/graphs.source.type";
import { EGraphType } from "../../types/blocks/internal-blocks/graphs/graph-type";
import { IGraphBlock } from "../../types/blocks/internal-blocks/graphs/graphs.type";
import { IIndicatorsBlock } from "../../types/blocks/internal-blocks/indicators/indicators.type";
import { IMediaBlock } from "../../types/blocks/internal-blocks/media/media.type";
import { IComBlock } from "../../types/blocks/network-blocks/com/com.type";
import { EDatabaseQueryType } from "../../types/blocks/network-blocks/database/database-query-type";
import { IDatabaseBlock } from "../../types/blocks/network-blocks/database/database.type";
import { EHttpClientResponseDataBodyType } from "../../types/blocks/network-blocks/http-client/data-types/response/body/http-client.response-data-body-type";
import { EHttpClientResponseDataType } from "../../types/blocks/network-blocks/http-client/data-types/response/http-client.response-data-type.type";
import { IHttpClientBlock } from "../../types/blocks/network-blocks/http-client/http-client.type";
import { IModbusRtuBlock } from "../../types/blocks/network-blocks/modbus/modbus-rtu.type";
import { IModbusTcpBlock } from "../../types/blocks/network-blocks/modbus/modbus-tcp.type";
import { IMqttClientBlock } from "../../types/blocks/network-blocks/mqtt-client/mqtt-client.type";
import { ITcpClientBlock } from "../../types/blocks/network-blocks/tcp-client/tcp-client.type";
import { ITcpServerBlock } from "../../types/blocks/network-blocks/tcp-server/tcp-server.type";
import { EDataTypes } from "../../types/data-types/base-data-type.type";
import { IProjectFile } from "../../types/project/project-file/project-file.type";

export abstract class ProjectContructorTools {
  protected networkBlocks: (keyof IProjectFile["projectData"]["blocks"]["networkBlocks"])[] =
    [];

  protected internalBlocks: (keyof IProjectFile["projectData"]["blocks"]["internalBlocks"])[] =
    [];

  public currProjectState!: IProjectFile;

  setProjectState(projectState: IProjectFile, path?: string): void {
    this.currProjectState = projectState;
    if (path) {
      this.currProjectState.path = path;
    }
    this.refreshBlockCatalogKeys();
  }

  createNewProject(projectName: string): IProjectFile {
    const now = new Date().toISOString();
    const project: IProjectFile = {
      projectLab: "rtu-scada-lab_alpha",
      projectLabVersion: "0.0.1",
      projectId: Date.now(),
      projectName,
      createdAt: now,
      updatedAt: now,
      path: "",
      projectData: {
        blocks: {
          blockIds: [],
          blockNames: [],
          networkBlocks: {
            tcpServers: [],
            tcpClients: [],
            mqttClients: [],
            httpClients: [],
            modbusRtu: [],
            modbusTcp: [],
            database: [],
            com: [],
          },
          internalBlocks: {
            converters: [],
            graphs: [],
            indicators: [],
            media: [],
          },
        },
        edges: {},
      },
    };
    return project;
  }

  constructor() {}

  private refreshBlockCatalogKeys(): void {
    this.networkBlocks = Object.keys(
      this.currProjectState.projectData.blocks.networkBlocks,
    ) as (keyof IProjectFile["projectData"]["blocks"]["networkBlocks"])[];
    this.internalBlocks = Object.keys(
      this.currProjectState.projectData.blocks.internalBlocks,
    ) as (keyof IProjectFile["projectData"]["blocks"]["internalBlocks"])[];
  }

  protected updateEdgesByOutputBlocks(
    currOutputDataType: EDataTypes,
    currBlockId: number,
    outputBlocks: number[],
  ): Promise<number[]> {
    const newEdges: number[] = [];
    for (const outputBlockId of outputBlocks) {
      let isFinded = false;
      for (const block of this.networkBlocks) {
        const findedBlock =
          this.currProjectState.projectData.blocks.networkBlocks[block].find(
            (block) => block.blockId == outputBlockId,
          );
        if (findedBlock) {
          switch (block) {
            case "com": {
              if (
                (findedBlock as IComBlock).typeRequestData != currOutputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "database": {
              const databaseBlock = findedBlock as IDatabaseBlock;
              switch (databaseBlock.queryType) {
                case EDatabaseQueryType.RAW: {
                  if (
                    databaseBlock.rawQueryConfig?.typeRequestData !=
                    currOutputDataType
                  ) {
                    return Promise.reject(
                      new AppError(
                        `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                        EAppErrorCodes.DataTypesNotCompatible,
                      ),
                    );
                  }
                  break;
                }
                case EDatabaseQueryType.INSERT: {
                  if (
                    databaseBlock.insertQueryConfig?.typeRequestData !=
                    currOutputDataType
                  ) {
                    return Promise.reject(
                      new AppError(
                        `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                        EAppErrorCodes.DataTypesNotCompatible,
                      ),
                    );
                  }
                  break;
                }
                case EDatabaseQueryType.UPDATE: {
                  if (
                    databaseBlock.updateQueryConfig?.typeRequestData !=
                    currOutputDataType
                  ) {
                    return Promise.reject(
                      new AppError(
                        `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                        EAppErrorCodes.DataTypesNotCompatible,
                      ),
                    );
                  }
                  break;
                }
                default: {
                  return Promise.reject(
                    new AppError(
                      `В блоке базы данных с id ${findedBlock.blockId} не выбран тип запроса. Проверьте конфигурацию блока с id ${findedBlock.blockId}`,
                      EAppErrorCodes.NotFullConfigurations,
                    ),
                  );
                }
              }
              break;
            }
            case "httpClients": {
              const httpBlock = findedBlock as IHttpClientBlock;
              if (httpBlock.requestData.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "modbusRtu": {
              return Promise.reject(
                new AppError(
                  `Блок протокола Modbus RTU с id ${findedBlock.blockId} не принимает данные`,
                  EAppErrorCodes.BlockNotAcceptData,
                ),
              );
            }
            case "modbusTcp": {
              return Promise.reject(
                new AppError(
                  `Блок протокола Modbus TCP с id ${findedBlock.blockId} не принимает данные`,
                  EAppErrorCodes.BlockNotAcceptData,
                ),
              );
            }
            case "mqttClients": {
              const mqttClientBlock = findedBlock as IMqttClientBlock;
              if (mqttClientBlock.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "tcpClients": {
              const tcpClientBlock = findedBlock as ITcpClientBlock;
              if (tcpClientBlock.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "tcpServers": {
              const tcpServerBlock = findedBlock as ITcpServerBlock;
              if (tcpServerBlock.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            default: {
              return Promise.reject(
                new AppError(
                  `Блок с id ${findedBlock.blockId} найден, однако его тип неопознан. Рекомендуется перезапустить приложение`,
                  EAppErrorCodes.AppRuntime,
                ),
              );
            }
          }
          isFinded = true;
          newEdges.push(outputBlockId);
          break;
        }
      }
      if (isFinded) {
        continue;
      }
      for (const block of this.internalBlocks) {
        const findedBlock =
          this.currProjectState.projectData.blocks.internalBlocks[block].find(
            (block) => block.blockId == outputBlockId,
          );
        if (findedBlock) {
          switch (block) {
            case "converters": {
              const converterBlock = findedBlock as IConverterBlock;
              if (converterBlock.inputDataType != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "graphs": {
              const graphBlock = findedBlock as IGraphBlock;
              let graphSources: IGraphSource[] = [];
              switch (graphBlock.graphType) {
                case EGraphType.LINE: {
                  graphSources = graphBlock.lineConfig?.sources ?? [];
                  break;
                }
                case EGraphType.BAR: {
                  graphSources = graphBlock.barConfig?.columns ?? [];
                  break;
                }
                case EGraphType.GROUPED_BAR: {
                  graphSources = graphBlock.groupedBarConfig?.sources ?? [];
                  break;
                }
                case EGraphType.HISTOGRAM: {
                  graphSources = graphBlock.histogramConfig?.sources ?? [];
                  break;
                }
              }
              const graphSource = graphSources.find(
                (source) => source.sourceBlockId == currBlockId,
              );
              if (!graphSource) {
                return Promise.reject(
                  new AppError(
                    `Блок графиков с id ${findedBlock.blockId} не принимает данные от блока с id ${currBlockId}.
                        Добавьте блок с id ${currBlockId} в источники графика
                        `,
                    EAppErrorCodes.BlockNotAcceptData,
                  ),
                );
              }
              if (graphSource.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации у источника блока с id ${currBlockId}
                        в блоке графиков с id ${findedBlock.blockId}
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "indicators": {
              const indicatorsBlock = findedBlock as IIndicatorsBlock;
              if (indicatorsBlock.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "media": {
              const mediaBlock = findedBlock as IMediaBlock;
              if (mediaBlock.typeRequestData != currOutputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип получаемой информации в блоке с id ${findedBlock.blockId} 
                        на тип отправляемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            default: {
              return Promise.reject(
                new AppError(
                  `Блок с id ${findedBlock.blockId} найден, однако его тип неопознан. Рекомендуется перезапустить приложение`,
                  EAppErrorCodes.AppRuntime,
                ),
              );
            }
          }
          isFinded = true;
          newEdges.push(outputBlockId);
          break;
        }
      }
      if (!isFinded) {
        return Promise.reject(
          new AppError(
            `Блок-получатель с id ${outputBlockId} не найден. Перепроверьте блоки и их конфигурации`,
            EAppErrorCodes.NotFoundBlockId,
          ),
        );
      }
    }
    return Promise.resolve(newEdges);
  }

  protected updateEdgesByInputBlocks(
    currInputDataType: EDataTypes,
    currBlockId: number,
    inputBlocks: number[],
  ): Promise<number[]> {
    const newEdges: number[] = [];
    for (const inputBlockId of inputBlocks) {
      let isFinded = false;
      for (const block of this.networkBlocks) {
        const findedBlock =
          this.currProjectState.projectData.blocks.networkBlocks[block].find(
            (block) => block.blockId == inputBlockId,
          );
        if (findedBlock) {
          switch (block) {
            case "com": {
              if (
                (findedBlock as IComBlock).typeResponseData != currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "database": {
              return Promise.reject(
                new AppError(
                  `Блок базы данных с id ${findedBlock.blockId} не отдаёт данные в другие блоки`,
                  EAppErrorCodes.BlockNotAcceptData,
                ),
              );
            }
            case "httpClients": {
              const httpBlock = findedBlock as IHttpClientBlock;
              let responseDataType: EDataTypes | null = null;
              switch (httpBlock.responseData.type) {
                case EHttpClientResponseDataType.FROM_HEADERS: {
                  responseDataType =
                    httpBlock.responseData.fromHeaders?.typeRequestData ?? null;
                  break;
                }
                case EHttpClientResponseDataType.FROM_BODY: {
                  if (
                    httpBlock.responseData.fromBody?.type ==
                    EHttpClientResponseDataBodyType.FORM_DATA
                  ) {
                    responseDataType =
                      httpBlock.responseData.fromBody.formData
                        ?.typeRequestData ?? null;
                  } else {
                    responseDataType =
                      httpBlock.responseData.fromBody?.nonFormData
                        ?.typeRequestData ?? null;
                  }
                  break;
                }
                case EHttpClientResponseDataType.FROM_COOKIE: {
                  responseDataType =
                    httpBlock.responseData.fromCookies?.typeRequestData ?? null;
                  break;
                }
              }
              if (responseDataType == null) {
                return Promise.reject(
                  new AppError(
                    `В блоке HTTP клиента с id ${findedBlock.blockId} не настроен тип отдаваемых данных. Проверьте конфигурацию блока с id ${findedBlock.blockId}`,
                    EAppErrorCodes.NotFullConfigurations,
                  ),
                );
              }
              if (responseDataType != currInputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "modbusRtu": {
              if (
                (findedBlock as IModbusRtuBlock).typeResponseData !=
                currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "modbusTcp": {
              if (
                (findedBlock as IModbusTcpBlock).typeResponseData !=
                currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "mqttClients": {
              if (
                (findedBlock as IMqttClientBlock).typeResponseData !=
                currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "tcpClients": {
              if (
                (findedBlock as ITcpClientBlock).typeResponseData !=
                currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "tcpServers": {
              if (
                (findedBlock as ITcpServerBlock).typeResponseData !=
                currInputDataType
              ) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            default: {
              return Promise.reject(
                new AppError(
                  `Блок с id ${findedBlock.blockId} найден, однако его тип неопознан. Рекомендуется перезапустить приложение`,
                  EAppErrorCodes.AppRuntime,
                ),
              );
            }
          }
          isFinded = true;
          newEdges.push(inputBlockId);
          break;
        }
      }
      if (isFinded) {
        continue;
      }
      for (const block of this.internalBlocks) {
        const findedBlock =
          this.currProjectState.projectData.blocks.internalBlocks[block].find(
            (block) => block.blockId == inputBlockId,
          );
        if (findedBlock) {
          switch (block) {
            case "converters": {
              const converterBlock = findedBlock as IConverterBlock;
              const converterOutputDataType =
                this.getConverterOutputDataType(converterBlock);
              if (converterOutputDataType == null) {
                return Promise.reject(
                  new AppError(
                    `В блоке преобразователя с id ${findedBlock.blockId} не настроен тип отдаваемых данных. Проверьте конфигурацию блока с id ${findedBlock.blockId}`,
                    EAppErrorCodes.NotFullConfigurations,
                  ),
                );
              }
              if (converterOutputDataType != currInputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "graphs": {
              return Promise.reject(
                new AppError(
                  `Блок графиков с id ${findedBlock.blockId} не отдаёт данные в другие блоки`,
                  EAppErrorCodes.BlockNotAcceptData,
                ),
              );
            }
            case "indicators": {
              const indicatorsBlock = findedBlock as IIndicatorsBlock;
              const triggers =
                indicatorsBlock.numberConfig?.triggers ??
                indicatorsBlock.arrayNumbersConfig?.numberConfig.triggers ??
                [];
              const indicatorTrigger = triggers.find(
                (trigger) => trigger.outputBlockId == currBlockId,
              );
              if (!indicatorTrigger) {
                return Promise.reject(
                  new AppError(
                    `Блок показателей с id ${findedBlock.blockId} не отдаёт данные в блок с id ${currBlockId}.
                        Добавьте блок с id ${currBlockId} в триггеры показателя
                        `,
                    EAppErrorCodes.BlockNotAcceptData,
                  ),
                );
              }
              if (indicatorsBlock.typeResponseData != currInputDataType) {
                return Promise.reject(
                  new AppError(
                    `Типы блоков с id ${findedBlock.blockId} и ${currBlockId} не совместимы.
                        Измените тип отправляемой информации в блоке с id ${findedBlock.blockId}
                        на тип получаемой информации в текущем блоке с id ${currBlockId}
                        `,
                    EAppErrorCodes.DataTypesNotCompatible,
                  ),
                );
              }
              break;
            }
            case "media": {
              return Promise.reject(
                new AppError(
                  `Блок медиа с id ${findedBlock.blockId} не отдаёт данные в другие блоки`,
                  EAppErrorCodes.BlockNotAcceptData,
                ),
              );
            }
            default: {
              return Promise.reject(
                new AppError(
                  `Блок с id ${findedBlock.blockId} найден, однако его тип неопознан. Рекомендуется перезапустить приложение`,
                  EAppErrorCodes.AppRuntime,
                ),
              );
            }
          }
          isFinded = true;
          newEdges.push(inputBlockId);
          break;
        }
      }
      if (!isFinded) {
        return Promise.reject(
          new AppError(
            `Блок-отправитель с id ${inputBlockId} не найден. Перепроверьте блоки и их конфигурации`,
            EAppErrorCodes.NotFoundBlockId,
          ),
        );
      }
    }
    return Promise.resolve(newEdges);
  }

  protected getConverterOutputDataType(
    converterBlock: IConverterBlock,
  ): EDataTypes | null {
    const { convertTypeConfig, inputDataType } = converterBlock;
    switch (inputDataType) {
      case EDataTypes.STRING: {
        return convertTypeConfig.inputTypeString?.outputType ?? null;
      }
      case EDataTypes.NUMBER: {
        return convertTypeConfig.inputTypeNumber?.outputType ?? null;
      }
      case EDataTypes.BYTES: {
        return convertTypeConfig.inputTypeBytes?.outputType ?? null;
      }
      case EDataTypes.IMAGE: {
        return convertTypeConfig.inputTypeImage?.outputType ?? null;
      }
      case EDataTypes.VIDEO: {
        return convertTypeConfig.inputTypeVideo?.outputType ?? null;
      }
      case EDataTypes.AUDIO: {
        return convertTypeConfig.inputTypeAudio?.outputType ?? null;
      }
      case EDataTypes.ANY_FILE: {
        return convertTypeConfig.inputTypeAnyFile?.outputType ?? null;
      }
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
      case EDataTypes.ARRAY_NUMBERS: {
        return convertTypeConfig.inputTypeArrayNumbers?.outputType ?? null;
      }
      default: {
        return null;
      }
    }
  }

  protected getHttpClientOutputDataType(
    httpBlock: IHttpClientBlock,
  ): EDataTypes | null {
    switch (httpBlock.responseData.type) {
      case EHttpClientResponseDataType.FROM_HEADERS: {
        return httpBlock.responseData.fromHeaders?.typeRequestData ?? null;
      }
      case EHttpClientResponseDataType.FROM_BODY: {
        if (
          httpBlock.responseData.fromBody?.type ==
          EHttpClientResponseDataBodyType.FORM_DATA
        ) {
          return (
            httpBlock.responseData.fromBody.formData?.typeRequestData ?? null
          );
        }
        return (
          httpBlock.responseData.fromBody?.nonFormData?.typeRequestData ?? null
        );
      }
      case EHttpClientResponseDataType.FROM_COOKIE: {
        return httpBlock.responseData.fromCookies?.typeRequestData ?? null;
      }
      default: {
        return null;
      }
    }
  }

  protected getGraphSources(graphBlock: IGraphBlock): IGraphSource[] {
    switch (graphBlock.graphType) {
      case EGraphType.LINE: {
        return graphBlock.lineConfig?.sources ?? [];
      }
      case EGraphType.BAR: {
        return graphBlock.barConfig?.columns ?? [];
      }
      case EGraphType.GROUPED_BAR: {
        return graphBlock.groupedBarConfig?.sources ?? [];
      }
      case EGraphType.HISTOGRAM: {
        return graphBlock.histogramConfig?.sources ?? [];
      }
      default: {
        return [];
      }
    }
  }

  protected async syncBlockEdges(
    currBlockId: number,
    inputBlocks: number[],
    outputBlocks: number[],
    inputDataType: EDataTypes | null,
    outputDataType: EDataTypes | null,
    options?: { allowAnyInputType?: boolean },
  ): Promise<void> {
    try {
      const allowAnyInput = options?.allowAnyInputType === true;
      const [newEdgesOutputBlocks, newEdgesInputBlocks] = await Promise.all([
        outputDataType == null
          ? Promise.resolve([] as number[])
          : this.updateEdgesByOutputBlocks(
              outputDataType,
              currBlockId,
              outputBlocks,
            ),
        allowAnyInput
          ? this.updateEdgesBySignalBlocks(currBlockId, inputBlocks)
          : inputDataType == null
            ? Promise.resolve([] as number[])
            : this.updateEdgesByInputBlocks(
                inputDataType,
                currBlockId,
                inputBlocks,
              ),
      ]);

      this.currProjectState.projectData.edges[currBlockId] =
        newEdgesOutputBlocks;

      for (const inputBlockId of newEdgesInputBlocks) {
        if (!this.currProjectState.projectData.edges[inputBlockId]) {
          this.currProjectState.projectData.edges[inputBlockId] = [];
        }
        if (
          !this.currProjectState.projectData.edges[inputBlockId].some(
            (edge) => edge == currBlockId,
          )
        ) {
          this.currProjectState.projectData.edges[inputBlockId].push(
            currBlockId,
          );
        }
      }
    } catch (error) {
      return Promise.reject(error);
    }
  }

  /** Wire signal producers without checking data-type compatibility. */
  protected updateEdgesBySignalBlocks(
    currBlockId: number,
    inputBlocks: number[],
  ): Promise<number[]> {
    const newEdges: number[] = [];
    for (const inputBlockId of inputBlocks) {
      if (inputBlockId === currBlockId) {
        return Promise.reject(
          new AppError(
            `Блок с id ${currBlockId} не может использовать сам себя как сигнал`,
            EAppErrorCodes.DataTypesNotCompatible,
          ),
        );
      }
      let found = false;
      for (const key of this.networkBlocks) {
        if (
          this.currProjectState.projectData.blocks.networkBlocks[key].some(
            (block) => block.blockId === inputBlockId,
          )
        ) {
          found = true;
          break;
        }
      }
      if (!found) {
        for (const key of this.internalBlocks) {
          if (
            this.currProjectState.projectData.blocks.internalBlocks[key].some(
              (block) => block.blockId === inputBlockId,
            )
          ) {
            found = true;
            break;
          }
        }
      }
      if (!found) {
        return Promise.reject(
          new AppError(
            `Блок с id ${inputBlockId} не найден`,
            EAppErrorCodes.NotFoundBlockId,
          ),
        );
      }
      newEdges.push(inputBlockId);
    }
    return Promise.resolve(newEdges);
  }
}
