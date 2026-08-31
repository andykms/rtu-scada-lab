export enum EDataTypes {
    STRING,
    NUMBER,
    JSON,
    ARRAY_NUMBERS,
    ANY_FILE,
    VIDEO,
    AUDIO,
    IMAGE,
    PDF,
    BYTES,
    NOTHING,
    ARRAY_ANY
}

export interface IBaseDataType {
    dataType: EDataTypes;
}