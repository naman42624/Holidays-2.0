export declare class AmadeusService {
    private client;
    private token;
    private tokenExpiry;
    private readonly baseURL;
    private readonly apiKey;
    private readonly apiSecret;
    constructor();
    private setupInterceptors;
    private getAccessToken;
    private ensureValidToken;
    request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', endpoint: string, params?: any, data?: any, timeoutMs?: number): Promise<T>;
    healthCheck(): Promise<boolean>;
}
export declare const amadeusService: AmadeusService;
//# sourceMappingURL=amadeus.service.d.ts.map