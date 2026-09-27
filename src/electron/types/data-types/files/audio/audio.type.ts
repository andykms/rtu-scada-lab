import { EDataTypes, IBaseDataType } from "../../base-data-type.type";

export interface IAudioDataType extends IBaseDataType<
  EDataTypes.AUDIO,
  ArrayBuffer
> {}
