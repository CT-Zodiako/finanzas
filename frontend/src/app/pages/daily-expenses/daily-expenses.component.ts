import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyExpenseService } from '../../services/daily-expense.service';
import { DailyExpense, DailyExpenseCreate } from '../../models/daily-expense.model';
import { parseNumber } from '../../utils/number.utils';

@Component({
  selector: 'app-daily-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses">
      <header class="expenses__header">
        <div>
          <h1>Gastos Diarios</h1>
          <p class="subtitle">Registra tus gastos cotidianos</p>
        </div>
        <div class="header-metric">
          <span class="metric-label">Total del día/mes</span>
          <strong>{{ formatCurrency(dailyExpenseService.totalExpenses()) }}</strong>
        </div>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateExpense() : createExpense()">
        <label>
          <span class="label-text">Descripción</span>
          <input type="text" [(ngModel)]="formData.description" name="description" required />
        </label>
        <label>
          <span class="label-text">Monto</span>
          <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Categoría</span>
          <input type="text" [(ngModel)]="formData.category" name="category" placeholder="Comida, transporte, etc." />
        </label>
        <label>
          <span class="label-text">Fecha</span>
          <input type="date" [(ngModel)]="formData.date" name="date" required />
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">{{ isEditing() ? 'Actualizar' : 'Agregar' }}</button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (dailyExpenseService.loading()) {
        <div class="loading">Cargando...</div>
      } @else if (dailyExpenseService.expenses().length === 0) {
        <div class="empty">No hay gastos diarios registrados</div>
      } @else {
        <section class="cards">
          @for (expense of dailyExpenseService.expenses(); track expense.id) {
            <article class="card">
              <header class="card__header">
                <div>
                  <p class="card__title">{{ expense.description }}</p>
                  <p class="card__due">{{ expense.category || 'Sin categoría' }} • {{ formatDate(expense.date) }}</p>
                </div>
              </header>

              <div class="kpi-large">
                <span>{{ formatDate(expense.date) }}</span>
                <strong>{{ formatCurrency(expense.amount) }}</strong>
              </div>

              <div class="card__actions">
                <button class="btn btn--secondary" (click)="editExpense(expense)">Editar</button>
                <button class="btn btn--danger" (click)="deleteExpense(expense.id!)">Eliminar</button>
              </div>
            </article>
          }
        </section>
      }
    </div>
  `,
  styles: [`
    .expenses { padding: var(--space-md); max-width: 1100px; margin: 0 auto; 
      @media (min-width: 768px) { padding: var(--space-xl); }
    }
    .expenses__header { display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-lg);
      @media (min-width: 768px) { flex-direction: row; justify-content: space-between; align-items: flex-end; }
    }
    h1 { margin: 0; color: var(--text-primary); font-size: 1.5rem; 
      @media (min-width: 768px) { font-size: 2rem; }
    }
    .subtitle { margin: 0.25rem 0 0; color: var(--text-secondary); font-size: 0.875rem; }
    .header-metric { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem 1rem; text-align: right; }
    .metric-label { display: block; font-size: 0.75rem; color: var(--text-secondary); }
    .header-metric strong { color: var(--danger); font-size: 1.25rem; }

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
    input:focus { outline: none; border-color: var(--danger); box-shadow: 0 0 0 3px rgba(255, 107, 107, 0.1); }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 0.5rem; flex-wrap: wrap; }

    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 0.9rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.8rem; }
    .card__header { display: flex; justify-content: space-between; align-items: start; }
    .card__title { margin: 0; font-weight: 700; color: var(--text-primary); font-size: 1.125rem; }
    .card__due { margin: 0.2rem 0 0; color: var(--text-secondary); font-size: 0.85rem; }

    .kpi-large { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; text-align: center; }
    .kpi-large span { display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
    .kpi-large strong { display: block; font-size: 1.5rem; color: var(--danger); margin-top: 0.25rem; }

    .card__actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .btn { padding: 0.55rem 0.85rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; }
    .btn--primary { background: var(--danger); color: #fff; }
    .btn--primary:hover { background: #e55a5a; }
    .btn--secondary { background: var(--surface-hover); color: var(--text-primary); }
    .btn--danger { background: rgba(239,68,68,0.15); color: var(--danger); }

    .loading, .empty { color: var(--text-secondary); padding: 2rem; text-align: center; }
  `]
})
export class DailyExpensesComponent implements OnInit {
  dailyExpenseService = inject(DailyExpenseService);
  
  editingId = signal<number | null>(null);
  
  formData: DailyExpenseCreate = this.getEmptyForm();

  ngOnInit() {
    this.dailyExpenseService.loadExpenses().subscribe();
  }

  isEditing = () => this.editingId() !== null;

  getEmptyForm(): DailyExpenseCreate {
    const today = new Date().toISOString().split('T')[0];
    return {
      description: '',
      amount: 0,
      category: '',
      date: today
    };
  }

  createExpense() {
    if (!this.formData.description || (this.formData.amount || 0) <= 0) return;
    
    this.dailyExpenseService.createExpense(this.formData).subscribe({
      next: () => this.resetForm()
    });
  }

  editExpense(expense: DailyExpense) {
    this.editingId.set(expense.id!);
    this.formData = {
      description: expense.description,
      amount: parseNumber(expense.amount),
      category: expense.category || '',
      date: expense.date
    };
  }

  updateExpense() {
    const id = this.editingId();
    if (!id) return;

    this.dailyExpenseService.updateExpense(id, this.formData).subscribe({
      next: () => this.cancelEdit()
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.resetForm();
  }

  deleteExpense(id: number) {
    if (confirm('¿Eliminar este gasto?')) {
      this.dailyExpenseService.deleteExpense(id).subscribe();
    }
  }

  resetForm() {
    this.formData = this.getEmptyForm();
  }

  formatDate(date: string | null): string {
    if (!date) return 'Sin fecha';
    const d = new Date(date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(Number(value || 0));
  }
}