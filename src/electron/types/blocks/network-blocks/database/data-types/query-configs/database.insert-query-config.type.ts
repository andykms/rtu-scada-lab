import { IBlockRequestData } from "../../../block-request-data.type";
import { IDatabaseTableConfig } from "../../database.table-config";
import { TDatabaseInsertQueryDataTypes } from "../database.insert-query-data.type";
import { IDatabaseQueryValue } from "../database.value.type";

export interface IDatabaseInsertQueryType extends IBlockRequestData<TDatabaseInsertQueryDataTypes>, IDatabaseTableConfig {
    values: IDatabaseQueryValue[];
}