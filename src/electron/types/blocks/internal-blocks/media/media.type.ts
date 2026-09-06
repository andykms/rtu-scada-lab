import { IBaseBlock } from "../../base-block.type";
import { IBlockRequestData } from "../../network-blocks/block-request-data.type";
import { IMediaDownloadConfig } from "./data-types/media.download-config.type";
import { TMediaBlockRequestData } from "./data-types/media.request-data.type";

export interface IMediaBlock
  extends IBaseBlock, IBlockRequestData<TMediaBlockRequestData> {
  maxStoredItems: number | null;
  downloadConfig: IMediaDownloadConfig | null;
}
