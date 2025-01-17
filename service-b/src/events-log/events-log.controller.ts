import { Controller, Get, Query } from '@nestjs/common';
import { EventsLogService } from './events-log.service';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('logs')
@Controller('events-logs')
export class EventsLogController {
  constructor(private readonly eventsLogsService: EventsLogService) {}

  @Get()
  @Get()
  @ApiOperation({ summary: 'Retrieve logs by date range' })
  @ApiQuery({
    name: 'from',
    type: Date,
    description: 'Start date (iso)',
    example: '2025-01-01',
  })
  @ApiQuery({
    name: 'to',
    type: Date,
    description: 'End date (iso)',
    example: '2025-12-31',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    description: 'Page number',
    example: 1,
    required: false,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    description: 'Number of items per page',
    example: 10,
    required: false,
  })
  async getLogs(
    @Query('from') from: Date,
    @Query('to') to: Date,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.eventsLogsService.getLogsByDateRange(
      from,
      to,
      page,
      limit,
    );
  }
}
