import { EDataTypes } from "../../../../../data-types/base-data-type.type";
import { IBlockRequestData } from "../../../block-request-data.type";

export type THttpClientReponseCookieData = EDataTypes.STRING;

export interface IHttpClientReponseCookies extends IBlockRequestData<THttpClientReponseCookieData> {
    cookieFieldName: string;
}