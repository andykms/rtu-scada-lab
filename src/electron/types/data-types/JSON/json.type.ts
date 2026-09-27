import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface IJsonDataType 
    extends
        IBaseDataType<EDataTypes.JSON, ArrayBuffer> {}

