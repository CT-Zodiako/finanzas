import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OptimizeService } from '../../services/optimize.service';
import { IncomeService } from '../../services/income.service';
import { FixedExpenseService } from '../../services/fixed-expense.service';
import { DebtService } from '../../services/debt.service';
import { OptimizeInput, OptimizeResult, AlertsResult } from '../../models/optimize.model';
import { parseNumber } from '../../utils/number.utils';

@Component({
  selector: 'app-optimize',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="optimize">
      <header class="optimize__header">
        <h1>Optimización de Deudas</h1>
        <button class="btn btn--primary" (click)="calculate()">
          Calcular
        </button>
      </header>

      @if (optimizeService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else if (optimizeService.error()) {
        <div class="error">{{ optimizeService.error() }}</div>
      } @else if (optimizeService.optimizeResult()) {
        @let result = optimizeService.optimizeResult()!;
        
        <div class="status" [class]="'status--' + result.estado.toLowerCase()">
          <span class="status__icon">
            @switch (result.estado) {
              @case ('CRISIS') { ⚠️ }
              @case ('INSUFICIENTE') { ⚡ }
              @case ('ESTABLE') { ✅ }
            }
          </span>
          <span class="status__text">{{ result.estado }}</span>
        </div>

        <div class="metrics">
          <div class="metric">
            <span class="metric__label">Ingreso mensual</span>
            <span class="metric__value">{{ formatCurrency(result.capacidad_pago + (gastosFijos$() || 0)) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Gastos fijos</span>
            <span class="metric__value">{{ formatCurrency(gastosFijos$()) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Cuotas mínimas</span>
            <span class="metric__value">{{ formatCurrency(result.total_cuotas_minimas) }}</span>
          </div>
          <div class="metric">
            <span class="metric__label">Para pagos extra</span>
            <span class="metric__value" [class.danger]="result.disponible <= 0">
              {{ formatCurrency(result.disponible) }}
            </span>
          </div>
          <div class="metric">
            <span class="metric__label">Carga financiera</span>
            <span class="metric__value" [class.danger]="result.carga_financiera > 0.5" [class.warning]="result.carga_financiera > 0.3 && result.carga_financiera <= 0.5">
              {{ (result.carga_financiera * 100).toFixed(1) }}%
            </span>
          </div>
        </div>

        @if (optimizeService.alerts() && optimizeService.alerts()!.alertas.length > 0) {
          <div class="alerts">
            <h3>Alertas</h3>
            @for (alert of optimizeService.alerts()!.alertas; track alert.mensaje) {
              <div class="alert" [class]="'alert--' + alert.nivel">
                <span class="alert__icon">
                  @switch (alert.nivel) {
                    @case ('critico') { 🔴 }
                    @case ('alto') { 🟠 }
                    @default { 🟡 }
                  }
                </span>
                <span>{{ alert.mensaje }}</span>
              </div>
            }
          </div>
        }

        <div class="payment-plan">
          <h3>Plan de Pagos</h3>
          @if (result.payment_plan.length === 0) {
            <p class="empty">No hay plan de pagos disponible</p>
          } @else {
            <div class="plan-list">
              @for (plan of result.payment_plan; track plan.nombre) {
                <div class="plan-item">
                  <div class="plan-item__info">
                    <span class="plan-item__name">{{ plan.nombre }}</span>
                  </div>
                  <div class="plan-item__amounts">
                    <span class="plan-item__minimo">Mínimo: {{ formatCurrency(plan.pago_minimo) }}</span>
                    <span class="plan-item__extra">Extra: {{ formatCurrency(plan.pago_extra) }}</span>
                    <span class="plan-item__total">Total: {{ formatCurrency(plan.pago_total) }}</span>
                  </div>
                </div>
              }
            </div>
          }
        </div>

        <div class="summary">
          <div class="summary__total">
            <span>Total a pagar:</span>
            <span class="summary__value">
              {{ formatCurrency(result.payment_plan.reduce((sum, p) => sum + p.pago_total, 0)) }}
            </span>
          </div>
        </div>

      } @else {
        <div class="empty">
          <p>Presiona "Calcular" para obtener el plan de optimización</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .optimize {
      padding: 2rem;
      max-width: 1100px;
      margin: 0 auto;
    }

    .optimize__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .optimize__header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 10px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
    }

    .btn--primary {
      background: var(--accent);
      color: var(--bg);
    }

    .btn--primary:hover {
      filter: brightness(1.1);
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem 1.5rem;
      border-radius: 16px;
      margin-bottom: 2rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .status--crisis {
      background: rgba(239, 68, 68, 0.15);
      color: #ef4444;
    }

    .status--insuficiente {
      background: rgba(251, 146, 60, 0.15);
      color: #fb923c;
    }

    .status--estable {
      background: rgba(0, 255, 163, 0.15);
      color: var(--accent);
    }

    .status__icon {
      font-size: 1.5rem;
    }

    .metrics {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .metric {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.25rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .metric__label {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .metric__value {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .metric__value.danger {
      color: var(--danger);
    }

    .metric__value.warning {
      color: #fb923c;
    }

    .alerts {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .alerts h3 {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .alert {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      margin-bottom: 0.5rem;
      font-size: 0.9375rem;
    }

    .alert:last-child {
      margin-bottom: 0;
    }

    .alert--critico {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    .alert--alto {
      background: rgba(251, 146, 60, 0.1);
      color: #fb923c;
    }

    .alert--medio {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
    }

    .alert__icon {
      font-size: 1rem;
    }

    .payment-plan {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .payment-plan h3 {
      font-size: 1rem;
      color: var(--text-secondary);
      margin-bottom: 1rem;
    }

    .plan-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .plan-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
    }

    .plan-item__name {
      font-weight: 600;
      color: var(--text-primary);
    }

    .plan-item__amounts {
      display: flex;
      gap: 1rem;
      font-size: 0.875rem;
    }

    .plan-item__minimo {
      color: var(--text-secondary);
    }

    .plan-item__extra {
      color: var(--accent);
    }

    .plan-item__total {
      color: var(--text-primary);
      font-weight: 500;
    }

    .summary {
      display: flex;
      justify-content: flex-end;
      padding: 1rem;
    }

    .summary__total {
      display: flex;
      gap: 1rem;
      font-size: 1.125rem;
    }

    .summary__value {
      font-weight: 700;
      color: var(--accent);
    }

    .loading, .error, .empty {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4rem;
      color: var(--text-secondary);
    }

    .error {
      color: var(--danger);
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
export class OptimizeComponent implements OnInit {
  optimizeService = inject(OptimizeService);
  incomeService = inject(IncomeService);
  fixedExpenseService = inject(FixedExpenseService);
  debtService = inject(DebtService);

  ngOnInit() {
    this.calculate();
  }

  ingresos$ = computed(() => 
    this.incomeService.incomes()
      .filter(i => i.is_recurring)
      .reduce((sum, i) => sum + parseNumber(i.amount), 0)
  );

  gastosFijos$ = computed(() => 
    this.fixedExpenseService.expenses()
      .filter(e => e.is_active)
      .reduce((sum, e) => sum + parseNumber(e.amount), 0)
  );

  calculate() {
    this.incomeService.loadIncomes().subscribe();
    this.fixedExpenseService.loadExpenses().subscribe();
    this.debtService.loadDebts().subscribe();

    setTimeout(() => {
      const input: OptimizeInput = {
        ingreso_mensual: this.ingresos$(),
        gastos_fijos: this.gastosFijos$(),
        ahorro_minimo: 0,
        deudas: this.debtService.debts()
          .filter(d => d.is_active)
          .map(d => ({
            nombre: d.name,
            saldo_total: d.remaining_amount,
            cuota_minima: d.monthly_payment,
            tasa_interes_mensual: d.tasa_interes_mensual || 0,
            fecha_limite: d.fecha_limite || new Date().toISOString().split('T')[0],
            tipo: d.tipo || 'credito'
          }))
      };

      if (input.deudas.length > 0) {
        this.optimizeService.calculate(input).subscribe({
          next: () => this.loadAlerts(input)
        });
      }
    }, 500);
  }

  loadAlerts(input: OptimizeInput) {
    this.optimizeService.getAlerts(input).subscribe();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(value || 0);
  }
}
