import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { EventsLogService } from './events-log.service'; // Adjust the import path as necessary
import { TNATSMessege } from './types';
import { messegeToEventLog } from './utils/object.transformers';

@Controller()
export class EventsLogSubscriber {
  constructor(private readonly eventsLogService: EventsLogService) {}

  @EventPattern('search_event')
  async handleSearchEvent(@Payload() message: TNATSMessege) {
    console.log('Received search event', message);
    const EventLogRecord = messegeToEventLog('search_event', message);
    await this.eventsLogService.insertLog(EventLogRecord);
  }
}
