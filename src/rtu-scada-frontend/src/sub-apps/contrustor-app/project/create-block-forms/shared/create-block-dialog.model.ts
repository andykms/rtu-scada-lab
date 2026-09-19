import type { IHttpClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';
import type { IGraphBlock } from '../../../../../../../electron/types/blocks/internal-blocks/graphs/graphs.type';
import type { IIndicatorsBlock } from '../../../../../../../electron/types/blocks/internal-blocks/indicators/indicators.type';
import type { IMediaBlock } from '../../../../../../../electron/types/blocks/internal-blocks/media/media.type';

export interface ICreateBlockDialogData {
  blockId: number;
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
