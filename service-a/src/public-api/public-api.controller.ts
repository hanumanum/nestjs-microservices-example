import { Controller, Get, Query } from '@nestjs/common';
import { PublicApiService } from './public-api.service';

@Controller('public-api')
export class PublicApiController {
  constructor(private readonly publicApiService: PublicApiService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    return await this.publicApiService.searchAndSave(query);
  }

  @Get('search-stored')
  async searchStored(@Query('q') query: string) {
    return await this.publicApiService.searchStoredData(query);
  }

  @Get('log')
  async logRequest(@Query('q') query: string, @Query('time') time: number) {
    return await this.publicApiService.logRequest(query, time);
  }

  @Get('logs')
  async getLogs(@Query('q') query: string) {
    return await this.publicApiService.getRequestLogs(query);
  }
}
