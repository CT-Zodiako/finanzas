import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { FixedExpense, FixedExpenseCreate, FixedExpenseUpdate } from '../models/fixed-expense.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class FixedExpenseService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/fixed-expenses';

  private expensesSignal = signal<FixedExpense[]>([]);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly expenses = computed(() => this.expensesSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());
  readonly totalFixedExpenses = computed(() =>
    this.expensesSignal().reduce((sum, exp) => sum + parseNumber(exp.amount), 0)
  );

  loadExpenses(): Observable<FixedExpense[]> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<FixedExpense[]>(this.apiUrl).pipe(
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

  createExpense(expense: FixedExpenseCreate): Observable<FixedExpense> {
    return this.http.post<FixedExpense>(this.apiUrl, expense).pipe(
      tap(newExpense => {
        this.expensesSignal.update(expenses => [...expenses, newExpense]);
      })
    );
  }

  updateExpense(id: number, expense: FixedExpenseUpdate): Observable<FixedExpense> {
    return this.http.put<FixedExpense>(`${this.apiUrl}/${id}`, expense).pipe(
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