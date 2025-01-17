import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { RedisModule } from '../redis/redis.module';
import { LoggingController } from './logging.controller';

@Module({
  imports: [RedisModule],
  providers: [LoggingService],
  controllers: [LoggingController],
  exports: [LoggingService],
})
export class LoggingModule {}
