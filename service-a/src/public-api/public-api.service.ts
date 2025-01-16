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
import { TDBRecord, TNewDBRecord } from './types';
import { externalApiEntryToRecord } from './utils/object.transformers';

@Injectable()
export class PublicApiService {
  private client: ClientProxy;
  private searchURL: string;

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
    this.searchURL = 'https://www.themealdb.com/api/json/v1/1/search.php?s=';
  }

  //TODO: rewirte with DTO
  async searchAndSave(query: string) {
    const response = await firstValueFrom(
      this.httpService.get(`${this.searchURL}${query}`),
    );
    const data = response?.data;

    if (data) {
      const dbRecords: TNewDBRecord[] = data.meals.map(
        externalApiEntryToRecord(query),
      );
      const collection = this.db.collection('meals');
      const res = await collection.insertMany(dbRecords);
      console.log(res);
    }

    this.client.emit('search_event', {
      query,
      resultCount: data.meals?.length || 0,
      timestamp: new Date(),
    });

    return data;
  }

  //TODO: rewirte with DTO
  async searchStoredData(
    searchParams: {
      query?: string;
      title?: string;
      category?: string;
      area?: string;
      ingridients?: string;
      mesurments?: string;
    },
    page: number,
    limit: number,
  ) {
    page = +page; //TODO: Remove after implemetation of DTO
    limit = +limit; //TODO: Remove after implemetation of DTO

    const collection = this.db.collection<TDBRecord>('meals');
    const filter: Record<string, any> = {};
    if (searchParams.query)
      filter.query = { $regex: searchParams.query, $options: 'i' };
    if (searchParams.title)
      filter.title = { $regex: searchParams.title, $options: 'i' };
    if (searchParams.category)
      filter.cagetory = { $regex: searchParams.category, $options: 'i' };
    if (searchParams.area)
      filter.area = { $regex: searchParams.area, $options: 'i' };
    if (searchParams.ingridients)
      filter.ingridients = { $regex: searchParams.ingridients, $options: 'i' };
    if (searchParams.mesurments)
      filter.mesurments = { $regex: searchParams.mesurments, $options: 'i' };

    const total = await collection.countDocuments(filter);
    const results = await collection
      .find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ timestamp: -1 })
      .toArray();

    return {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
      results,
    };
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
