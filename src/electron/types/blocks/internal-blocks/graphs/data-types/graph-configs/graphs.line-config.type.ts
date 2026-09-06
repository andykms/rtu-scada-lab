import { IGraphSource } from "./graphs.source.type";

export interface IGraphLineSource extends IGraphSource {
  unit: string | null;
}

export interface IGraphLineConfig {
  sources: IGraphLineSource[];
}
