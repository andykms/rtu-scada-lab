import { EDataTypes } from "../../data-types/base-data-type.type";

export interface IBlockRequestData<T extends EDataTypes> {
    typeRequestData: T;
}