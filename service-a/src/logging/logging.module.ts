import { Module } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { RedisModule } from '../redis/redis.module';

@Module({
  imports: [RedisModule],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
