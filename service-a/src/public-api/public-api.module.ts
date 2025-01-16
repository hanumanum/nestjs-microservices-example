import { Module } from '@nestjs/common';
import { HttpModule, HttpService } from '@nestjs/axios';
import { PublicApiService } from './public-api.service';
import { PublicApiController } from './public-api.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
      }),
    }),
  ],
  providers: [
    PublicApiService,
    {
      provide: 'AXIOS_INSTANCE_TOKEN',
      useFactory: (httpService: HttpService) => httpService.axiosRef,
      inject: [HttpService],
    },
  ],
  controllers: [PublicApiController],
})
export class PublicApiModule {}
