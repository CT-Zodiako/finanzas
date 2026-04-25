import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { DailyExpense, DailyExpenseCreate, DailyExpenseUpdate } from '../models/daily-expense.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class DailyExpenseService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/daily-expenses';

  private expensesSignal = signal<DailyExpense[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly expenses = computed(() => this.expensesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly totalExpenses = computed(() =>
    this.expensesSignal().reduce((sum, exp) => sum + parseNumber(exp.amount), 0)
  );

  loadExpenses(): Observable<DailyExpense[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<DailyExpense[]>(this.apiUrl).pipe(
      tap(data => {
        this.expensesSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error loading expenses');
        this.loadingSignal.set(false);
        return of([]);
      })
    );
  }

  createExpense(expense: DailyExpenseCreate): Observable<DailyExpense> {
    return this.http.post<DailyExpense>(this.apiUrl, expense).pipe(
      tap(newExpense => {
        this.expensesSignal.update(expenses => [...expenses, newExpense]);
      })
    );
  }

  updateExpense(id: number, expense: DailyExpenseUpdate): Observable<DailyExpense> {
    return this.http.put<DailyExpense>(`${this.apiUrl}/${id}`, expense).pipe(
      tap(updatedExpense => {
        this.expensesSignal.update(expenses =>
          expenses.map(exp => exp.id === id ? updatedExpense : exp)
        );
      })
    );
  }

  deleteExpense(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.expensesSignal.update(expenses =>
          expenses.filter(exp => exp.id !== id)
        );
      })
    );
  }
}