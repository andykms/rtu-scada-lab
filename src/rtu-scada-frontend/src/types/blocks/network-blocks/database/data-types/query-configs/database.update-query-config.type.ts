import { IBlockRequestData } from "../../../block-request-data.type";
import { IDatabaseTableConfig } from "../../database.table-config";
import { EDatabaseFilterTypes } from "../database.filter-types";
import { EDatabaseOperatorTypes } from "../database.operator-types";
import { TDatabaseUpdateDataTypes } from "../database.update-types";
import { IDatabaseQueryValue } from "../database.value.type";

export interface IDatabaseUpdateQueryType extends IDatabaseTableConfig, IBlockRequestData<TDatabaseUpdateDataTypes> {
    updatedValues: IDatabaseQueryValue[];
    filters: IDatabaseUpdateQueryFilter[];
}

export interface IDatabaseUpdateQueryFilter {
    fieldName: string;
    filterType: EDatabaseFilterTypes;
    filterValue: string;
    isInsertedFromBlock: boolean;
    operatorNextFilter: EDatabaseOperatorTypes | null;
}