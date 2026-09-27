import { EDataTypes, IBaseDataType } from "../base-data-type.type";

export interface IBytesDataType
      extends
          IBaseDataType<EDataTypes.BYTES, ArrayBuffer> {}