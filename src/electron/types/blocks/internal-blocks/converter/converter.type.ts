import { EDataTypes } from "../../../data-types/base-data-type.type";
import { IBaseBlock } from "../../base-block.type";
import { ICoverterFilterConfig } from "./converter.filter-config.type";
import { IConverterTypeConfig } from "./converter.type-config.type";
import { IConverterValueConfig } from "./converter.value-config.type";


export interface IConverterBlock extends IBaseBlock {
    inputDataType: EDataTypes;
    convertTypeConfig: IConverterTypeConfig;
    convertValueConfig: IConverterValueConfig;
    filterConfig: ICoverterFilterConfig;
}