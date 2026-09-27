import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface IArrayNumbersDataType extends IBaseDataType<
  EDataTypes.ARRAY_NUMBERS,
  number[]
> {}
