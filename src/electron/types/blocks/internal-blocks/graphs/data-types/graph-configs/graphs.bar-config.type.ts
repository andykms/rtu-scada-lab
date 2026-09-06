import { IGraphSource } from "./graphs.source.type";

export interface IGraphBarColumn extends IGraphSource {
  columnName: string;
}

export interface IGraphBarConfig {
  columns: IGraphBarColumn[];
}
