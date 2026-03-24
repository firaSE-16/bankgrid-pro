import { Component } from '@angular/core';
import { HeaderComponent } from './components/header/header.component';
import { TransactionGridComponent } from './components/transaction-grid/transaction-grid.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [HeaderComponent, TransactionGridComponent],
  template: `
    <app-header />
    <main class="app-main">
      <app-transaction-grid />
    </main>
  `,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    .app-main {
      flex: 1;
      padding: 20px 24px 40px;
      max-width: 1800px;
      width: 100%;
      margin: 0 auto;
      box-sizing: border-box;
    }
  `],
})
export class App {}
