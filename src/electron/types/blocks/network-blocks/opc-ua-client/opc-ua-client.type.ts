import { IBaseBlock } from "../../base-block.type";
import { IBaseNetworkBlock } from "../base-network-block-options.type";
import { OpcUaClientSecurityMode } from "./opc-ua-client.security-mode.type";
import { OpcUaClientSecurityPolicy } from "./opc-ua-client.security-policy.type";



export interface IOpcUaClientBlock extends IBaseBlock, IBaseNetworkBlock {
    url: string;
    securityOptions: {
        securityMode: OpcUaClientSecurityMode;
        securityPolicy: OpcUaClientSecurityPolicy;
    };
    clientOptions: {
        applicationName: string;
        applicationUri: string;
    },
    clientAuthentication: {
        userName: string | null;
        password: string | null;
        certificatePath: string | null;
        privateKeyPath: string | null;
    },
}