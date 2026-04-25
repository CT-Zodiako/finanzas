import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IncomeService } from '../../services/income.service';
import { Income, IncomeCreate } from '../../models/income.model';
import { parseNumber } from '../../utils/number.utils';

@Component({
  selector: 'app-incomes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="incomes">
      <header class="incomes__header">
        <div>
          <h1>Ingresos</h1>
          <p class="subtitle">Registra y gestiona tus fuentes de ingreso</p>
        </div>
        <div class="header-metric">
          <span class="metric-label">Total mensual</span>
          <strong>{{ formatCurrency(incomeService.totalIncome()) }}</strong>
        </div>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateIncome() : createIncome()">
        <label>
          <span class="label-text">Nombre</span>
          <input type="text" [(ngModel)]="formData.name" name="name" required />
        </label>
        <label>
          <span class="label-text">Monto</span>
          <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Frecuencia</span>
          <select [(ngModel)]="formData.frequency" name="frequency">
            <option value="monthly">Mensual</option>
            <option value="biweekly">Quincenal</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diario</option>
          </select>
        </label>
        <label>
          <span class="label-text">Categoría</span>
          <input type="text" [(ngModel)]="formData.category" name="category" placeholder="Trabajo, inversión, etc." />
        </label>
        <label class="checkbox">
          <input type="checkbox" [(ngModel)]="formData.is_recurring" name="is_recurring" />
          <span>Recurrente</span>
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">{{ isEditing() ? 'Actualizar' : 'Agregar' }}</button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (incomeService.loading()) {
        <div class="loading">Cargando...</div>
      } @else if (incomeService.incomes().length === 0) {
        <div class="empty">No hay ingresos registrados</div>
      } @else {
        <section class="cards">
          @for (income of incomeService.incomes(); track income.id) {
            <article class="card" [class.card--inactive]="!income.is_recurring">
              <header class="card__header">
                <div>
                  <p class="card__title">{{ income.name }}</p>
                  <p class="card__due">{{ income.category || 'Sin categoría' }}</p>
                </div>
                <span class="chip" [class.chip--ok]="income.is_recurring" [class.chip--off]="!income.is_recurring">
                  {{ income.is_recurring ? 'Recurrente' : 'Variable' }}
                </span>
              </header>

              <div class="kpi-large">
                <span>{{ frequencyLabel(income.frequency) }}</span>
                <strong>{{ formatCurrency(income.amount) }}</strong>
              </div>

              <div class="card__actions">
                <button class="btn btn--secondary" (click)="editIncome(income)">Editar</button>
                <button class="btn btn--danger" (click)="deleteIncome(income.id!)">Eliminar</button>
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .incomes { padding: var(--space-md); max-width: 1100px; margin: 0 auto; 
      @media (min-width: 768px) { padding: var(--space-xl); }
    }
    .incomes__header { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-lg);
      @media (min-width: 768px) { flex-direction: row; justify-content: space-between; align-items: flex-end; }
    }
    h1 { margin: 0; color: var(--text-primary); font-size: 1.5rem; 
      @media (min-width: 768px) { font-size: 2rem; }
    }
    .subtitle { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.875rem; }
    .header-metric { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem 1rem; text-align: right; }
    .metric-label { display: block; font-size: 0.75rem; color: var(--text-secondary); }
    .header-metric strong { color: var(--accent); font-size: 1.25rem; }

    .form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
      gap: 0.75rem;
      background: linear-gradient(180deg, var(--surface), color-mix(in srgb, var(--surface) 85%, var(--bg)));
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: var(--space-lg);
    }
    .label-text { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; display: block; margin-bottom: 0.25rem; }
    input, select { width: 100%; padding: 0.65rem 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text-primary); font-size: 0.9375rem; }
    input:focus, select:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px rgba(0, 255, 163, 0.1); }
    .checkbox { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 0; }
    .checkbox input { width: auto; }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.9rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.8rem; }
    .card--inactive { opacity: 0.6; }
    .card__header { display: flex; justify-content: space-between; align-items: start; }
    .card__title { margin: 0; font-weight: 700; color: var(--text-primary); font-size: 1.125rem; }
    .card__due { margin: 0.2rem 0 0; color: var(--text-secondary); font-size: 0.85rem; }
    .chip { padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .chip--ok { background: rgba(0, 255, 163, 0.15); color: var(--accent); }
    .chip--off { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

    .kpi-large { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; text-align: center; }
    .kpi-large span { display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
    .kpi-large strong { display: block; font-size: 1.5rem; color: var(--accent); margin-top: 0.25rem; }

    .card__actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .btn { padding: 0.55rem 0.85rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; }
    .btn--primary { background: var(--accent); color: var(--bg); }
    .btn--primary:hover { background: var(--accent-hover); }
    .btn--secondary { background: var(--surface-hover); color: var(--text-primary); }
    .btn--danger { background: rgba(239,68,68,0.15); color: var(--danger); }

    .loading, .empty { color: var(--text-secondary); padding: 2rem; text-align: center; }
  `]
})
export class IncomesComponent implements OnInit {
  incomeService = inject(IncomeService);
  
  editingId = signal<number | null>(null);
  
  formData: IncomeCreate = this.getEmptyForm();

  ngOnInit() {
    this.incomeService.loadIncomes().subscribe();
  }

  isEditing = () => this.editingId() !== null;

  getEmptyForm(): IncomeCreate {
    return {
      name: '',
      amount: 0,
      frequency: 'monthly',
      is_recurring: true,
      category: ''
    };
  }

  createIncome() {
    if (!this.formData.name || this.formData.amount <= 0) return;
    
    this.incomeService.createIncome(this.formData).subscribe({
      next: () => this.resetForm()
    });
  }

  editIncome(income: Income) {
    this.editingId.set(income.id!);
    this.formData = {
      name: income.name,
      amount: parseNumber(income.amount),
      frequency: income.frequency,
      is_recurring: income.is_recurring,
      category: income.category
    };
  }

  updateIncome() {
    const id = this.editingId();
    if (!id) return;

    this.incomeService.updateIncome(id, this.formData).subscribe({
      next: () => {
        this.cancelEdit();
      }
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.resetForm();
  }

  deleteIncome(id: number) {
    if (confirm('¿Eliminar este ingreso?')) {
      this.incomeService.deleteIncome(id).subscribe();
    }
  }

  resetForm() {
    this.formData = this.getEmptyForm();
  }

  frequencyLabel(freq: string): string {
    const labels: Record<string, string> = {
      monthly: 'Mensual',
      biweekly: 'Quincenal',
      weekly: 'Semanal',
      daily: 'Diario'
    };
    return labels[freq] || freq;
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(Number(value));
  }
}