import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FixedExpenseService } from '../../services/fixed-expense.service';
import { FixedExpense, FixedExpenseCreate } from '../../models/fixed-expense.model';
import { parseNumber } from '../../utils/number.utils';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses">
      <header class="expenses__header">
        <div>
          <h1>Gastos Fijos</h1>
          <p class="subtitle">Gestiona tus gastos mensuales fijos</p>
        </div>
        <div class="header-metric">
          <span class="metric-label">Total mensual</span>
          <strong>{{ formatCurrency(fixedExpenseService.totalFixedExpenses()) }}</strong>
        </div>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateExpense() : createExpense()">
        <label>
          <span class="label-text">Nombre</span>
          <input type="text" [(ngModel)]="formData.name" name="name" required />
        </label>
        <label>
          <span class="label-text">Monto mensual</span>
          <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Categoría</span>
          <input type="text" [(ngModel)]="formData.category" name="category" placeholder="Vivienda, servicios, etc." />
        </label>
        <label>
          <span class="label-text">Día de pago</span>
          <input type="number" [(ngModel)]="formData.due_day" name="due_day" min="1" max="31" placeholder="1-31" />
        </label>
        <label class="checkbox">
          <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" />
          <span>Activo</span>
        </label>
        <div class="form-actions">
          <button type="submit" class="btn btn--primary">{{ isEditing() ? 'Actualizar' : 'Agregar' }}</button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (fixedExpenseService.loading()) {
        <div class="loading">Cargando...</div>
      } @else if (fixedExpenseService.expenses().length === 0) {
        <div class="empty">No hay gastos fijos registrados</div>
      } @else {
        <section class="cards">
          @for (expense of fixedExpenseService.expenses(); track expense.id) {
            <article class="card" [class.card--inactive]="!expense.is_active">
              <header class="card__header">
                <div>
                  <p class="card__title">{{ expense.name }}</p>
                  <p class="card__due">{{ expense.category || 'Sin categoría' }}</p>
                </div>
                <span class="chip" [class.chip--ok]="expense.is_active" [class.chip--off]="!expense.is_active">
                  {{ expense.is_active ? 'Activo' : 'Inactivo' }}
                </span>
              </header>

              <div class="kpi-large">
                <span>{{ expense.due_day ? 'Día ' + expense.due_day : 'Sin fecha' }}</span>
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
    .header-metric strong { color: var(--warning); font-size: 1.25rem; }

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
    input:focus { outline: none; border-color: var(--warning); box-shadow: 0 0 0 3px rgba(255, 217, 61, 0.1); }
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
    .chip--ok { background: rgba(34,197,94,0.15); color: #16a34a; }
    .chip--off { background: rgba(107,114,128,0.15); color: #6b7280; }

    .kpi-large { background: var(--bg); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; text-align: center; }
    .kpi-large span { display: block; font-size: 0.8rem; color: var(--text-secondary); text-transform: uppercase; }
    .kpi-large strong { display: block; font-size: 1.5rem; color: var(--warning); margin-top: 0.25rem; }

    .card__actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .btn { padding: 0.55rem 0.85rem; border-radius: 8px; border: none; cursor: pointer; font-weight: 500; }
    .btn--primary { background: var(--warning); color: var(--bg); }
    .btn--primary:hover { background: #e5c04b; }
    .btn--secondary { background: var(--surface-hover); color: var(--text-primary); }
    .btn--danger { background: rgba(239,68,68,0.15); color: var(--danger); }

    .loading, .empty { color: var(--text-secondary); padding: 2rem; text-align: center; }
  `]
})
export class FixedExpensesComponent implements OnInit {
  fixedExpenseService = inject(FixedExpenseService);
  
  editingId = signal<number | null>(null);
  
  formData: FixedExpenseCreate = this.getEmptyForm();

  ngOnInit() {
    this.fixedExpenseService.loadExpenses().subscribe();
  }

  isEditing = () => this.editingId() !== null;

  getEmptyForm(): FixedExpenseCreate {
    return {
      name: '',
      amount: 0,
      category: '',
      due_day: undefined,
      is_active: true
    };
  }

  createExpense() {
    if (!this.formData.name || (this.formData.amount || 0) <= 0) return;
    
    this.fixedExpenseService.createExpense(this.formData).subscribe({
      next: () => this.resetForm()
    });
  }

  editExpense(expense: FixedExpense) {
    this.editingId.set(expense.id!);
    this.formData = {
      name: expense.name,
      amount: parseNumber(expense.amount),
      category: expense.category || '',
      due_day: expense.due_day,
      is_active: expense.is_active
    };
  }

  updateExpense() {
    const id = this.editingId();
    if (!id) return;

    this.fixedExpenseService.updateExpense(id, this.formData).subscribe({
      next: () => this.cancelEdit()
    });
  }

  cancelEdit() {
    this.editingId.set(null);
    this.resetForm();
  }

  deleteExpense(id: number) {
    if (confirm('¿Eliminar este gasto fijo?')) {
      this.fixedExpenseService.deleteExpense(id).subscribe();
    }
  }

  resetForm() {
    this.formData = this.getEmptyForm();
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(Number(value || 0));
  }
}