import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { EventsLogModule } from './events-log/events-log.module';
import { DatabaseModule } from './database/database.module';
import { EventsLogService } from './events-log/events-log.service';
import { EventsLogController } from './events-log/events-log.controller';

@Module({
  imports: [EventsLogModule, DatabaseModule],
  controllers: [EventsLogController],
  providers: [AppService, EventsLogService],
})
export class AppModule {}
