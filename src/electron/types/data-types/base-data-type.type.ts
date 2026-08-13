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
    BYTES
}

export interface IBaseDataType {
    dataType: EDataTypes;
}