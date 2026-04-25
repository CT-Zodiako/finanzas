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
        <h1>Ingresos</h1>
        <span class="total">Total: {{ formatCurrency(incomeService.totalIncome()) }}</span>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateIncome() : createIncome()">
        <div class="form__row">
          <input 
            type="text" 
            [(ngModel)]="formData.name" 
            name="name" 
            placeholder="Nombre del ingreso"
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
          <select [(ngModel)]="formData.frequency" name="frequency">
            <option value="monthly">Mensual</option>
            <option value="biweekly">Quincenal</option>
            <option value="weekly">Semanal</option>
            <option value="daily">Diario</option>
          </select>
        </div>
        <div class="form__row">
          <input 
            type="text" 
            [(ngModel)]="formData.category" 
            name="category" 
            placeholder="Categoría (opcional)"
          />
          <label class="checkbox">
            <input type="checkbox" [(ngModel)]="formData.is_recurring" name="is_recurring" />
            <span>Recurrente</span>
          </label>
          <button type="submit" class="btn btn--primary">
            {{ isEditing() ? 'Actualizar' : 'Agregar' }}
          </button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (incomeService.loading()) {
        <div class="loading">
          <div class="spinner"></div>
        </div>
      } @else if (incomeService.incomes().length === 0) {
        <div class="empty">
          <p>No hay ingresos registrados</p>
        </div>
      } @else {
        <div class="list">
          @for (income of incomeService.incomes(); track income.id) {
            <div class="item">
              <div class="item__info">
                <span class="item__name">{{ income.name }}</span>
                <span class="item__category">{{ income.category || 'Sin categoría' }}</span>
              </div>
              <div class="item__meta">
                <span class="item__frequency">{{ frequencyLabel(income.frequency) }}</span>
                <span class="item__amount">{{ formatCurrency(income.amount) }}</span>
              </div>
              <div class="item__actions">
                <button class="btn-icon" (click)="editIncome(income)" title="Editar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
                <button class="btn-icon btn-icon--danger" (click)="deleteIncome(income.id!)" title="Eliminar">
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
    .incomes {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .incomes__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .incomes__header h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .total {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--accent);
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

    .form input, .form select {
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

    .form input:focus, .form select:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(0, 255, 163, 0.1);
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
      accent-color: var(--accent);
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
      border-top-color: var(--accent);
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

    .item__name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .item__category {
      font-size: 0.8125rem;
      color: var(--text-secondary);
    }

    .item__meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
    }

    .item__frequency {
      font-size: 0.8125rem;
      color: var(--text-secondary);
      text-transform: capitalize;
    }

    .item__amount {
      font-weight: 600;
      color: var(--accent);
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