import { IBaseBlock } from "../../base-block.type";
import { IGraphBarConfig } from "./data-types/graph-configs/graphs.bar-config.type";
import { IGraphGroupedBarConfig } from "./data-types/graph-configs/graphs.grouped-bar-config.type";
import { IGraphHistogramConfig } from "./data-types/graph-configs/graphs.histogram-config.type";
import { IGraphLineConfig } from "./data-types/graph-configs/graphs.line-config.type";
import { EGraphType } from "./graph-type";

export interface IGraphBlock extends IBaseBlock {
  graphType: EGraphType;
  lineConfig: IGraphLineConfig | null;
  barConfig: IGraphBarConfig | null;
  groupedBarConfig: IGraphGroupedBarConfig | null;
  histogramConfig: IGraphHistogramConfig | null;
}
