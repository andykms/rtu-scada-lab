import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface IStringDataType
  extends
    IBaseDataType<EDataTypes.STRING, ArrayBuffer> {}
