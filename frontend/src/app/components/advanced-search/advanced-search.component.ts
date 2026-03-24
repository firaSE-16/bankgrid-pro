import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdvancedSearchItem } from '../../models/transaction.model';

interface SearchRow {
  column: string;
  operator: string;
  value: string;
  valueTo: string;
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="advanced-search" [class.expanded]="expanded()">
      <button class="toggle-btn" (click)="expanded.set(!expanded())">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        Advanced Search
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" [style.transform]="expanded() ? 'rotate(180deg)' : ''">
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      @if (expanded()) {
        <div class="search-panel">
          <div class="search-rows">
            @for (row of rows(); track $index) {
              <div class="search-row">
                <select [(ngModel)]="row.column" class="field-select">
                  <option value="">Select Column</option>
                  @for (col of columns; track col.field) {
                    <option [value]="col.field">{{ col.label }}</option>
                  }
                </select>
                <select [(ngModel)]="row.operator" class="operator-select">
                  @for (op of getOperators(row.column); track op.value) {
                    <option [value]="op.value">{{ op.label }}</option>
                  }
                </select>
                <input type="text" [(ngModel)]="row.value" class="value-input" placeholder="Value"
                  [type]="getInputType(row.column)" />
                @if (row.operator === 'between') {
                  <input type="text" [(ngModel)]="row.valueTo" class="value-input" placeholder="To"
                    [type]="getInputType(row.column)" />
                }
                <button class="remove-btn" (click)="removeRow($index)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            }
          </div>
          <div class="search-actions">
            <button class="add-btn" (click)="addRow()">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Condition
            </button>
            <div class="action-group">
              <button class="clear-btn" (click)="clear()">Clear</button>
              <button class="apply-btn" (click)="apply()">Apply Search</button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .advanced-search { margin-bottom: 16px; }
    .toggle-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 8px 16px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface-elevated);
      color: var(--text-secondary); cursor: pointer; font-size: 13px; font-weight: 500;
      transition: all 0.2s;
      &:hover { border-color: var(--accent); color: var(--accent); }
    }
    .expanded .toggle-btn { border-color: var(--accent); color: var(--accent); background: var(--accent-muted); }
    .search-panel {
      margin-top: 12px; padding: 16px;
      background: var(--surface-elevated); border: 1px solid var(--border); border-radius: 12px;
    }
    .search-rows { display: flex; flex-direction: column; gap: 8px; }
    .search-row { display: flex; gap: 8px; align-items: center; }
    select, .value-input {
      height: 36px; padding: 0 12px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-primary); font-size: 13px;
      transition: border-color 0.2s;
      &:focus { outline: none; border-color: var(--accent); }
    }
    .field-select { width: 200px; }
    .operator-select { width: 160px; }
    .value-input { flex: 1; min-width: 150px; }
    .remove-btn {
      width: 36px; height: 36px; border-radius: 8px; border: 1px solid var(--border);
      background: var(--surface); color: var(--text-tertiary); cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      &:hover { border-color: #ef4444; color: #ef4444; background: rgba(239, 68, 68, 0.08); }
    }
    .search-actions {
      display: flex; justify-content: space-between; align-items: center;
      margin-top: 12px; padding-top: 12px; border-top: 1px solid var(--border);
    }
    .action-group { display: flex; gap: 8px; }
    .add-btn {
      display: flex; align-items: center; gap: 6px;
      padding: 8px 14px; border-radius: 8px;
      border: 1px dashed var(--border); background: transparent;
      color: var(--text-tertiary); cursor: pointer; font-size: 13px;
      &:hover { border-color: var(--accent); color: var(--accent); }
    }
    .clear-btn {
      padding: 8px 16px; border-radius: 8px;
      border: 1px solid var(--border); background: var(--surface);
      color: var(--text-secondary); cursor: pointer; font-size: 13px;
      &:hover { border-color: var(--text-tertiary); }
    }
    .apply-btn {
      padding: 8px 20px; border-radius: 8px;
      border: none; background: var(--accent); color: white;
      cursor: pointer; font-size: 13px; font-weight: 600;
      &:hover { opacity: 0.9; }
    }
  `],
})
export class AdvancedSearchComponent {
  readonly searchApplied = output<AdvancedSearchItem[]>();
  readonly searchCleared = output<void>();

  expanded = signal(false);
  rows = signal<SearchRow[]>([{ column: '', operator: 'equals', value: '', valueTo: '' }]);

  columns = [
    { field: 'reference', label: 'Reference', type: 'text' },
    { field: 'transactionType', label: 'Type', type: 'text' },
    { field: 'status', label: 'Status', type: 'text' },
    { field: 'amount', label: 'Amount', type: 'number' },
    { field: 'fee', label: 'Fee', type: 'number' },
    { field: 'currency', label: 'Currency', type: 'text' },
    { field: 'senderName', label: 'Sender', type: 'text' },
    { field: 'receiverName', label: 'Receiver', type: 'text' },
    { field: 'senderBank', label: 'Sender Bank', type: 'text' },
    { field: 'receiverBank', label: 'Receiver Bank', type: 'text' },
    { field: 'transactionDate', label: 'Date', type: 'date' },
    { field: 'category', label: 'Category', type: 'text' },
    { field: 'region', label: 'Region', type: 'text' },
    { field: 'riskScore', label: 'Risk Score', type: 'number' },
  ];

  getOperators(column: string) {
    const col = this.columns.find((c) => c.field === column);
    if (!col || col.type === 'text') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'startsWith', label: 'Starts With' },
      ];
    }
    if (col.type === 'number') {
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' },
        { value: 'between', label: 'Between' },
      ];
    }
    return [
      { value: 'equals', label: 'Equals' },
      { value: 'greaterThan', label: 'After' },
      { value: 'lessThan', label: 'Before' },
      { value: 'between', label: 'Between' },
    ];
  }

  getInputType(column: string): string {
    const col = this.columns.find((c) => c.field === column);
    if (col?.type === 'date') return 'date';
    if (col?.type === 'number') return 'number';
    return 'text';
  }

  addRow() {
    this.rows.update((r) => [...r, { column: '', operator: 'equals', value: '', valueTo: '' }]);
  }

  removeRow(index: number) {
    this.rows.update((r) => r.filter((_, i) => i !== index));
  }

  apply() {
    const items: AdvancedSearchItem[] = this.rows()
      .filter((r) => r.column && r.value)
      .map((r) => ({
        column: r.column,
        operator: r.operator,
        value: r.value,
        valueTo: r.operator === 'between' ? r.valueTo : undefined,
      }));
    this.searchApplied.emit(items);
  }

  clear() {
    this.rows.set([{ column: '', operator: 'equals', value: '', valueTo: '' }]);
    this.searchCleared.emit();
  }
}
