import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DebtService } from '../../services/debt.service';
import { Debt, DebtCreate, DebtPayment } from '../../models/debt.model';
import { parseNumber } from '../../utils/number.utils';

@Component({
  selector: 'app-debts',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="debts">
      <header class="debts__header">
        <div>
          <h1>Deudas</h1>
          <p class="subtitle">Controla tu avance y cuanto te falta por pagar</p>
        </div>
        <div class="header-metric">
          <span class="metric-label">Saldo total pendiente</span>
          <strong>{{ formatCurrency(debtService.totalDebt()) }}</strong>
        </div>
      </header>

      <form class="form" (ngSubmit)="isEditing() ? updateDebt() : createDebt()">
        <label>
          <span class="label-text">Nombre</span>
          <input type="text" [(ngModel)]="formData.name" name="name" required />
        </label>
        <label>
          <span class="label-text">Deuda total</span>
          <input type="number" [(ngModel)]="formData.amount" name="amount" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Lo que se ha pagado</span>
          <input type="number" [(ngModel)]="formData.monto_pagado" name="monto_pagado" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Cuota mensual</span>
          <input type="number" [(ngModel)]="formData.monthly_payment" name="monthly_payment" step="0.01" required />
        </label>
        <label>
          <span class="label-text">Fecha limite de pago</span>
          <input type="date" [(ngModel)]="formData.fecha_limite" name="fecha_limite" />
        </label>

        <div class="preview">
          <span>Pendiente estimado</span>
          <strong>{{ formatCurrency(getRemainingPreview()) }}</strong>
        </div>

        <div class="form-actions">
          <button type="submit" class="btn btn--primary">{{ isEditing() ? 'Actualizar' : 'Agregar' }}</button>
          @if (isEditing()) {
            <button type="button" class="btn btn--secondary" (click)="cancelEdit()">Cancelar</button>
          }
        </div>
      </form>

      @if (debtService.loading()) {
        <div class="empty">Cargando...</div>
      } @else if (orderedDebts().length === 0) {
        <div class="empty">No hay deudas registradas</div>
      } @else {
        <section class="cards">
          @for (debt of orderedDebts(); track debt.id) {
            <article class="card" [class.card--inactive]="!debt.is_active">
              <header class="card__header">
                <div>
                  <p class="card__title">{{ debt.name || 'Deuda sin nombre' }}</p>
                  <p class="card__due">Vence {{ getDueText(debt) }}</p>
                </div>
                <span class="chip" [class.chip--ok]="debt.is_active" [class.chip--off]="!debt.is_active">
                  {{ debt.is_active ? 'Activa' : 'Pagada' }}
                </span>
              </header>

              <div class="progress-wrap">
                <div class="progress-info">
                  <span>Progreso</span>
                  <strong>{{ getProgress(debt) }}%</strong>
                </div>
                <div class="progress-track">
                  <div class="progress-fill" [style.width.%]="getProgress(debt)"></div>
                </div>
              </div>

              <div class="grid">
                <div class="kpi">
                  <span>Total</span>
                  <strong>{{ formatCurrency(debt.amount) }}</strong>
                </div>
                <div class="kpi">
                  <span>Pagado</span>
                  <strong>{{ formatCurrency(getPaidAmount(debt)) }}</strong>
                </div>
                <div class="kpi">
                  <span>Pendiente</span>
                  <strong>{{ formatCurrency(debt.remaining_amount) }}</strong>
                </div>
                <div class="kpi">
                  <span>Cuota mensual</span>
                  <strong>{{ formatCurrency(debt.monthly_payment) }}</strong>
                </div>
                <div class="kpi kpi--wide">
                  <span>Meses estimados restantes</span>
                  <strong>{{ getEstimatedMonthsLeft(debt) }}</strong>
                </div>
              </div>

              <footer class="card__actions">
                @if (debt.is_active) {
                  <button class="btn btn--payment" (click)="showPaymentForm(debt)">Pago</button>
                }
                <button class="btn btn--secondary" (click)="editDebt(debt)">Editar</button>
                <button class="btn btn--danger" (click)="deleteDebt(debt.id!)">Eliminar</button>
              </footer>
            </article>
          }
        </section>
      }

      @if (paymentModal()) {
        <div class="modal-overlay" (click)="closePaymentModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <h3>Registrar pago</h3>
            <p>Pendiente: {{ formatCurrency(paymentModal()!.remaining_amount) }}</p>
            <form (ngSubmit)="makePayment()">
              <input type="number" [(ngModel)]="paymentAmount" name="payment_amount" step="0.01" required />
              <div class="modal__actions">
                <button type="button" class="btn btn--secondary" (click)="closePaymentModal()">Cancelar</button>
                <button type="submit" class="btn btn--primary">Registrar</button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .debts { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .debts__header { display: flex; justify-content: space-between; align-items: end; gap: 1rem; margin-bottom: 1rem; }
    h1 { margin: 0; color: var(--text-primary); }
    .subtitle { margin: 0.25rem 0 0; color: var(--text-secondary); }
    .header-metric { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 0.75rem 1rem; text-align: right; }
    .metric-label { display: block; font-size: 0.75rem; color: var(--text-secondary); }

    .form {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 0.75rem;
      background: linear-gradient(180deg, var(--surface), color-mix(in srgb, var(--surface) 85%, var(--bg)));
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 1rem;
      margin-bottom: 1rem;
    }
    .label-text { font-size: 0.75rem; color: var(--text-secondary); text-transform: uppercase; }
    input { width: 100%; padding: 0.65rem 0.8rem; border: 1px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text-primary); }
    .preview { grid-column: 1 / -1; display: flex; justify-content: space-between; padding: 0.7rem 0.85rem; border-radius: 8px; background: color-mix(in srgb, var(--accent) 12%, transparent); color: var(--text-primary); }
    .form-actions { grid-column: 1 / -1; display: flex; gap: 0.5rem; }

    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 0.9rem; }
    .card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; display: grid; gap: 0.8rem; }
    .card--inactive { opacity: 0.6; }
    .card__header { display: flex; justify-content: space-between; align-items: start; }
    .card__title { margin: 0; font-weight: 700; color: var(--text-primary); }
    .card__due { margin: 0.2rem 0 0; color: var(--text-secondary); font-size: 0.85rem; }
    .chip { padding: 0.2rem 0.55rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; }
    .chip--ok { background: rgba(34,197,94,0.15); color: #16a34a; }
    .chip--off { background: rgba(107,114,128,0.15); color: #6b7280; }

    .progress-wrap { display: grid; gap: 0.35rem; }
    .progress-info { display: flex; justify-content: space-between; font-size: 0.84rem; color: var(--text-secondary); }
    .progress-info strong { color: var(--text-primary); }
    .progress-track { height: 10px; border-radius: 999px; background: color-mix(in srgb, var(--border) 85%, transparent); overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #06b6d4); transition: width 0.25s ease; }

    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.55rem; }
    .kpi { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 0.55rem 0.65rem; }
    .kpi span { display: block; font-size: 0.72rem; color: var(--text-secondary); }
    .kpi strong { color: var(--text-primary); font-size: 0.95rem; }
    .kpi--wide { grid-column: 1 / -1; }

    .card__actions { display: flex; gap: 0.45rem; flex-wrap: wrap; }
    .btn { padding: 0.55rem 0.85rem; border-radius: 8px; border: none; cursor: pointer; }
    .btn--primary { background: var(--purple); color: #fff; }
    .btn--secondary { background: var(--surface-hover); color: var(--text-primary); }
    .btn--danger { background: rgba(239,68,68,0.15); color: var(--danger); }
    .btn--payment { background: var(--accent); color: var(--bg); }

    .empty { color: var(--text-secondary); padding: 1rem; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; }
    .modal { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 1rem; width: min(420px, 90vw); }
    .modal__actions { display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 0.75rem; }
  `]
})
export class DebtsComponent implements OnInit {
  debtService = inject(DebtService);

  editingId = signal<number | null>(null);
  paymentModalDebt = signal<Debt | null>(null);
  paymentAmount = 0;
  formData: DebtCreate = this.getEmptyForm();

  orderedDebts = computed(() => {
    return [...this.debtService.debts()].sort((a, b) => {
      if (!a.fecha_limite) return 1;
      if (!b.fecha_limite) return -1;
      return new Date(a.fecha_limite).getTime() - new Date(b.fecha_limite).getTime();
    });
  });

  ngOnInit() {
    this.debtService.loadDebts().subscribe();
  }

  isEditing = () => this.editingId() !== null;
  paymentModal = () => this.paymentModalDebt();

  getEmptyForm(): DebtCreate {
    return { name: '', amount: 0, monto_pagado: 0, monthly_payment: 0, tipo: 'credito' };
  }

  getRemainingPreview(): number {
    const total = Number(this.formData.amount || 0);
    const pagado = Number(this.formData.monto_pagado || 0);
    return Math.max(0, total - pagado);
  }

  getPaidAmount(debt: Debt): number {
    return Math.max(0, parseNumber(debt.amount) - parseNumber(debt.remaining_amount));
  }

  getProgress(debt: Debt): number {
    const total = parseNumber(debt.amount);
    if (total <= 0) return 0;
    const paid = this.getPaidAmount(debt);
    return Math.max(0, Math.min(100, Math.round((paid / total) * 100)));
  }

  getEstimatedMonthsLeft(debt: Debt): string {
    const cuota = parseNumber(debt.monthly_payment);
    const pendiente = parseNumber(debt.remaining_amount);
    if (cuota <= 0) return 'N/A';
    const months = Math.ceil(pendiente / cuota);
    return `${Math.max(0, months)} meses`;
  }

  getDueText(debt: Debt): string {
    if (!debt.fecha_limite) return 'sin fecha';
    const due = new Date(debt.fecha_limite);
    const today = new Date();
    const diff = Math.ceil((due.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
    if (diff < 0) return `hace ${Math.abs(diff)} dias`;
    if (diff === 0) return 'hoy';
    return `en ${diff} dias`;
  }

  createDebt() {
    if (!String(this.formData.name || '').trim() || (this.formData.amount || 0) <= 0) return;
    this.debtService.createDebt(this.buildPayload()).subscribe({ next: () => this.resetForm() });
  }

  editDebt(debt: Debt) {
    this.editingId.set(debt.id!);
    this.formData = {
      name: debt.name || 'Deuda',
      amount: Number(debt.amount),
      monto_pagado: this.getPaidAmount(debt),
      monthly_payment: Number(debt.monthly_payment),
      fecha_limite: debt.fecha_limite,
      tipo: debt.tipo || 'credito'
    };
  }

  updateDebt() {
    const id = this.editingId();
    if (!id) return;
    this.debtService.updateDebt(id, this.buildPayload()).subscribe({ next: () => this.cancelEdit() });
  }

  buildPayload(): DebtCreate {
    const name = String(this.formData.name || '').trim();
    return {
      ...this.formData,
      name: name || 'Deuda sin nombre',
      remaining_amount: this.getRemainingPreview(),
      monto_pagado: Number(this.formData.monto_pagado || 0),
      tipo: 'credito'
    };
  }

  cancelEdit() {
    this.editingId.set(null);
    this.resetForm();
  }

  deleteDebt(id: number) {
    if (confirm('¿Eliminar esta deuda?')) {
      this.debtService.deleteDebt(id).subscribe();
    }
  }

  showPaymentForm(debt: Debt) {
    this.paymentModalDebt.set(debt);
    this.paymentAmount = Number(debt.monthly_payment);
  }

  closePaymentModal() {
    this.paymentModalDebt.set(null);
    this.paymentAmount = 0;
  }

  makePayment() {
    const debt = this.paymentModalDebt();
    if (!debt || this.paymentAmount <= 0) return;
    const payment: DebtPayment = { payment_amount: this.paymentAmount };
    this.debtService.makePayment(debt.id!, payment).subscribe({ next: () => this.closePaymentModal() });
  }

  resetForm() {
    this.formData = this.getEmptyForm();
  }

  formatCurrency(value: number | string): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(Number(value || 0));
  }
}
