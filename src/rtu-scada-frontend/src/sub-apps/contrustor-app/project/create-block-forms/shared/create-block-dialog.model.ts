import type { IHttpClientBlock } from '../../../../../../../electron/types/blocks/network-blocks/http-client/http-client.type';

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
