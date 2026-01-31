import { Injectable } from '@nestjs/common';
import { PersistenceService } from '../persistence/persistence.service';
import { LogEntry, LogLevel } from './types/log-entry.types';

@Injectable()
export class LoggingService  {
    constructor(
        private readonly persistenceService: PersistenceService
    ) {}

    private consoleEnabled = true;

    log(entry: LogEntry) {
        const levelMap: Record<LogLevel, 'INFO' | 'WARNING' | 'ERROR'> = {
            'INFO': 'INFO',
            'WARNING': 'WARNING',
            'ERROR': 'ERROR',
        };

        const logEntity = ({
            level: levelMap[entry.level],
            operation: entry.operation,
            message: entry.message,
            httpMethod: entry.httpMethod,
            httpUrl: entry.httpUrl,
            requestHeaders: entry.requestHeaders,
            requestBody: entry.requestBody,
            responseStatus: entry.responseStatus,
            responseHeaders: entry.responseHeaders,
            responseBody: entry.responseBody,
            responseTime: entry.responseTime,
        });

        if (this.consoleEnabled) {
            console.log(`level: ${entry.level},operation: ${entry.operation}, , message: ${entry.message},httpMethod: ${entry.httpMethod} targetUrl: ${entry.httpUrl},`);
        }

        this.persistenceService.api_logs.create({
            data: {...logEntity}
        }).catch(err => {
            console.error('Failed to save log entry to database:', err);
        });
    }
}
