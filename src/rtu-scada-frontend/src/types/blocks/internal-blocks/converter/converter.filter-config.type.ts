import { EDataTypes } from "../../../data-types/base-data-type.type";

export interface ICoverterFilterConfig {
    stringTypeConfig: IConverterFilterStringConfig | null;
    numberTypeConfig: IConverterFilterNumberConfig | null;
    jsonTypeConfig: IConverterFilterJsonConfig | null;
}

export interface IConverterFilterStringConfig {
    minLength: number | null;
    maxLength: number | null;
    length: number | null;
    isNumber: boolean | null;
    regularExpression: string | null;
}

export interface IConverterFilterNumberConfig {
    moreThan: number | null;
    lessThan: number | null;
    moreOrEqualThan: number | null;
    lessOrEqualThan: number | null;
    equal: number | null;
    notEqual: number | null;
}

export interface IConverterFilterJsonConfig {
    fields: IConverterFilterJsonField[];
}

export interface IConverterFilterJsonField {
    fieldName: string;
    isRequired: boolean;
    type: EDataTypes.STRING | EDataTypes.NUMBER | EDataTypes.JSON | EDataTypes.ARRAY_ANY
    stringTypeConfig: IConverterFilterStringConfig | null;
    numberTypeConfig: IConverterFilterNumberConfig | null;
    jsonTypeConfig: IConverterFilterJsonConfig | null;
    arrayAnyTypeConfig: IConverterFilterJsonFieldArrayConfig | null;
}

export interface IConverterFilterJsonFieldArrayConfig {
    filters: {
        minLength: number | null;
        maxLength: number | null;
        length: number | null;
    }
    type: EDataTypes.STRING | EDataTypes.NUMBER | EDataTypes.JSON | EDataTypes.ARRAY_ANY;
    stringTypeConfig: IConverterFilterStringConfig | null;
    numberTypeConfig: IConverterFilterNumberConfig | null;
    jsonTypeConfig: IConverterFilterJsonConfig | null;
    arrayAnyTypeConfig: IConverterFilterJsonFieldArrayConfig;
}