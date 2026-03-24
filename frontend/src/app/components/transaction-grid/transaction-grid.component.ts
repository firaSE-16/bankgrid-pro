import {
  Component,
  inject,
  signal,
  ViewChild,
  OnInit,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import {
  ModuleRegistry,
  AllCommunityModule,
  ColDef,
  GridReadyEvent,
  GridApi,
  IServerSideDatasource,
  IServerSideGetRowsParams,
  SortChangedEvent,
  FilterChangedEvent,
  ValueFormatterParams,
  CellClassParams,
  themeQuartz,
} from 'ag-grid-community';
import { AllEnterpriseModule } from 'ag-grid-enterprise';
import { TransactionService } from '../../services/transaction.service';
import { ThemeService } from '../../services/theme.service';
import { AdvancedSearchItem } from '../../models/transaction.model';
import { AdvancedSearchComponent } from '../advanced-search/advanced-search.component';
import { AggregationPanelComponent } from '../aggregation-panel/aggregation-panel.component';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

@Component({
  selector: 'app-transaction-grid',
  standalone: true,
  imports: [
    AgGridAngular,
    FormsModule,
    DecimalPipe,
    AdvancedSearchComponent,
    AggregationPanelComponent,
    DashboardComponent,
  ],
  template: `
    <div class="grid-container">
      <app-dashboard />

      <div class="toolbar">
        <div class="toolbar-left">
          <div class="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              placeholder="Search transactions..."
              [ngModel]="searchTerm()"
              (ngModelChange)="onSearchInput($event)"
            />
            @if (searchTerm()) {
              <button class="clear-search" (click)="clearSearch()">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            }
          </div>
          <app-advanced-search
            (searchApplied)="onAdvancedSearch($event)"
            (searchCleared)="onAdvancedSearchClear()"
          />
        </div>
        <div class="toolbar-right">
          <div class="record-count">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <span>{{ totalRows() | number }} records</span>
          </div>
          <div class="page-size-control">
            <label>Rows:</label>
            <select [ngModel]="pageSize()" (ngModelChange)="onPageSizeChange($event)">
              <option [value]="50">50</option>
              <option [value]="100">100</option>
              <option [value]="200">200</option>
              <option [value]="500">500</option>
            </select>
          </div>
          <button class="toolbar-btn" (click)="resetFilters()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
            </svg>
            Reset Filters
          </button>
          <button class="toolbar-btn export-btn" (click)="exportCsv()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <div class="grid-wrapper">
        <ag-grid-angular
          class="ag-grid-element"
          [theme]="gridTheme()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [rowModelType]="'serverSide'"
          [pagination]="true"
          [paginationPageSize]="pageSize()"
          [paginationPageSizeSelector]="false"
          [cacheBlockSize]="pageSize()"
          [maxBlocksInCache]="10"
          [animateRows]="true"
          [rowSelection]="rowSelection"
          [enableCellTextSelection]="true"
          [suppressCopyRowsToClipboard]="false"
          [multiSortKey]="'ctrl'"
          (gridReady)="onGridReady($event)"
          (sortChanged)="onSortChanged($event)"
          (filterChanged)="onFilterChanged($event)"
        />
      </div>

      <app-aggregation-panel
        [filterModel]="currentFilterModel()"
        [searchTerm]="searchTerm()"
        [advancedSearch]="advancedSearchItems()"
        [refreshTrigger]="aggRefreshTrigger()"
      />
    </div>
  `,
  styles: [`
    .grid-container { display: flex; flex-direction: column; gap: 16px; }
    .toolbar {
      display: flex; align-items: center; justify-content: space-between;
      flex-wrap: wrap; gap: 12px;
    }
    .toolbar-left { display: flex; align-items: center; gap: 12px; flex: 1; }
    .toolbar-right { display: flex; align-items: center; gap: 12px; }
    .search-box {
      display: flex; align-items: center; gap: 8px;
      padding: 0 14px; height: 40px; min-width: 320px;
      background: var(--surface-elevated); border: 1px solid var(--border);
      border-radius: 10px; transition: all 0.2s;
      color: var(--text-tertiary);
      &:focus-within { border-color: var(--accent); box-shadow: 0 0 0 3px var(--accent-ring); }
      input {
        border: none; background: transparent; outline: none; flex: 1;
        color: var(--text-primary); font-size: 13px;
        &::placeholder { color: var(--text-tertiary); }
      }
    }
    .clear-search {
      width: 24px; height: 24px; border-radius: 6px; border: none;
      background: var(--surface); color: var(--text-tertiary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      &:hover { color: var(--text-primary); }
    }
    .record-count {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; font-weight: 600; color: var(--text-tertiary);
      padding: 8px 14px; background: var(--surface-elevated);
      border: 1px solid var(--border); border-radius: 8px;
    }
    .page-size-control {
      display: flex; align-items: center; gap: 6px;
      font-size: 12px; color: var(--text-secondary);
      select {
        height: 32px; padding: 0 8px; border-radius: 6px;
        border: 1px solid var(--border); background: var(--surface-elevated);
        color: var(--text-primary); font-size: 12px;
        &:focus { outline: none; border-color: var(--accent); }
      }
    }
    .toolbar-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 500;
      border: 1px solid var(--border); background: var(--surface-elevated);
      color: var(--text-secondary); cursor: pointer; transition: all 0.2s;
      white-space: nowrap;
      &:hover { border-color: var(--accent); color: var(--accent); }
    }
    .export-btn:hover { border-color: #22c55e; color: #22c55e; }
    .grid-wrapper {
      height: 600px; width: 100%;
      border-radius: 12px; overflow: hidden;
      border: 1px solid var(--border);
    }
    .ag-grid-element { width: 100%; height: 100%; }
  `],
})
export class TransactionGridComponent implements OnInit {
  private txService = inject(TransactionService);
  private themeService = inject(ThemeService);

  @ViewChild(AgGridAngular) agGrid!: AgGridAngular;

  private gridApi!: GridApi;
  private searchSubject = new Subject<string>();

  searchTerm = signal('');
  totalRows = signal(0);
  pageSize = signal(100);
  currentFilterModel = signal<Record<string, any>>({});
  advancedSearchItems = signal<AdvancedSearchItem[]>([]);
  aggRefreshTrigger = signal(0);

  rowSelection = { mode: 'multiRow' as const };

  gridTheme = computed(() => {
    const isDark = this.themeService.darkMode();
    return themeQuartz.withParams({
      accentColor: '#6366f1',
      backgroundColor: isDark ? '#0f1117' : '#ffffff',
      foregroundColor: isDark ? '#e2e8f0' : '#1e293b',
      borderColor: isDark ? '#1e293b' : '#e2e8f0',
      headerBackgroundColor: isDark ? '#151823' : '#f8fafc',
      headerFontWeight: 600,
      rowHoverColor: isDark ? '#1a1f2e' : '#f1f5f9',
      selectedRowBackgroundColor: isDark ? '#1e2340' : '#eef2ff',
      oddRowBackgroundColor: isDark ? '#0f1117' : '#ffffff',
      borderRadius: 0,
      wrapperBorderRadius: 0,
      fontSize: 13,
      headerFontSize: 12,
      spacing: 6,
    });
  });

  defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
    minWidth: 100,
    filterParams: {
      maxNumConditions: 2,
      buttons: ['apply', 'reset'],
    },
  };

  columnDefs: ColDef[] = [
    {
      field: 'reference',
      headerName: 'Reference',
      width: 180,
      filter: 'agTextColumnFilter',
      pinned: 'left',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        return `<span style="font-weight:600;color:var(--accent);font-family:monospace;font-size:12px">${params.value}</span>`;
      },
    },
    {
      field: 'transactionDate',
      headerName: 'Date',
      width: 160,
      filter: 'agDateColumnFilter',
      valueFormatter: (p: ValueFormatterParams) => {
        if (!p.value) return '';
        return new Date(p.value).toLocaleDateString('en-US', {
          year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit',
        });
      },
      filterParams: {
        comparator: (filterDate: Date, cellValue: string) => {
          const cellDate = new Date(cellValue);
          const cell = new Date(cellDate.getFullYear(), cellDate.getMonth(), cellDate.getDate());
          const filter = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate());
          if (cell < filter) return -1;
          if (cell > filter) return 1;
          return 0;
        },
      },
    },
    {
      field: 'transactionType',
      headerName: 'Type',
      width: 110,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const colors: Record<string, string> = {
          WIRE: '#6366f1', ACH: '#0ea5e9', SWIFT: '#8b5cf6', SEPA: '#14b8a6',
          INTERNAL: '#64748b', CHECK: '#f59e0b', CARD: '#ec4899', FX: '#22c55e',
        };
        const c = colors[params.value] || '#6b7280';
        return `<span style="display:inline-flex;align-items:center;padding:2px 10px;border-radius:4px;font-size:11px;font-weight:700;letter-spacing:0.05em;background:${c}18;color:${c}">${params.value}</span>`;
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        if (!params.value) return '';
        const colors: Record<string, string> = {
          COMPLETED: '#22c55e', PENDING: '#f59e0b', FAILED: '#ef4444',
          REVERSED: '#8b5cf6', ON_HOLD: '#f97316', CANCELLED: '#6b7280',
        };
        const c = colors[params.value] || '#6b7280';
        return `<span style="display:inline-flex;align-items:center;gap:6px;font-size:12px;font-weight:600;color:${c}"><span style="width:7px;height:7px;border-radius:50%;background:${c};display:inline-block"></span>${params.value}</span>`;
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      width: 140,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (p: ValueFormatterParams) =>
        p.value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(p.value) : '',
      cellClass: (p: CellClassParams) => (p.value >= 1_000_000 ? 'high-value' : ''),
    },
    {
      field: 'fee',
      headerName: 'Fee',
      width: 100,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (p: ValueFormatterParams) =>
        p.value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.value) : '',
    },
    {
      field: 'currency',
      headerName: 'CCY',
      width: 80,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'senderName',
      headerName: 'Sender',
      width: 200,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        maxNumConditions: 2,
        buttons: ['apply', 'reset'],
      },
    },
    {
      field: 'senderBank',
      headerName: 'Sender Bank',
      width: 200,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'receiverName',
      headerName: 'Receiver',
      width: 200,
      filter: 'agTextColumnFilter',
      filterParams: {
        filterOptions: ['contains', 'equals', 'startsWith', 'endsWith'],
        maxNumConditions: 2,
        buttons: ['apply', 'reset'],
      },
    },
    {
      field: 'receiverBank',
      headerName: 'Receiver Bank',
      width: 200,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 160,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'description',
      headerName: 'Description',
      width: 250,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'region',
      headerName: 'Region',
      width: 140,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'branch',
      headerName: 'Branch',
      width: 150,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'channel',
      headerName: 'Channel',
      width: 120,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'riskScore',
      headerName: 'Risk',
      width: 90,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      cellRenderer: (params: any) => {
        if (params.value == null) return '';
        const v = params.value;
        let color = '#22c55e';
        if (v >= 70) color = '#ef4444';
        else if (v >= 40) color = '#f59e0b';
        return `<span style="font-weight:600;color:${color}">${v}</span>`;
      },
    },
    {
      field: 'exchangeRate',
      headerName: 'FX Rate',
      width: 110,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (p: ValueFormatterParams) => p.value ? p.value.toFixed(4) : '',
    },
    {
      field: 'convertedAmount',
      headerName: 'Converted Amt',
      width: 150,
      filter: 'agNumberColumnFilter',
      type: 'numericColumn',
      valueFormatter: (p: ValueFormatterParams) =>
        p.value != null ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.value) : '',
    },
    {
      field: 'targetCurrency',
      headerName: 'Target CCY',
      width: 100,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'valueDate',
      headerName: 'Value Date',
      width: 120,
      filter: 'agDateColumnFilter',
      valueFormatter: (p: ValueFormatterParams) =>
        p.value ? new Date(p.value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : '',
    },
    {
      field: 'settlementDate',
      headerName: 'Settlement Date',
      width: 140,
      filter: 'agDateColumnFilter',
      valueFormatter: (p: ValueFormatterParams) =>
        p.value ? new Date(p.value).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }) : '',
    },
  ];

  ngOnInit() {
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((term) => {
        this.searchTerm.set(term);
        this.refreshGrid();
      });
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.setDatasource();
  }

  onSearchInput(value: string) {
    this.searchSubject.next(value);
  }

  clearSearch() {
    this.searchTerm.set('');
    this.searchSubject.next('');
    this.refreshGrid();
  }

  onAdvancedSearch(items: AdvancedSearchItem[]) {
    this.advancedSearchItems.set(items);
    this.refreshGrid();
  }

  onAdvancedSearchClear() {
    this.advancedSearchItems.set([]);
    this.refreshGrid();
  }

  onSortChanged(_event: SortChangedEvent) {}
  onFilterChanged(_event: FilterChangedEvent) {
    this.currentFilterModel.set(this.gridApi.getFilterModel());
    this.aggRefreshTrigger.update((v) => v + 1);
  }

  onPageSizeChange(size: any) {
    const s = parseInt(size, 10);
    this.pageSize.set(s);
    this.gridApi.updateGridOptions({ paginationPageSize: s, cacheBlockSize: s });
    this.refreshGrid();
  }

  resetFilters() {
    this.searchTerm.set('');
    this.advancedSearchItems.set([]);
    this.gridApi.setFilterModel(null);
    this.currentFilterModel.set({});
    this.refreshGrid();
  }

  exportCsv() {
    this.gridApi.exportDataAsCsv({
      fileName: `bank_transactions_${new Date().toISOString().slice(0, 10)}.csv`,
    });
  }

  private setDatasource() {
    const datasource: IServerSideDatasource = {
      getRows: (params: IServerSideGetRowsParams) => {
        const request = params.request;
        this.txService
          .getRows({
            startRow: request.startRow ?? 0,
            endRow: request.endRow ?? 100,
            sortModel: request.sortModel as any,
            filterModel: request.filterModel as any,
            searchTerm: this.searchTerm(),
            advancedSearch: this.advancedSearchItems(),
          })
          .subscribe({
            next: (response) => {
              this.totalRows.set(response.lastRow);
              params.success({ rowData: response.rows, rowCount: response.lastRow });
            },
            error: () => params.fail(),
          });
      },
    };
    this.gridApi.setGridOption('serverSideDatasource', datasource);
  }

  private refreshGrid() {
    this.gridApi.paginationGoToFirstPage();
    this.setDatasource();
    this.aggRefreshTrigger.update((v) => v + 1);
  }
}
