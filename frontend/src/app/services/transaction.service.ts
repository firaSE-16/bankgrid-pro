import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  GridRequest,
  GridResponse,
  AggregationRequest,
  AggregationResult,
  DashboardStats,
  FilterGroup,
} from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private readonly baseUrl = `${environment.apiUrl}/transactions`;

  constructor(private http: HttpClient) {}

  getRows(request: GridRequest): Observable<GridResponse> {
    return this.http.post<GridResponse>(`${this.baseUrl}/grid`, request);
  }

  getAggregations(request: AggregationRequest): Observable<AggregationResult> {
    return this.http.post<AggregationResult>(`${this.baseUrl}/aggregations`, request);
  }

  getDistinctValues(column: string, search?: string, filterModel?: any): Observable<string[]> {
    return this.http.post<string[]>(`${this.baseUrl}/distinct-values`, {
      column,
      search,
      filterModel,
    });
  }

  getFilterValues(column: string): Observable<string[] | FilterGroup[]> {
    return this.http.get<string[] | FilterGroup[]>(`${this.baseUrl}/filter-values`, {
      params: { column },
    });
  }

  getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }
}
