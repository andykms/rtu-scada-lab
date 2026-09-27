import { EDataTypes, IBaseDataType } from "../../base-data-type.type";

export interface IVideoDataType extends IBaseDataType<
  EDataTypes.VIDEO,
  ArrayBuffer
> {}
