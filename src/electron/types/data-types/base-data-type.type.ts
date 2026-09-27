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
    ARRAY_ANY,
    BOOLEAN,
    ARRAY_STRINGS
}

export interface IBaseDataType<T extends EDataTypes, K> {
    dataType: T;
    valueSource: K;
}