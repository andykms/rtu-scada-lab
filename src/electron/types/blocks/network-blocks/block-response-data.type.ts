import { EDataTypes } from "../../data-types/base-data-type.type";
export interface IBlockResponseData<T extends EDataTypes> {
    typeResponseData: T;
}