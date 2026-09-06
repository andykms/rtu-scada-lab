import { IBlockRequestData } from "../../../block-request-data.type";
import { TDatabaseRawDataTypes } from "../database.raw-types";

export interface IDatabaseRawQueryType extends IBlockRequestData<TDatabaseRawDataTypes> {
    query: string;
}