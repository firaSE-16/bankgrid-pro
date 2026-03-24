import { Component, inject, OnInit, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { DashboardStats } from '../../models/transaction.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DecimalPipe],
  template: `
    <div class="dashboard">
      @if (stats()) {
        <div class="stat-cards">
          <div class="stat-card primary">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Volume</span>
              <span class="stat-value">\${{ stats()!.totalVolume | number:'1.0-0' }}</span>
            </div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Total Transactions</span>
              <span class="stat-value">{{ stats()!.totalTransactions | number }}</span>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Average Amount</span>
              <span class="stat-value">\${{ stats()!.avgAmount | number:'1.2-2' }}</span>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div class="stat-content">
              <span class="stat-label">Completed Rate</span>
              <span class="stat-value">{{ getCompletedRate() }}%</span>
            </div>
          </div>
        </div>

        <div class="breakdown-row">
          <div class="breakdown-card">
            <h3>Status Breakdown</h3>
            <div class="breakdown-items">
              @for (item of stats()!.statusBreakdown; track item.status) {
                <div class="breakdown-item">
                  <div class="item-label">
                    <span class="status-dot" [attr.data-status]="item.status"></span>
                    <span>{{ item.status }}</span>
                  </div>
                  <span class="item-value">{{ +item.count | number }}</span>
                </div>
              }
            </div>
          </div>
          <div class="breakdown-card">
            <h3>Transaction Types</h3>
            <div class="breakdown-items">
              @for (item of stats()!.typeBreakdown; track item.type) {
                <div class="breakdown-item">
                  <div class="item-label">
                    <span class="type-badge">{{ item.type }}</span>
                  </div>
                  <div class="item-meta">
                    <span class="item-value">{{ +item.count | number }}</span>
                    <span class="item-volume">\${{ +item.volume | number:'1.0-0' }}</span>
                  </div>
                </div>
              }
            </div>
          </div>
        </div>
      } @else {
        <div class="loading-state">
          <div class="spinner"></div>
          <span>Loading dashboard data...</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .dashboard { padding: 0 0 20px; }
    .stat-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      display: flex;
      align-items: flex-start;
      gap: 16px;
      transition: all 0.2s;
      &:hover { border-color: var(--border-hover); transform: translateY(-1px); box-shadow: var(--shadow-md); }
    }
    .stat-icon {
      width: 48px; height: 48px; border-radius: 12px;
      display: flex; align-items: center; justify-content: center; flex-shrink: 0;
    }
    .primary .stat-icon { background: rgba(99, 102, 241, 0.12); color: #6366f1; }
    .accent .stat-icon { background: rgba(14, 165, 233, 0.12); color: #0ea5e9; }
    .success .stat-icon { background: rgba(34, 197, 94, 0.12); color: #22c55e; }
    .info .stat-icon { background: rgba(168, 85, 247, 0.12); color: #a855f7; }
    .stat-label { display: block; font-size: 12px; color: var(--text-tertiary); font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 4px; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--text-primary); letter-spacing: -0.02em; }
    .breakdown-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
    .breakdown-card {
      background: var(--surface-elevated);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
      h3 { font-size: 14px; font-weight: 600; color: var(--text-primary); margin: 0 0 16px; }
    }
    .breakdown-items { display: flex; flex-direction: column; gap: 10px; }
    .breakdown-item {
      display: flex; align-items: center; justify-content: space-between;
      padding: 8px 12px; border-radius: 8px; background: var(--surface);
    }
    .item-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: var(--text-secondary); }
    .item-value { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .item-meta { display: flex; align-items: center; gap: 12px; }
    .item-volume { font-size: 12px; color: var(--text-tertiary); }
    .status-dot {
      width: 8px; height: 8px; border-radius: 50%; display: inline-block;
      &[data-status="COMPLETED"] { background: #22c55e; }
      &[data-status="PENDING"] { background: #f59e0b; }
      &[data-status="FAILED"] { background: #ef4444; }
      &[data-status="REVERSED"] { background: #8b5cf6; }
      &[data-status="ON_HOLD"] { background: #f97316; }
      &[data-status="CANCELLED"] { background: #6b7280; }
    }
    .type-badge {
      font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px;
      background: var(--accent-muted); color: var(--accent);
    }
    .loading-state {
      display: flex; align-items: center; justify-content: center; gap: 12px;
      padding: 60px; color: var(--text-tertiary);
    }
    .spinner {
      width: 24px; height: 24px; border: 3px solid var(--border);
      border-top-color: var(--accent); border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (max-width: 1024px) {
      .stat-cards { grid-template-columns: repeat(2, 1fr); }
      .breakdown-row { grid-template-columns: 1fr; }
    }
  `],
})
export class DashboardComponent implements OnInit {
  private txService = inject(TransactionService);
  stats = signal<DashboardStats | null>(null);

  ngOnInit() {
    this.txService.getDashboardStats().subscribe((data) => this.stats.set(data));
  }

  getCompletedRate(): string {
    const s = this.stats();
    if (!s) return '0';
    const completed = s.statusBreakdown.find((x) => x.status === 'COMPLETED');
    if (!completed) return '0';
    return ((+completed.count / s.totalTransactions) * 100).toFixed(1);
  }
}
