import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';

@Component({
  selector: 'app-budget',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="budget">
      <header class="budget__header">
        <h1>Presupuesto Mensual</h1>
        <p class="budget__subtitle">Basado en la regla 50/30/20</p>
      </header>

      @if (budgetService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else if (budgetService.budget()) {
        <div class="budget__total">
          <span class="budget__total-label">Ingreso Total</span>
          <span class="budget__total-value">{{ formatCurrency(budgetService.budget()!.total_income) }}</span>
        </div>

        <div class="budget__chart">
          <div class="chart-visual">
            <div class="chart-circle">
              <svg viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--border)" stroke-width="10"/>
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--cyan)" stroke-width="10"
                        [attr.stroke-dasharray]="getCircle('cyan')" stroke-dashoffset="0" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--purple)" stroke-width="10"
                        [attr.stroke-dasharray]="getCircle('purple')" [attr.stroke-dashoffset]="getOffset('cyan')" />
                <circle cx="50" cy="50" r="45" fill="none" stroke="var(--accent)" stroke-width="10"
                        [attr.stroke-dasharray]="getCircle('accent')" [attr.stroke-dashoffset]="getOffset('cyan', 'purple')" />
              </svg>
              <div class="chart-center">
                <span class="chart-center__amount">{{ formatCurrency(budgetService.budget()!.total_income) }}</span>
                <span class="chart-center__label">mes</span>
              </div>
            </div>
          </div>
        </div>

        <div class="budget__recommendations">
          @for (rec of budgetService.budget()!.recommendations; track rec.category) {
            <div class="recommendation" [class]="'recommendation--' + getCategoryClass(rec.category)">
              <div class="recommendation__header">
                <span class="recommendation__name">{{ rec.category }}</span>
                <span class="recommendation__amount">{{ formatCurrency(rec.amount) }}</span>
              </div>
              <div class="recommendation__bar">
                <div class="recommendation__progress" [style.width.%]="rec.percentage"></div>
              </div>
              <p class="recommendation__description">{{ rec.description }}</p>
            </div>
          }
        </div>

        <div class="budget__info">
          <div class="info-card">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <div>
              <h4>¿Qué es la regla 50/30/20?</h4>
              <p>Es una guía simple para distribuir tu ingreso mensual: 50% para necesidades (vivienda, comida, servicios), 30% para deseos (entretenimiento, restaurantes), y 20% para ahorros y pago de deudas.</p>
            </div>
          </div>
        </div>
      } @else {
        <div class="empty">
          <p>Agrega ingresos para ver las recomendaciones de presupuesto</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .budget {
      padding: 2rem;
      max-width: 900px;
      margin: 0 auto;
    }

    .budget__header {
      margin-bottom: 2rem;
    }

    .budget__header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .budget__subtitle {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .budget__total {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      text-align: center;
      margin-bottom: 2rem;
    }

    .budget__total-label {
      display: block;
      font-size: 0.875rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 0.5rem;
    }

    .budget__total-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--accent);
    }

    .budget__chart {
      display: flex;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .chart-visual {
      position: relative;
    }

    .chart-circle {
      width: 220px;
      height: 220px;
      position: relative;
    }

    .chart-circle svg {
      width: 100%;
      height: 100%;
      transform: rotate(-90deg);
    }

    .chart-circle circle {
      fill: none;
    }

    .chart-center {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .chart-center__amount {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
    }

    .chart-center__label {
      font-size: 0.875rem;
      color: var(--text-secondary);
    }

    .budget__recommendations {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .recommendation {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      border-left: 4px solid var(--cyan);
    }

    .recommendation--needs {
      border-left-color: var(--cyan);
    }

    .recommendation--wants {
      border-left-color: var(--purple);
    }

    .recommendation--savings {
      border-left-color: var(--accent);
    }

    .recommendation__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .recommendation__name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 1.0625rem;
    }

    .recommendation__amount {
      font-weight: 700;
      font-size: 1.25rem;
      color: var(--text-primary);
    }

    .recommendation__bar {
      height: 12px;
      background: var(--border);
      border-radius: 6px;
      overflow: hidden;
      margin-bottom: 1rem;
    }

    .recommendation__progress {
      height: 100%;
      border-radius: 6px;
      transition: width 0.5s ease;
    }

    .recommendation--needs .recommendation__progress {
      background: linear-gradient(90deg, var(--cyan), #00a8cc);
    }

    .recommendation--wants .recommendation__progress {
      background: linear-gradient(90deg, var(--purple), #9333ea);
    }

    .recommendation--savings .recommendation__progress {
      background: linear-gradient(90deg, var(--accent), #00cc82);
    }

    .recommendation__description {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.5;
    }

    .budget__info {
      margin-top: 2rem;
    }

    .info-card {
      display: flex;
      gap: 1rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
    }

    .info-card svg {
      flex-shrink: 0;
      color: var(--accent);
    }

    .info-card h4 {
      font-size: 1rem;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .info-card p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .loading, .empty {
      display: flex;
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
  `]
})
export class BudgetComponent implements OnInit {
  budgetService = inject(BudgetService);

  private circumference = 2 * Math.PI * 45;

  ngOnInit() {
    this.budgetService.loadBudget().subscribe();
  }

  getCircle(type: string): string {
    return `${this.circumference * 0.5} ${this.circumference * 0.3} ${this.circumference * 0.2}`;
  }

  getOffset(...types: string[]): number {
    let offset = 0;
    for (const type of types) {
      offset += this.circumference * this.getPercentage(type);
    }
    return offset;
  }

  getPercentage(type: string): number {
    const budget = this.budgetService.budget();
    if (!budget) return 0;
    
    const percentages: Record<string, number> = {
      'cyan': 0.5,
      'purple': 0.3,
      'accent': 0.2
    };
    return percentages[type] || 0;
  }

  getCategoryClass(category: string): string {
    if (category.includes('Necesidades')) return 'needs';
    if (category.includes('Deseos')) return 'wants';
    return 'savings';
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value);
  }
}