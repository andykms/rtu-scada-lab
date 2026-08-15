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
    NOTHING
}

export interface IBaseDataType {
    dataType: EDataTypes;
}