import { IBaseBlock } from "../../base-block.type";
import { IBlockRequestData } from "../../network-blocks/block-request-data.type";
import { IBlockResponseData } from "../../network-blocks/block-response-data.type";
import { TIndicatorsBlockRequestData } from "./data-types/indicators.request-data.type";
import { TIndicatorsBlockResponseData } from "./data-types/indicators.response-data.type";
import { IIndicatorArrayNumbersConfig } from "./data-types/value-configs/indicators.array-numbers-config.type";
import { IIndicatorNumberConfig } from "./data-types/value-configs/indicators.number-config.type";
import { IIndicatorStringConfig } from "./data-types/value-configs/indicators.string-config.type";

export interface IIndicatorsBlock
  extends
    IBaseBlock,
    IBlockRequestData<TIndicatorsBlockRequestData>,
    IBlockResponseData<TIndicatorsBlockResponseData> {
  numberConfig: IIndicatorNumberConfig | null;
  stringConfig: IIndicatorStringConfig | null;
  arrayNumbersConfig: IIndicatorArrayNumbersConfig | null;
}
