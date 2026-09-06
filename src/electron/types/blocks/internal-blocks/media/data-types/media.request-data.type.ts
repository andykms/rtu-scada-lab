import { EDataTypes } from "../../../../data-types/base-data-type.type";

export type TMediaBlockRequestData =
  | EDataTypes.IMAGE
  | EDataTypes.VIDEO
  | EDataTypes.AUDIO
  | EDataTypes.PDF
  | EDataTypes.ANY_FILE
  | EDataTypes.BYTES;
