import { ERateLimiterServiceProtocols } from "./rate-limiter-service-protocols.type";

export interface IRateLimiterServiceConfig {
    protocols: ERateLimiterServiceProtocols[],
    maxRequestsCountPerPeriod: number;
    periodMs: number;
}