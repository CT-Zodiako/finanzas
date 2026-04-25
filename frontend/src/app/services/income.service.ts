import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { Income, IncomeCreate, IncomeUpdate } from '../models/income.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class IncomeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/incomes';

  private incomesSignal = signal<Income[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly incomes = computed(() => this.incomesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly totalIncome = computed(() => 
    this.incomesSignal().reduce((sum, inc) => sum + parseNumber(inc.amount), 0)
  );

  loadIncomes(): Observable<Income[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<Income[]>(this.apiUrl).pipe(
      tap(data => {
        this.incomesSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error loading incomes');
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  createIncome(income: IncomeCreate): Observable<Income> {
    return this.http.post<Income>(this.apiUrl, income).pipe(
      tap(newIncome => {
        this.incomesSignal.update(incomes => [...incomes, newIncome]);
      })
    );
  }

  updateIncome(id: number, income: IncomeUpdate): Observable<Income> {
    return this.http.put<Income>(`${this.apiUrl}/${id}`, income).pipe(
      tap(updatedIncome => {
        this.incomesSignal.update(incomes =>
          incomes.map(inc => inc.id === id ? updatedIncome : inc)
        );
      })
    );
  }

  deleteIncome(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.incomesSignal.update(incomes =>
          incomes.filter(inc => inc.id !== id)
        );
      })
    );
  }
}