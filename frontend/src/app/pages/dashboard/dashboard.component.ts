import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dashboard">
      <header class="dashboard__header">
        <h1>Dashboard</h1>
        <button class="btn-refresh" (click)="refresh()">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 4v6h-6M1 20v-6h6"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
        </button>
      </header>

      @if (dashboard.loading()) {
        <div class="dashboard__loading">
          <div class="spinner"></div>
          <p>Cargando...</p>
        </div>
      } @else if (dashboard.error()) {
        <div class="dashboard__error">
          <p>{{ dashboard.error() }}</p>
        </div>
      } @else if (dashboard.summary()) {
        <div class="dashboard__grid">
          <div class="card card--income">
            <span class="card__label">Ingresos Totales</span>
            <span class="card__value">{{ formatCurrency(dashboard.summary()!.total_incomes) }}</span>
          </div>
          
          <div class="card card--expense">
            <span class="card__label">Gastos Diarios</span>
            <span class="card__value">{{ formatCurrency(dashboard.summary()!.total_daily_expenses) }}</span>
          </div>
          
          <div class="card card--fixed">
            <span class="card__label">Gastos Fijos</span>
            <span class="card__value">{{ formatCurrency(dashboard.summary()!.total_fixed_expenses) }}</span>
          </div>
          
          <div class="card card--debt">
            <span class="card__label">Deudas Totales</span>
            <span class="card__value">{{ formatCurrency(dashboard.summary()!.total_debts) }}</span>
          </div>
          
          <div class="card card--balance" [class.positive]="dashboard.summary()!.balance >= 0" [class.negative]="dashboard.summary()!.balance < 0">
            <span class="card__label">Balance</span>
            <span class="card__value">{{ formatCurrency(dashboard.summary()!.balance) }}</span>
          </div>
        </div>

        @if (dashboard.categories().length > 0) {
          <div class="dashboard__categories">
            <h2>Gastos por Categoría</h2>
            <div class="categories__list">
              @for (cat of dashboard.categories(); track cat.category) {
                <div class="category-item">
                  <div class="category-item__header">
                    <span class="category-item__name">{{ cat.category }}</span>
                    <span class="category-item__percentage">{{ cat.percentage }}%</span>
                  </div>
                  <div class="category-item__bar">
                    <div class="category-item__progress" [style.width.%]="cat.percentage"></div>
                  </div>
                  <span class="category-item__amount">{{ formatCurrency(cat.total) }}</span>
                </div>
              }
            </div>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .dashboard__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .dashboard__header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .btn-refresh {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 1px solid var(--border);
      background: var(--surface);
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-refresh:hover {
      background: var(--surface-hover);
      color: var(--accent);
    }

    .dashboard__loading, .dashboard__error {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      color: var(--text-secondary);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid var(--border);
      border-top-color: var(--accent);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .dashboard__grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .card:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .card__label {
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card__value {
      font-size: 1.75rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .card--income { border-left: 4px solid var(--accent); }
    .card--expense { border-left: 4px solid var(--danger); }
    .card--fixed { border-left: 4px solid var(--warning); }
    .card--debt { border-left: 4px solid var(--purple); }
    .card--balance { border-left: 4px solid var(--accent); }

    .card--balance.positive .card__value { color: var(--accent); }
    .card--balance.negative .card__value { color: var(--danger); }

    .dashboard__categories {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .dashboard__categories h2 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1.5rem;
    }

    .categories__list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category-item {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .category-item__header {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
    }

    .category-item__name {
      color: var(--text-primary);
    }

    .category-item__percentage {
      color: var(--text-secondary);
    }

    .category-item__bar {
      height: 8px;
      background: var(--border);
      border-radius: 4px;
      overflow: hidden;
    }

    .category-item__progress {
      height: 100%;
      background: linear-gradient(90deg, var(--accent), var(--cyan));
      border-radius: 4px;
      transition: width 0.3s ease;
    }

    .category-item__amount {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }
  `]
})
export class DashboardComponent implements OnInit {
  dashboard = inject(DashboardService);

  ngOnInit() {
    this.dashboard.loadSummary().subscribe();
    this.dashboard.loadCategories().subscribe();
  }

  refresh() {
    this.dashboard.refreshAll().subscribe();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }
}