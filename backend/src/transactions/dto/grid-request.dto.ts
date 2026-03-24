import { IsOptional, IsNumber, IsArray, IsString, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

export class ColumnFilter {
  filterType: string; // 'text' | 'number' | 'date' | 'set'
  type?: string; // 'equals' | 'contains' | 'notEqual' | 'startsWith' | 'endsWith' | 'lessThan' | 'greaterThan' | 'inRange'
  filter?: any;
  filterTo?: any;
  values?: string[];
  operator?: string; // 'AND' | 'OR'
  conditions?: ColumnFilter[];
  dateFrom?: string;
  dateTo?: string;
}

export class SortModel {
  colId: string;
  sort: 'asc' | 'desc';
}

export class GridRequestDto {
  @IsNumber()
  @Type(() => Number)
  startRow: number;

  @IsNumber()
  @Type(() => Number)
  endRow: number;

  @IsOptional()
  @IsArray()
  sortModel?: SortModel[];

  @IsOptional()
  @IsObject()
  filterModel?: Record<string, ColumnFilter>;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsArray()
  advancedSearch?: AdvancedSearchItem[];
}

export class AdvancedSearchItem {
  column: string;
  operator: string; // 'equals' | 'contains' | 'greaterThan' | 'lessThan' | 'between' | 'startsWith'
  value: any;
  valueTo?: any;
}

export class AggregationRequestDto {
  @IsArray()
  columns: string[];

  @IsOptional()
  @IsObject()
  filterModel?: Record<string, ColumnFilter>;

  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsArray()
  advancedSearch?: AdvancedSearchItem[];
}

export class DistinctValuesRequestDto {
  @IsString()
  column: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsObject()
  filterModel?: Record<string, ColumnFilter>;
}
