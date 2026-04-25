import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Debt, DebtCreate, DebtUpdate, DebtPayment, DebtSummary } from '../models/debt.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class DebtService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/debts/';

  private debtsSignal = signal<Debt[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly debts = computed(() => this.debtsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly totalDebt = computed(() =>
    this.debtsSignal().filter(d => d.is_active).reduce((sum, d) => sum + parseNumber(d.remaining_amount), 0)
  );
  readonly totalCost = computed(() =>
    this.debtsSignal().filter(d => d.is_active).reduce((sum, d) => sum + (parseNumber(d.costo_total) || parseNumber(d.remaining_amount)), 0)
  );
  readonly activeDebts = computed(() => this.debtsSignal().filter(d => d.is_active));

  loadDebts(): Observable<Debt[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Debt[]>(this.apiUrl).pipe(
      tap(data => {
        this.debtsSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error loading debts');
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  createDebt(debt: DebtCreate): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, debt).pipe(
      tap(newDebt => {
        this.debtsSignal.update(debts => [...debts, newDebt]);
      })
    );
  }

  updateDebt(id: number, debt: DebtUpdate): Observable<Debt> {
    return this.http.put<Debt>(`${this.apiUrl}${id}`, debt).pipe(
      tap(updatedDebt => {
        this.debtsSignal.update(debts =>
          debts.map(d => d.id === id ? updatedDebt : d)
        );
      })
    );
  }

  deleteDebt(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${id}`).pipe(
      tap(() => {
        this.debtsSignal.update(debts =>
          debts.filter(d => d.id !== id)
        );
      })
    );
  }

  makePayment(id: number, payment: DebtPayment): Observable<Debt> {
    return this.http.post<Debt>(`${this.apiUrl}${id}/payment`, payment).pipe(
      tap(updatedDebt => {
        this.debtsSignal.update(debts =>
          debts.map(d => d.id === id ? updatedDebt : d)
        );
      })
    );
  }

  getSummary(): Observable<DebtSummary> {
    return this.http.get<DebtSummary>(`${this.apiUrl}summary`).pipe(
      catchError(err => {
        return of({ saldo_actual: 0, total_cuotas_mensuales: 0, costo_total: 0, numero_deudas: 0 });
      })
    );
  }
}
