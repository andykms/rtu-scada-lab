import { EDataTypes, IBaseDataType } from "../../base-data-type.type";

export interface IPdfDataType extends IBaseDataType<
  EDataTypes.PDF,
  ArrayBuffer
> {}
