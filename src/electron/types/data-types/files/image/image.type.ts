import { EDataTypes, IBaseDataType } from "../../base-data-type.type";

export interface IImageDataType extends IBaseDataType<
  EDataTypes.IMAGE,
  ArrayBuffer
> {}
