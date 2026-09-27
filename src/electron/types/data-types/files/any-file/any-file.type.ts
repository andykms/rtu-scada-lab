import { EDataTypes, IBaseDataType } from "../../base-data-type.type";

export interface IAnyFileDataType extends IBaseDataType<
  EDataTypes.ANY_FILE,
  ArrayBuffer
> {}
