import { EDataTypes } from "../../../../../../data-types/base-data-type.type";
import { IBlockRequestData } from "../../../../block-request-data.type";

export type THttpClientReponseBodyNonFormData =
  | EDataTypes.STRING
  | EDataTypes.NUMBER
  | EDataTypes.JSON
  | EDataTypes.ARRAY_NUMBERS
  | EDataTypes.ANY_FILE
  | EDataTypes.BYTES
  | EDataTypes.IMAGE
  | EDataTypes.AUDIO
  | EDataTypes.VIDEO
  | EDataTypes.PDF;

export interface IHttpClientReponseBodyNonFormData extends IBlockRequestData<THttpClientReponseBodyNonFormData> {
  blockId: string;
}
