export interface OutputCreateExternalUser {
    status: 'success' | 'error';
    message: string;
    userId?: number;
    api_key?: string;
}