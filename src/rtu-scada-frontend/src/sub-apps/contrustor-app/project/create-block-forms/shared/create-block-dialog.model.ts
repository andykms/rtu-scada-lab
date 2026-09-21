import type { IHttpClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import type { IGraphBlock } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import type { IIndicatorsBlock } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import type { IMediaBlock } from '../../../../../../../electron/types/blocks/internal-blocks/media/media.type';
import type { ITcpServerBlock } from '../../../../../../../electron/types/blocks/network-blocks/tcp-server/tcp-server.type';
import type { ITcpClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/tcp-client/tcp-client.type';
import type { IMqttClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/mqtt-client/mqtt-client.type';
import type { IModbusRtuBlock } from '../../../../../../../electron/types/blocks/network-blocks/modbus/modbus-rtu.type';
import type { IModbusTcpBlock } from '../../../../../../../electron/types/blocks/network-blocks/modbus/modbus-tcp.type';
import type { IComBlock } from '../../../../../../../electron/types/blocks/network-blocks/com/com.type';
import type { IDatabaseBlock } from '../../../../../../../electron/types/blocks/network-blocks/database/database.type';
import type { IConverterBlock } from '../../../../../../../electron/types/blocks/internal-blocks/converter/converter.type';

export type TEditableBlock =
  | ITcpServerBlock
  | ITcpClientBlock
  | IMqttClientBlock
  | IHttpClientBlock
  | IModbusRtuBlock
  | IModbusTcpBlock
  | IComBlock
  | IDatabaseBlock
  | IConverterBlock
  | IGraphBlock
  | IIndicatorsBlock
  | IMediaBlock;

export interface ICreateBlockDialogData<TBlock = TEditableBlock> {
  blockId: number;
  isEdit?: boolean;
  /** Prefill for single-block forms */
  initialBlock?: TBlock;
  inputBlocks?: number[];
  outputBlocks?: number[];
  /** Prefill for multi-block forms (HTTP group / one graph|indicator|media) */
  initialBlocks?: TBlock[];
}

export interface ICreateBlockFormResult<T> {
  block: T;
  inputBlocks: number[];
  outputBlocks: number[];
}

export interface ICreateHttpClientBlockEntry {
  block: IHttpClientBlock;
  inputBlocks: number[];
  outputBlocks: number[];
}

export interface ICreateHttpClientFormResult {
  blocks: ICreateHttpClientBlockEntry[];
}

export interface ICreateGraphBlockEntry {
  block: IGraphBlock;
  inputBlocks: number[];
  outputBlocks: number[];
}

export interface ICreateGraphsFormResult {
  blocks: ICreateGraphBlockEntry[];
}

export interface ICreateIndicatorBlockEntry {
  block: IIndicatorsBlock;
  inputBlocks: number[];
  outputBlocks: number[];
}

export interface ICreateIndicatorsFormResult {
  blocks: ICreateIndicatorBlockEntry[];
}

export interface ICreateMediaBlockEntry {
  block: IMediaBlock;
  inputBlocks: number[];
  outputBlocks: number[];
}

export interface ICreateMediaFormResult {
  blocks: ICreateMediaBlockEntry[];
}
