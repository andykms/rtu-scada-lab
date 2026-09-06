import { IBlockRequestData } from "../../../../network-blocks/block-request-data.type";
import { TGraphBlockRequestData } from "../graphs.request-data.type";

export interface IGraphSource extends IBlockRequestData<TGraphBlockRequestData> {
  sourceBlockId: number;
}
