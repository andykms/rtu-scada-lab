export enum OpcUaClientSecurityPolicy {
    NONE = "None",
    BASIC128_RSA15 = "Basic128Rsa15",
    BASIC128_SHA256 = "Basic128Sha256",
    BASIC256 = "Basic256",
    BASIC256_SHA256 = "Basic256Sha256",
    AES128_SHA256_RSAOAEP = "Aes128Sha256RsaOaep",
    AES256_SHA256_RSAOAEP = "Aes256Sha256RsaOaep",
    AES128_GCM_SHA256_RSAOAEP = "Aes128GcmSha256RsaOaep",
    AES256_GCM_SHA256_RSAOAEP = "Aes256GcmSha256RsaOaep",
    AES128_GCM_NO_SUITE = "Aes128GcmNoSuite",
    AES256_GCM_NO_SUITE = "Aes256GcmNoSuite",
}