import { EDataTypes } from "../../../data-types/base-data-type.type";

export interface IConverterTypeConfig {
  inputTypeString?: IConverterInputStringTypeConfig | null;
  inputTypeNumber?: IConverterInputNumberTypeConfig | null;
  inputTypeBytes?: IConverterInputBytesTypeConfig | null;
  inputTypeImage?: IConverterInputImageTypeConfig | null;
  inputTypeVideo?: IConverterInputVideoTypeConfig | null;
  inputTypeAudio?: IConverterInputAudioTypeConfig | null;
  inputTypeAnyFile?: IConverterInputAnyFileTypeConfig | null;
  inputTypeJson?: IConverterInputJsonTypeConfig | null;
  inputTypeArrayNumbers?: IConverterInputArrayNumbersConfig | null;
  inputTypeArrayStrings?: IConverterInputArrayStringsConfig | null;
  inputTypeBoolean?: IConverterInputBooleanTypeConfig | null;
}

export interface IConverterOutputTypeConfig<T extends EDataTypes> {
  outputType: T;
}

export interface IConverterInputStringTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.STRING | EDataTypes.NUMBER | EDataTypes.BYTES | EDataTypes.ARRAY_STRINGS
> {
  arrayStringsConfig: {
    outputType: EConverterInputStringOutputArrayStringsType;
    splitConfig: {
      separator: string;
    } | null;
  } | null;
}

export enum EConverterInputStringOutputArrayStringsType {
  SPLIT,
}

export interface IConverterInputNumberTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.NUMBER | EDataTypes.STRING | EDataTypes.BYTES | EDataTypes.BOOLEAN
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
  | EDataTypes.NUMBER
  | EDataTypes.ANY_FILE
  | EDataTypes.AUDIO
  | EDataTypes.VIDEO
  | EDataTypes.IMAGE
  | EDataTypes.PDF
  | EDataTypes.ARRAY_STRINGS
  | EDataTypes.BOOLEAN
> {
  /**
   * Field navigation inside JSON.
   * - `path` empty: convert the whole JSON value to `outputType`
   *   (allowed for STRING / BYTES / ARRAY_NUMBERS; for other types path is required).
   * - `path` set: extract that field; effective type is `jsonFieldConfig.outputType`
   *   (normally same as top-level `outputType`).
   */
  jsonFieldConfig: IConverterOutputTypeConfig<
    | EDataTypes.JSON
    | EDataTypes.STRING
    | EDataTypes.BYTES
    | EDataTypes.ARRAY_NUMBERS
    | EDataTypes.ARRAY_STRINGS
    | EDataTypes.BOOLEAN
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
  STDDEV,
}

export interface IConverterInputArrayNumbersConfig extends IConverterOutputTypeConfig<
  | EDataTypes.ARRAY_NUMBERS
  | EDataTypes.JSON
  | EDataTypes.STRING
  | EDataTypes.NUMBER
  | EDataTypes.ARRAY_STRINGS
> {
  numberConfig: {
    outputType: EConverterInputArrayNumbersOutputNumberType;
    /** Used when outputType is INDEX. */
    index: number | null;
  } | null;
}

export interface IConverterInputArrayStringsConfig extends IConverterOutputTypeConfig<
  EDataTypes.ARRAY_STRINGS | EDataTypes.STRING | EDataTypes.ARRAY_NUMBERS
> {
  stringConfig: {
    outputType: EConverterInputArrayStringsOutputStringType;
    index: number | null;
    joinConfig: {
      separator: string;
    } | null;
  } | null;
  arrayNumbersConfig: {
    onNotNumber: EConverterInputArrayStringsOnNotNumberType;
    specialValueConfig: {
      value: number;
    } | null;
  } | null;
}

export enum EConverterInputArrayStringsOutputStringType {
  INDEX,
  JOIN,
}

export enum EConverterInputArrayStringsOnNotNumberType {
  IGNORE,
  SPECIAL_VALUE,
}

export interface IConverterInputBooleanTypeConfig extends IConverterOutputTypeConfig<
  EDataTypes.BOOLEAN | EDataTypes.STRING | EDataTypes.NUMBER
> {}