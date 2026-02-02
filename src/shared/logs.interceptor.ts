import { CallHandler, ExecutionContext, Injectable, LoggerService, NestInterceptor } from '@nestjs/common';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { LoggingService } from '../logging/logging.service';

@Injectable()
export class LogsInterceptor implements NestInterceptor {
  constructor(
    private readonly loggingService: LoggingService
  ) { }

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();

    const isHttp = context.getType() === 'http';
    const req = isHttp ? context.switchToHttp().getRequest() : null;

    const httpMethod = req ? req.method : 'N/A';
    const url = req ? req.url : 'N/A';
    const requestId = req ? req.headers['x-request-id'] || 'N/A' : 'N/A';
    const handlerName = context.getHandler().name ?? 'N/A';
    return next.handle().pipe(
      tap(() => {
        this.loggingService.log({
          level: 'INFO',
          operation: handlerName,
          message: `SUCCESS ${handlerName} requestId=${requestId} ms=${Date.now() - start} path=${url}`,
          httpMethod: httpMethod,
          httpUrl: url,
          requestHeaders: JSON.stringify(req ? req.headers : {}),
          requestBody: JSON.stringify(req ? req.body : {}),
          responseStatus: (req ? req.res.statusCode : 0).toString(),
          responseHeaders: JSON.stringify(req ? req.res.getHeaders() : {}),
          responseBody: 'N/A',
          responseTime: (Date.now() - start).toString(),
        })
      }),
      catchError((err) => {
        this.loggingService.log({
          level: 'ERROR',
          operation: handlerName,
          message: `ERROR ${handlerName} requestId=${requestId} ms=${Date.now() - start} path=${url}`,
          httpMethod: httpMethod,
          httpUrl: url,
          requestHeaders: JSON.stringify(req ? req.headers : {}),
          requestBody: JSON.stringify(req ? req.body : {}),
          responseStatus: (req ? req.res.statusCode : 0).toString(),
          responseHeaders: JSON.stringify(req ? req.res.getHeaders() : {}),
          responseBody: 'N/A',
          responseTime: (Date.now() - start).toString(),
        });
        return throwError(() => err);
      })
    )

  }
}
