import { Controller, Get, Query } from '@nestjs/common';
import { LoggingService } from './logging.service';
import { ApiTags, ApiQuery, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('logging')
@Controller('logging')
export class LoggingController {
  constructor(private readonly loggingService: LoggingService) {}

  @Get('paths')
  @ApiOperation({ summary: 'List all paths in Redis' })
  @ApiResponse({
    status: 200,
    description: 'List of all paths logged in Redis',
    schema: {
      example: [
        '/public-api/search',
        '/public-api/search-stored',
        '/public-api/logs',
      ],
    },
  })
  async getPaths() {
    return await this.loggingService.listPaths();
  }

  @Get('logs')
  @ApiOperation({ summary: 'Query API call logs' })
  @ApiQuery({
    name: 'endpoint',
    type: String,
    description: 'API endpoint to query',
    example: '/public-api/search',
  })
  @ApiQuery({
    name: 'from',
    type: Number,
    description: 'Start timestamp (epoch ms)',
    example: '1735689600000',
  })
  @ApiQuery({
    name: 'to',
    type: Number,
    description: 'End timestamp (epoch ms)',
    example: '1767225599000',
  })
  @ApiResponse({
    status: 200,
    description: 'API call logs retrieved successfully',
    schema: {
      example: [
        { timestamp: '2025-01-15T12:00:00.000Z', executionTime: 200 },
        { timestamp: '2025-01-15T12:05:00.000Z', executionTime: 180 },
      ],
    },
  })
  async getLogs(
    @Query('endpoint') endpoint: string,
    @Query('from') from: number,
    @Query('to') to: number,
  ) {
    return await this.loggingService.queryApiLogs(endpoint, from, to);
  }
}
