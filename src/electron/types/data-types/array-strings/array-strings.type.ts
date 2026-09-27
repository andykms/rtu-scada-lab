import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface IArrayStringsDataType extends IBaseDataType<
  EDataTypes.ARRAY_STRINGS,
  ArrayBuffer[]
> {}
