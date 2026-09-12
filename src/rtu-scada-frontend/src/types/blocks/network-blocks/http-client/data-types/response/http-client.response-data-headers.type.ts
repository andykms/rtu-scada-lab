import { EDataTypes } from "../../../../../data-types/base-data-type.type";
import { IBlockRequestData } from "../../../block-request-data.type";

export type THttpClientReponseHeaderData = EDataTypes.STRING;

export interface IHttpClientReponseHeaders extends IBlockRequestData<THttpClientReponseHeaderData> {
    headerName: string;
}