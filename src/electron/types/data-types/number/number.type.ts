import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface INumberDataType 
    extends
        IBaseDataType<EDataTypes.NUMBER, number> {}

