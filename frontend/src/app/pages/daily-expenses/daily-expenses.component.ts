import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DailyExpenseService } from '../../services/daily-expense.service';
import { DailyExpense, DailyExpenseCreate } from '../../models/daily-expense.model';

@Component({
  selector: 'app-daily-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="expenses">
      <header class="expenses__header">
        <h1>Gastos Diarios</h1>
        <span class="total">Total: {{ formatCurrency(dailyExpenseService.totalExpenses()) }}</span>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateExpense() : createExpense()">
        <div class="form__row">
          <input 
            type="text" 
            [(ngModel)]="formData.description" 
            name="description" 
            placeholder="Descripción"
            required
          />
          <input 
            type="number" 
            [(ngModel)]="formData.amount" 
            name="amount" 
            placeholder="Monto"
            step="0.01"
            required
          />
        </div>
        <div class="form__row">
          <input 
            type="text" 
            [(ngModel)]="formData.category" 
            name="category" 
            placeholder="Categoría (opcional)"
          />
          <input 
            type="date" 
            [(ngModel)]="formData.date" 
            name="date"
            required
          />
          <button type="submit" class="btn btn--primary">
            {{ isEditing() ? 'Actualizar' : 'Agregar' }}
          </button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (dailyExpenseService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else if (dailyExpenseService.expenses().length === 0) {
        <div class="empty">
          <p>No hay gastos diarios registrados</p>
        </div>
      } @else {
        <div class="list">
          @for (expense of dailyExpenseService.expenses(); track expense.id) {
            <div class="item">
              <div class="item__info">
                <span class="item__description">{{ expense.description }}</span>
                <div class="item__meta">
                  <span class="item__category">{{ expense.category || 'Sin categoría' }}</span>
                  <span class="item__date">{{ formatDate(expense.date) }}</span>
                </div>
              </div>
              <span class="item__amount">{{ formatCurrency(expense.amount) }}</span>
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
      color: var(--danger);
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

    .form input[type="date"] {
      color-scheme: dark;
    }

    .form input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0, 255, 163, 0.1);
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
      background: var(--accent-hover);
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
      border-top-color: var(--danger);
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

    .item__info {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .item__description {
      font-weight: 500;
      color: var(--text-primary);
    }

    .item__meta {
      display: flex;
      gap: 1rem;
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .item__amount {
      font-weight: 600;
      color: var(--danger);
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
export class DailyExpensesComponent implements OnInit {
  dailyExpenseService = inject(DailyExpenseService);
  
  editingId = signal<number | null>(null);
  
  formData: DailyExpenseCreate = this.getEmptyForm();

  ngOnInit() {
    this.dailyExpenseService.loadExpenses().subscribe();
  }

  isEditing = () => this.editingId() !== null;

  getEmptyForm(): DailyExpenseCreate {
    return {
      description: '',
      amount: 0,
      category: '',
      date: new Date().toISOString().split('T')[0]
    };
  }

  createExpense() {
    if (!this.formData.description || this.formData.amount <= 0 || !this.formData.date) return;
    
    this.dailyExpenseService.createExpense(this.formData).subscribe({
      next: () => this.resetForm()
    });
  }

  editExpense(expense: DailyExpense) {
    this.editingId.set(expense.id!);
    this.formData = {
      description: expense.description,
      amount: Number(expense.amount),
      category: expense.category,
      date: expense.date
    };
  }

  updateExpense() {
    const id = this.editingId();
    if (!id) return;

    this.dailyExpenseService.updateExpense(id, this.formData).subscribe({
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
    if (confirm('¿Eliminar este gasto?')) {
      this.dailyExpenseService.deleteExpense(id).subscribe();
    }
  }

  resetForm() {
    this.formData = this.getEmptyForm();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP'
    }).format(Number(value));
  }
}