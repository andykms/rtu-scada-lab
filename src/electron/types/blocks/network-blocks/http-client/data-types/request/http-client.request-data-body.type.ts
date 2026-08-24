import { EDataTypes } from "../../../../../data-types/base-data-type.type";
import { IBlockRequestData } from "../../../block-request-data.type";

export type IHttpClientRequestBodyDataTypes = 
    EDataTypes.JSON |
    EDataTypes.STRING |
    EDataTypes.NUMBER | 
    EDataTypes.BYTES |
    EDataTypes.ANY_FILE |
    EDataTypes.AUDIO |
    EDataTypes.VIDEO |
    EDataTypes.IMAGE |
    EDataTypes.PDF;

export interface IHttpClientRequestBodyData extends IBlockRequestData<IHttpClientRequestBodyDataTypes> {
}