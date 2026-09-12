export interface IConverterValueConfig {
    stringTypeConfig: IConverterValueStringConfig[];
    numberTypeConfig: IConverterValueNumberConfig[];
}

export enum EConverterValueStringType {
    CLEAR_LEFT_PADS,
    CLEAR_RIGHT_PADS,
    CLEAR_PADS,
    ADD_STRING_LEFT,
    ADD_STRING_RIGHT,
    CUT_STRING,
    TO_LOWER_CASE,
    TO_UPPER_CASE
}

export interface IConverterValueStringConfig {
    convertType: EConverterValueStringType;
    addStringLeftConfig: {
        addedString: string
    } | null;
    addStringRightConfig: {
        addedString: string
    } | null;
    cutStringConfig: {
        startIndex: number;
        endIndex: number;
    } | null;
}

export enum EConverterValueNumberType {
    MULTIPLY,
    DIVIDE,
    PLUS,
    MINUS,
    ROOT_DEGREE,
    LOG,
    LN,
    SIN,
    COS,
    TAN,
    CAT,
    FORMULA
}

export interface IConverterValueNumberConfig {
    convertType: EConverterValueNumberType,
    argument: string | null;
    logConfig: {
        inputInBase: boolean;
    } | null
}