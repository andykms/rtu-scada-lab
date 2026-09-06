import { IGraphSource } from "./graphs.source.type";

export interface IGraphHistogramConfig {
  sources: IGraphSource[];
  defaultStartValue: number;
  defaultEndValue: number;
  defaultStep: number;
}
