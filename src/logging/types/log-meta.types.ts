export interface LogMeta {
    context?: string;
    requestId?: string;
    userId?: string;
    ip?: string;
    method?: string;
    path?: string;
    statusCode?: number;
    durationMs?: number;
    [key: string]: any;
}
