import { Component, input, signal, output, inject, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe, UpperCasePipe } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { AggregationResult, AdvancedSearchItem } from '../../models/transaction.model';

@Component({
  selector: 'app-aggregation-panel',
  standalone: true,
  imports: [FormsModule, DecimalPipe, UpperCasePipe],
  template: `
    <div class="agg-panel" [class.expanded]="expanded()">
      <button class="agg-toggle" (click)="togglePanel()">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 20V10M12 20V4M6 20v-6"/>
        </svg>
        Aggregations
        @if (selectedFunc()) {
          <span class="active-badge">{{ selectedFunc() | uppercase }}</span>
        }
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [style.transform]="expanded() ? 'rotate(180deg)' : ''">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      @if (expanded()) {
        <div class="agg-content">
          <div class="func-selector">
            @for (fn of functions; track fn) {
              <button class="func-btn" [class.active]="selectedFunc() === fn" (click)="selectFunction(fn)">
                {{ fn }}
              </button>
            }
          </div>
          @if (results() && selectedFunc()) {
            <div class="agg-results">
              @for (col of numericColumns; track col.field) {
                @if (results()![col.field]) {
                  <div class="agg-item">
                    <span class="agg-label">{{ col.label }}</span>
                    <span class="agg-value">{{ getDisplayValue(col.field) | number:'1.2-2' }}</span>
                  </div>
                }
              }
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .agg-panel {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.2s;
    }
    .agg-toggle {
      width: 100%; display: flex; align-items: center; gap: 8px;
      padding: 12px 16px; border: none; background: transparent;
      color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500;
      &:hover { color: var(--text-primary); }
    }
    .expanded .agg-toggle { border-bottom: 1px solid var(--border); color: var(--accent); }
    .active-badge {
      font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px;
      background: var(--accent); color: white; letter-spacing: 0.05em;
    }
    .agg-content { padding: 16px; }
    .func-selector { display: flex; gap: 6px; margin-bottom: 16px; }
    .func-btn {
      padding: 6px 16px; border-radius: 6px; font-size: 12px; font-weight: 600;
      border: 1px solid var(--border); background: var(--surface); color: var(--text-secondary);
      cursor: pointer; text-transform: uppercase; letter-spacing: 0.05em;
      transition: all 0.2s;
      &.active { background: var(--accent); color: white; border-color: var(--accent); }
      &:hover:not(.active) { border-color: var(--accent); color: var(--accent); }
    }
    .agg-results {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 8px;
    }
    .agg-item {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 14px; border-radius: 8px; background: var(--surface);
    }
    .agg-label { font-size: 12px; color: var(--text-tertiary); font-weight: 500; }
    .agg-value { font-size: 14px; font-weight: 700; color: var(--text-primary); }
  `],
})
export class AggregationPanelComponent {
  filterModel = input<Record<string, any>>({});
  searchTerm = input<string>('');
  advancedSearch = input<AdvancedSearchItem[]>([]);
  readonly refreshTrigger = input<number>(0);

  private txService = inject(TransactionService);

  expanded = signal(false);
  selectedFunc = signal<string>('');
  results = signal<AggregationResult | null>(null);

  functions = ['Sum', 'Average', 'Max', 'Min'];
  numericColumns = [
    { field: 'amount', label: 'Amount' },
    { field: 'fee', label: 'Fee' },
    { field: 'convertedAmount', label: 'Converted Amount' },
    { field: 'riskScore', label: 'Risk Score' },
  ];

  constructor() {
    effect(() => {
      this.refreshTrigger();
      if (this.selectedFunc()) this.loadAggregations();
    });
  }

  togglePanel() {
    this.expanded.update((v) => !v);
  }

  selectFunction(fn: string) {
    this.selectedFunc.set(fn);
    this.loadAggregations();
  }

  private loadAggregations() {
    this.txService
      .getAggregations({
        columns: this.numericColumns.map((c) => c.field),
        filterModel: this.filterModel(),
        searchTerm: this.searchTerm(),
        advancedSearch: this.advancedSearch(),
      })
      .subscribe((data) => this.results.set(data));
  }

  getDisplayValue(field: string): number {
    const r = this.results()?.[field];
    if (!r) return 0;
    switch (this.selectedFunc()) {
      case 'Sum': return r.sum;
      case 'Average': return r.avg;
      case 'Max': return r.max;
      case 'Min': return r.min;
      default: return 0;
    }
  }
}
