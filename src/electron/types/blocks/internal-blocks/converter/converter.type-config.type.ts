import { EDataTypes } from "../../../data-types/base-data-type.type";

export interface IConverterTypeConfig {
  inputTypeString: IConverterInputStringTypeConfig | null;
  inputTypeNumber: IConverterInputNumberTypeConfig | null;
  inputTypeBytes: IConverterInputBytesTypeConfig | null;
  inputTypeImage: IConverterInputImageTypeConfig | null;
  inputTypeVideo: IConverterInputVideoTypeConfig | null;
  inputTypeAnyFile: IConverterInputAnyFileTypeConfig | null;
  inputTypeJson: IConverterInputJsonTypeConfig | null;
}

export interface IConverterOutputTypeConfig<T extends EDataTypes> {
  outputType: T;
}

export interface IConverterInputStringTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.STRING | EDataTypes.NUMBER | EDataTypes.BYTES
> {}

export interface IConverterInputNumberTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.NUMBER | EDataTypes.STRING | EDataTypes.BYTES
> {}

export interface IConverterInputBytesTypeConfig extends IConverterOutputTypeConfig<
  | EDataTypes.BYTES
  | EDataTypes.IMAGE
  | EDataTypes.VIDEO
  | EDataTypes.AUDIO
  | EDataTypes.ANY_FILE
  | EDataTypes.PDF
  | EDataTypes.STRING
  | EDataTypes.NUMBER
> {}

export interface IConverterInputImageTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.IMAGE | EDataTypes.BYTES | EDataTypes.ANY_FILE
> {}

export interface IConverterInputVideoTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.VIDEO | EDataTypes.BYTES | EDataTypes.ANY_FILE
> {}

export interface IConverterInputAudioTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.AUDIO | EDataTypes.BYTES | EDataTypes.ANY_FILE
> {}

export interface IConverterInputAnyFileTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.ANY_FILE | EDataTypes.BYTES
> {}

export interface IConverterInputJsonTypeConfig extends IConverterOutputTypeConfig<
  | EDataTypes.JSON
  | EDataTypes.STRING
  | EDataTypes.BYTES
  | EDataTypes.ARRAY_NUMBERS
> {
  jsonFieldConfig: IConverterOutputTypeConfig<
    | EDataTypes.JSON
    | EDataTypes.STRING
    | EDataTypes.BYTES
    | EDataTypes.ARRAY_NUMBERS
    | EDataTypes.ANY_FILE
    | EDataTypes.AUDIO
    | EDataTypes.VIDEO
    | EDataTypes.IMAGE
    | EDataTypes.PDF
    | EDataTypes.NUMBER
  > & {
    path: string;
  };
}

export enum EConverterInputArrayNumbersOutputNumberType {
  INDEX,
  MIN,
  MAX,
  SUM,
  AVG,
  MODE,
  STDDEV
}

export interface IConverterInputArrayNumbersConfig extends IConverterOutputTypeConfig<
  EDataTypes.ARRAY_NUMBERS |
  EDataTypes.JSON |
  EDataTypes.STRING |
  EDataTypes.NUMBER
> {
  numberConfig: {
    outputType: EConverterInputArrayNumbersOutputNumberType;
  }
}