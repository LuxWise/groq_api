export interface OutputCreateUser {
    status: 'success' | 'error';
    message: string;
    userId?: number;
}