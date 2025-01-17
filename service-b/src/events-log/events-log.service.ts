import { Injectable, Inject } from '@nestjs/common';
import { Db } from 'mongodb';
import { TEventLogRecord } from './types';

@Injectable()
export class EventsLogService {
  private readonly collectionName = 'event_logs';

  constructor(@Inject('MONGO_CLIENT') private readonly db: Db) {}

  async insertLog(eventLogRecord: TEventLogRecord): Promise<void> {
    try {
      const collection = this.db.collection(this.collectionName);
      await collection.insertOne(eventLogRecord);
    } catch (e) {
      console.error('Failed to insert log');
    }
  }

  //TODO: rewirte with DTO
  async getLogsByDateRange(
    start: Date,
    end: Date,
    page: number,
    limit: number,
  ) {
    page = +page; //TODO: Remove after implemetation of DTO
    limit = +limit; //TODO: Remove after implemetation of DTO

    const collection = this.db.collection(this.collectionName);

    try {
      const total = await collection.countDocuments();
      const results = await collection
        .find({
          timestamp: { $gte: start, $lte: end },
        })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      return { total, page, limit, pages: Math.ceil(total / limit), results };
    } catch (e) {
      console.error('Failed to retrieve logs');
      throw e;
    }
  }
}
