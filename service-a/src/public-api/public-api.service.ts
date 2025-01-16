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

  async onModuleInit() {
    await this.createIndexes();
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
      instructions?: string;
      category?: string;
      area?: string;
      ingridients?: string;
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
    if (searchParams.title) filter.$text = { $search: searchParams.title }; //INFO: becouse of index, see this.createIndexes()
    if (searchParams.instructions)
      filter.instructions = {
        $regex: searchParams.instructions,
        $options: 'i',
      };
    if (searchParams.category)
      filter.cagetory = { $regex: searchParams.category, $options: 'i' };
    if (searchParams.area)
      filter.area = { $regex: searchParams.area, $options: 'i' };
    if (searchParams.ingridients)
      filter.ingridients = { $regex: searchParams.ingridients, $options: 'i' };

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

  //TODO: think about other indexes
  private async createIndexes() {
    try {
      const collection = this.db.collection('meals');

      await collection.createIndex(
        { title: 1 },
        { unique: false, name: 'title_index' },
      );
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }
}
