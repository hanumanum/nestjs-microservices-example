import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicApiService } from './public-api/public-api.service';
import { PublicApiModule } from './public-api/public-api.module';
import { DatabaseModule } from './database/database.module';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [PublicApiModule, DatabaseModule, HttpModule],
  controllers: [AppController],
  providers: [AppService, PublicApiService],
})
export class AppModule {}
