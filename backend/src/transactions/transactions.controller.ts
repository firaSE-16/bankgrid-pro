import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { GridRequestDto, AggregationRequestDto, DistinctValuesRequestDto } from './dto/grid-request.dto';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly txService: TransactionsService) {}

  @Post('grid')
  async getRows(@Body() dto: GridRequestDto) {
    return this.txService.getRows(dto);
  }

  @Post('aggregations')
  async getAggregations(@Body() dto: AggregationRequestDto) {
    return this.txService.getAggregations(dto);
  }

  @Post('distinct-values')
  async getDistinctValues(@Body() dto: DistinctValuesRequestDto) {
    return this.txService.getDistinctValues(dto);
  }

  @Get('filter-values')
  async getFilterValues(@Query('column') column: string) {
    return this.txService.getFilterValues(column);
  }

  @Get('dashboard')
  async getDashboardStats() {
    return this.txService.getDashboardStats();
  }
}
