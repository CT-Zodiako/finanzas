import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FixedExpenseService } from '../../services/fixed-expense.service';
import { FixedExpense, FixedExpenseCreate } from '../../models/fixed-expense.model';

@Component({
  selector: 'app-fixed-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses">
      <header class="expenses__header">
        <h1>Gastos Fijos</h1>
        <span class="total">Total: {{ formatCurrency(fixedExpenseService.totalFixedExpenses()) }}</span>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateExpense() : createExpense()">
        <div class="form__row">
          <input 
            type="text" 
            [(ngModel)]="formData.name" 
            name="name" 
            placeholder="Nombre del gasto"
            required
          />
          <input 
            type="number" 
            [(ngModel)]="formData.amount" 
            name="amount" 
            placeholder="Monto mensual"
            step="0.01"
            required
          />
          <input 
            type="text" 
            [(ngModel)]="formData.category" 
            name="category" 
            placeholder="Categoría (arrendamiento, servicios)"
          />
        </div>
        <div class="form__row">
          <input 
            type="number" 
            [(ngModel)]="formData.due_day" 
            name="due_day" 
            placeholder="Día de pago (1-31)"
            min="1"
            max="31"
          />
          <label class="checkbox">
            <input type="checkbox" [(ngModel)]="formData.is_active" name="is_active" />
            <span>Activo</span>
          </label>
          <button type="submit" class="btn btn--primary">
            {{ isEditing() ? 'Actualizar' : 'Agregar' }}
          </button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (fixedExpenseService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else if (fixedExpenseService.expenses().length === 0) {
        <div class="empty">
          <p>No hay gastos fijos registrados</p>
        </div>
      } @else {
        <div class="list">
          @for (expense of fixedExpenseService.expenses(); track expense.id) {
            <div class="item" [class.item--inactive]="!expense.is_active">
              <div class="item__info">
                <span class="item__name">{{ expense.name }}</span>
                <div class="item__meta">
                  <span class="item__category">{{ expense.category || 'Sin categoría' }}</span>
                  @if (expense.due_day) {
                    <span class="item__due">Día {{ expense.due_day }}</span>
                  }
                </div>
              </div>
              <div class="item__status">
                @if (expense.is_active) {
                  <span class="badge badge--active">Activo</span>
                } @else {
                  <span class="badge badge--inactive">Inactivo</span>
                }
              </div>
              <span class="item__amount">{{ formatCurrency(expense.amount) }}/mes</span>
              <div class="item__actions">
                <button class="btn-icon" (click)="editExpense(expense)" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-icon--danger" (click)="deleteExpense(expense.id!)" title="Eliminar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                </button>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .expenses {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .expenses__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .expenses__header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .total {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--warning);
    }

    .form {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .form__row {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .form__row:last-child {
      margin-bottom: 0;
    }

    .form input {
      flex: 1;
      min-width: 150px;
      padding: 0.75rem 1rem;
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text-primary);
      font-size: 0.9375rem;
    }

    .form input::placeholder {
      color: var(--text-secondary);
    }

    .form input:focus {
      outline: none;
      border-color: var(--warning);
      box-shadow: 0 0 0 3px rgba(255, 217, 61, 0.1);
    }

    .checkbox {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1rem;
      cursor: pointer;
    }

    .checkbox input {
      width: 18px;
      height: 18px;
      accent-color: var(--warning);
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
      background: var(--warning);
      color: var(--bg);
    }

    .btn--primary:hover {
      background: #e6c235;
    }

    .btn--secondary {
      background: var(--surface-hover);
      color: var(--text-primary);
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
      border-top-color: var(--warning);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem;
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 12px;
      transition: all 0.2s;
    }

    .item:hover {
      border-color: var(--border-hover);
    }

    .item--inactive {
      opacity: 0.5;
    }

    .item__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item__name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .item__meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .badge {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge--active {
      background: rgba(0, 255, 163, 0.1);
      color: var(--accent);
    }

    .badge--inactive {
      background: rgba(138, 138, 154, 0.2);
      color: var(--text-secondary);
    }

    .item__amount {
      font-weight: 600;
      color: var(--warning);
      font-size: 1.125rem;
    }

    .item__actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      border: 1px solid var(--border);
      background: transparent;
      color: var(--text-secondary);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-icon:hover {
      background: var(--surface-hover);
      color: var(--text-primary);
    }

    .btn-icon--danger:hover {
      background: rgba(239, 68, 68, 0.1);
      color: var(--danger);
      border-color: var(--danger);
    }
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
    if (!this.formData.name || this.formData.amount <= 0) return;
    
    this.fixedExpenseService.createExpense(this.formData).subscribe({
      next: () => this.resetForm()
    });
  }

  editExpense(expense: FixedExpense) {
    this.editingId.set(expense.id!);
    this.formData = {
      name: expense.name,
      amount: Number(expense.amount),
      category: expense.category,
      due_day: expense.due_day,
      is_active: expense.is_active
    };
  }

  updateExpense() {
    const id = this.editingId();
    if (!id) return;

    this.fixedExpenseService.updateExpense(id, this.formData).subscribe({
      next: () => {
        this.cancelEdit();
      }
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
    }).format(Number(value));
  }
}