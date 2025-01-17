import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PublicApiService } from './public-api/public-api.service';
import { PublicApiModule } from './public-api/public-api.module';
import { DatabaseModule } from './database/database.module';
import { HttpModule } from '@nestjs/axios';
import { LoggingModule } from './logging/logging.module';
import { LoggingController } from './logging/logging.controller';
import { LoggingMiddleware } from './logging/logging.middleware';

@Module({
  imports: [PublicApiModule, DatabaseModule, HttpModule, LoggingModule],
  controllers: [AppController, LoggingController],
  providers: [AppService, PublicApiService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggingMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
