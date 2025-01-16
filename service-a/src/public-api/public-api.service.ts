import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Inject } from '@nestjs/common';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { Db } from 'mongodb';
import { firstValueFrom } from 'rxjs';
import { createClient } from 'redis';

@Injectable()
export class PublicApiService {
  private client: ClientProxy;

  constructor(
    @Inject('MONGO_CLIENT') private readonly db: Db,
    private readonly httpService: HttpService,
  ) {
    this.client = ClientProxyFactory.create({
      transport: Transport.NATS,
      options: {
        servers: [process.env.NATS_URL],
      },
    });
  }

  async searchAndSave(query: string) {
    const response = await firstValueFrom(
      this.httpService.get(`https://openlibrary.org/search.json?q=${query}`),
    );
    const data = response.data;

    // Save to MongoDB
    const collection = this.db.collection('search_results');
    await collection.insertOne({ query, data, timestamp: new Date() });

    // Publish an event to NATS
    await this.client.emit('search_event', {
      query,
      resultCount: data.docs?.length || 0,
      timestamp: new Date(),
    });

    return data;
  }

  async searchStoredData(query: string) {
    const collection = this.db.collection('search_results');
    return await collection
      .find({ query })
      .project({ query: 1, timestamp: 1, 'data.docs': 1 })
      .toArray();
  }

  async logRequest(query: string, executionTime: number) {
    const redisClient = await this.redisClient();
    const key = `timeseries:requests:${query}`;
    const timestamp = Date.now();
    await redisClient.sendCommand([
      'TS.ADD',
      key,
      timestamp.toString(),
      executionTime.toString(),
    ]);
  }

  async getRequestLogs(query: string) {
    const redisClient = await this.redisClient();
    const key = `timeseries:requests:${query}`;
    const range: [string, string][] = await redisClient.sendCommand([
      'TS.RANGE',
      key,
      '-',
      '+',
    ]);
    return range.map(([timestamp, value]) => ({
      timestamp,
      executionTime: value,
    }));
  }

  private async redisClient() {
    //TODO: cache the client
    const client = createClient({
      url: `redis://${process.env.REDIS_HOST}:6379`,
    });
    await client.connect();
    return client;
  }
}
