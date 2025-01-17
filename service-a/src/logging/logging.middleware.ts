import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { LoggingService } from './logging.service';

@Injectable()
//TODO: this middleware should be extended to work with all possible endpoints with methods and payloads
export class LoggingMiddleware implements NestMiddleware {
  constructor(private readonly loggingService: LoggingService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const endpoint = req.path;

    res.on('finish', async () => {
      try {
        const executionTime = Date.now() - start;

        await this.loggingService.logApiCall(endpoint, executionTime);
        console.log(
          `Logged API call: [${req.method}] ${endpoint} - Execution time: ${executionTime}ms`,
        );
      } catch (err) {
        console.error('Error logging API call:', err);
      }
    });

    next();
  }
}
