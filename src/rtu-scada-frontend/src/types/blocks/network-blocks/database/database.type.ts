import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { INonRealtimeNetworkBlock } from "../non-realtime-network-block.type";
import { EDatabaseVariants } from "./database.variants";
import { EDatabaseQueryType } from "./database-query-type";
import { IDatabaseConnectionConfig } from "./database.connection-config.type";
import { IDatabaseInsertQueryType } from "./data-types/query-configs/database.insert-query-config.type";
import { IDatabaseRawQueryType } from "./data-types/query-configs/database.raw-query-config.type";
import { IDatabaseUpdateQueryType } from "./data-types/query-configs/database.update-query-config.type";

export interface IDatabaseBlock extends IBaseBlock, IBaseNetworkBlock, INonRealtimeNetworkBlock {
  databaseVariant: EDatabaseVariants;
  connectionConfig: IDatabaseConnectionConfig;
  queryType: EDatabaseQueryType;
  rawQueryConfig: IDatabaseRawQueryType | null;
  insertQueryConfig: IDatabaseInsertQueryType | null;
  updateQueryConfig: IDatabaseUpdateQueryType | null;
}
