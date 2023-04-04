export interface Alert {
    severity: 'success' | 'info' | 'warn' | 'error';
    summary: string;
    detail: string;
}