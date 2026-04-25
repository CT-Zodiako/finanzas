import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { BudgetResponse } from '../models/dashboard.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/budget';

  private budgetSignal = signal<BudgetResponse | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly budget = this.budgetSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadBudget(): Observable<BudgetResponse> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<BudgetResponse>(`${this.apiUrl}/recommendations`).pipe(
      tap(data => {
        this.budgetSignal.set({
          ...data,
          total_income: parseNumber(data.total_income),
          recommendations: data.recommendations.map(rec => ({
            ...rec,
            amount: parseNumber(rec.amount),
            percentage: parseNumber(rec.percentage)
          }))
        });
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error loading budget');
        this.loadingSignal.set(false);
        return of(null as any);
      })
    );
  }
}