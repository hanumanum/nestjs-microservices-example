import { Controller, Get, Query } from '@nestjs/common';
import { PublicApiService } from './public-api.service';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('public-api') // Tag to group APIs in Swagger
@Controller('public-api')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search and save results from the public API' })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Search results from public API' })
  async search(@Query('q') query: string) {
    return await this.publicApiService.searchAndSave(query);
  }

  @Get('search-stored')
  @ApiOperation({ summary: 'Search stored results in the database' })
  @ApiQuery({ name: 'q', type: String, description: 'Search query' })
  @ApiResponse({ status: 200, description: 'Stored search results' })
  async searchStored(@Query('q') query: string) {
    return await this.publicApiService.searchStoredData(query);
  }

  @Get('log')
  //TODO: review this method and logic, seems it is not feet for the purpose
  @ApiOperation({
    summary: 'Log a request',
    description: 'Logs the execution time of a request to RedisTimeSeries',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Search query to log',
    example: 'NestJS',
  })
  @ApiQuery({
    name: 'time',
    type: Number,
    description: 'Execution time in milliseconds',
    example: 200,
  })
  @ApiResponse({
    status: 201,
    description: 'Request logged successfully',
  })
  async logRequest(@Query('q') query: string, @Query('time') time: number) {
    return await this.publicApiService.logRequest(query, time);
  }

  @Get('logs')
  @ApiOperation({
    summary: 'Retrieve request logs',
    description:
      'Fetches execution time logs for a specific query from RedisTimeSeries',
  })
  @ApiQuery({
    name: 'q',
    type: String,
    description: 'Search query whose logs are to be retrieved',
    example: 'NestJS', //TODO: reivew this example, it is not clear
  })
  @ApiResponse({
    status: 200,
    description: 'Logs retrieved successfully',
    schema: {
      example: [
        { timestamp: 1678963200000, executionTime: 200 },
        { timestamp: 1678963500000, executionTime: 150 },
      ],
    },
  })
  @ApiResponse({
    status: 404,
    description: 'No logs found for the specified query',
  })
  async getLogs(@Query('q') query: string) {
    return await this.publicApiService.getRequestLogs(query);
  }
}
