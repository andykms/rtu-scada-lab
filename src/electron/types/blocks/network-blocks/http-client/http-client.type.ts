import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { INonRealtimeNetworkBlock } from "../non-realtime-network-block.type";
import { IHttpClientRequestHeaders } from "./data-types/request/http-client.request-data-headers.type";
import { IHttpClientReponseBodyFormData } from "./data-types/response/body/http-client.response-data-body-form-data.type";
import { IHttpClientReponseCookies } from "./data-types/response/http-client.response-data-cookie.type";
import { IHttpClientReponseHeaders } from "./data-types/response/http-client.response-data-headers.type";
import { IHttpClientReponseBodyNonFormData } from "./data-types/response/body/http-client.response-data-body-non-form-data.type";
import {
  IHttpClientRequestBodyDataTypes,
} from "./data-types/request/http-client.request-data-body.type";
import { EHttpClientResponseDataBodyType } from "./data-types/response/body/http-client.response-data-body-type";
import { IBlockRequestData } from "../block-request-data.type";
import {IHttpClientRequestDataBodyTypes} from "./data-types/request/body/http-client.request-data-body-type"
import {IHttpRequestDataBodyFormData } from "./data-types/request/body/http-client.request-data-body-form-data.type"

export interface IHttpClientBlock
  extends IBaseBlock, IBaseNetworkBlock, INonRealtimeNetworkBlock {
  httpMethod: string;
  httpUrlWithoutQueryParams: string;
  responseData: {
    fromHeaders: IHttpClientReponseHeaders[];
    fromBody: {
      type: EHttpClientResponseDataBodyType;
      formData: IHttpClientReponseBodyFormData[] | null;
      nonFormData: IHttpClientReponseBodyNonFormData | null;
    };
    fromCookies: IHttpClientReponseCookies[];
  };
  requestData: IHttpClientBlockRequestData;
}

export interface IHttpClientBlockRequestData extends IBlockRequestData<IHttpClientRequestBodyDataTypes> {
  requestHeaders: IHttpClientRequestHeaders[];
  requestBody: { 
    type: IHttpClientRequestDataBodyTypes;
    jsonConfiguration: {
      message: string;
    } | null;
    formDataConfiguration: IHttpRequestDataBodyFormData[] | null;
    isOtherTypes: boolean;
  };
}
