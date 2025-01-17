import { Module } from '@nestjs/common';
import { EventsLogService } from './events-log.service';
import { EventsLogController } from './events-log.controller';
import { DatabaseModule } from '../database/database.module';
import { EventsLogSubscriber } from './event.subscriber';

@Module({
  imports: [DatabaseModule],
  providers: [EventsLogService],
  controllers: [EventsLogController, EventsLogSubscriber],
})
export class EventsLogModule {}
