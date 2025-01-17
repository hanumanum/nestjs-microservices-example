import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class LoggingService {
  private readonly timeseriesPrefix = 'timeseries:api:';
  private readonly retentionPeriod = '604800000'; //TODO: move to .env

  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
  ) {}

  async logApiCall(endpoint: string, executionTime: number) {
    const key = `${this.timeseriesPrefix}${endpoint}`;
    const timestamp = Date.now();

    try {
      await this.redisClient.sendCommand([
        'TS.ADD',
        key,
        timestamp.toString(),
        executionTime.toString(),
        'RETENTION',
        this.retentionPeriod,
      ]);
    } catch (err) {
      console.error(`Error logging API call for ${endpoint}:`, err);
      throw new Error('Could not log API call to Redis');
    }
  }

  //TODO: Fix this if time allows
  async listPaths_withLabels(): Promise<string[]> {
    try {
      const keys = await this.redisClient.sendCommand<string[]>([
        'TS.QUERYINDEX',
        'endpoints=*',
      ]);
      return keys || [];
    } catch (err) {
      console.error('Error fetching keys from Redis:', err);
      throw new Error('Could not fetch keys from Redis');
    }
  }

  //TODO: remove this and replace with listPaths_withLabels after fixing it
  async listPaths(): Promise<string[]> {
    try {
      const keys: string[] = [];
      let cursor = '0';

      do {
        const result = await this.redisClient.sendCommand(['SCAN', cursor]);
        cursor = result[0];

        keys.push(
          ...result[1].filter((key: string) =>
            key.startsWith(this.timeseriesPrefix),
          ),
        );
      } while (cursor !== '0');

      return keys.map((key) => key.replace(this.timeseriesPrefix, ''));
    } catch (err) {
      console.error('Error fetching keys from Redis:', err);
      throw new Error('Could not fetch keys from Redis');
    }
  }

  async queryApiLogs(endpoint: string, from: number, to: number) {
    const key = `${this.timeseriesPrefix}${endpoint}`;
    try {
      const rangeReply: [string, string][] = await this.redisClient.sendCommand(
        ['TS.RANGE', key, from.toString(), to.toString()],
      );

      return rangeReply.map(([timestamp, value]) => ({
        timestamp: new Date(parseInt(timestamp, 10)),
        executionTime: parseFloat(value),
      }));
    } catch (err) {
      console.error(`Error querying logs for ${endpoint}:`, err);
      return [];
    }
  }
}
