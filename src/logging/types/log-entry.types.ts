export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH'
export type LogLevel = 'INFO' | 'WARNING' | 'ERROR';

export interface LogEntry {
    level: LogLevel;
    operation: string;
    message: string;
    httpMethod: HttpMethod;
    httpUrl: string;
    requestHeaders: string;
    requestBody: string;
    responseStatus: string;
    responseHeaders: string;
    responseBody: string;
    responseTime: string;
}