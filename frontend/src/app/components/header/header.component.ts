import { Component, inject } from '@angular/core';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  template: `
    <header class="app-header">
      <div class="header-left">
        <div class="logo">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <rect width="32" height="32" rx="8" fill="var(--accent)"/>
            <path d="M8 22V10l8 6-8 6zm8 0V10l8 6-8 6z" fill="white" opacity="0.9"/>
          </svg>
          <div class="brand">
            <h1>BankGrid<span>Pro</span></h1>
            <p>Transaction Intelligence Platform</p>
          </div>
        </div>
      </div>
      <div class="header-right">
        <button class="theme-toggle" (click)="theme.toggle()" [attr.aria-label]="theme.darkMode() ? 'Switch to light mode' : 'Switch to dark mode'">
          @if (theme.darkMode()) {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
            </svg>
          } @else {
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
            </svg>
          }
        </button>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
      height: 64px;
      background: var(--surface-elevated);
      border-bottom: 1px solid var(--border);
      backdrop-filter: blur(12px);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .header-left { display: flex; align-items: center; gap: 24px; }
    .logo { display: flex; align-items: center; gap: 12px; }
    .brand h1 {
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.2;
      letter-spacing: -0.02em;
      span { color: var(--accent); font-weight: 800; }
    }
    .brand p {
      font-size: 11px;
      color: var(--text-tertiary);
      letter-spacing: 0.04em;
      text-transform: uppercase;
      font-weight: 500;
    }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .theme-toggle {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
      &:hover {
        background: var(--surface-hover);
        color: var(--accent);
        border-color: var(--accent-muted);
      }
    }
  `],
})
export class HeaderComponent {
  theme = inject(ThemeService);
}
