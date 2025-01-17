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
  @ApiOperation({
    summary:
      'Search stored results in the database with pagination and filters',
  })
  @ApiQuery({
    name: 'query',
    type: String,
    required: false,
    description: 'Search query',
  })
  @ApiQuery({
    name: 'title',
    type: String,
    required: false,
    description: 'Filter by title',
  })
  @ApiQuery({
    name: 'instructions',
    type: String,
    required: false,
    description: 'Filter by instructions',
  })
  @ApiQuery({
    name: 'category',
    type: String,
    required: false,
    description: 'Filter by category',
  })
  @ApiQuery({
    name: 'area',
    type: String,
    required: false,
    description: 'Filter by area',
  })
  @ApiQuery({
    name: 'ingridients',
    type: String,
    required: false,
    description: 'Filter by ingredients',
  })
  @ApiQuery({
    name: 'page',
    type: Number,
    required: false,
    description: 'Page number (default: 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    type: Number,
    required: false,
    description: 'Items per page (default: 10)',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated and filtered search results',
    schema: {
      example: {
        total: 100,
        page: 1,
        limit: 10,
        pages: 10,
        results: [
          {
            _id: '123',
            query: 'NestJS',
            originalId: 'abc',
            title: 'Sample Title',
            cagetory: 'Category',
            area: 'Area',
            instructions: 'Step 1: Do something...',
            ingridients: ['Ingredient 1', 'Ingredient 2'],
            mesurments: ['1 cup', '2 tbsp'],
            originalSourceURI: 'https://example.com',
            timestamp: '2025-01-15T12:00:00.000Z',
          },
        ],
      },
    },
  })
  async searchStored(
    @Query('query') query?: string,
    @Query('title') title?: string,
    @Query('instructions') instructions?: string,
    @Query('category') category?: string,
    @Query('area') area?: string,
    @Query('ingridients') ingridients?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return await this.publicApiService.searchStoredData(
      { query, title, category, area, ingridients, instructions },
      page,
      limit,
    );
  }
}
