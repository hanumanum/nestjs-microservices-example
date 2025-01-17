import { Module } from '@nestjs/common';
import { MongoClient } from 'mongodb';

@Module({
  providers: [
    {
      provide: 'MONGO_CLIENT',
      useFactory: async () => {
        const uri = process.env.DATABASE_URI;
        const client = new MongoClient(uri);
        await client.connect();
        return client.db();
      },
    },
  ],
  exports: ['MONGO_CLIENT'],
})
export class DatabaseModule {}
