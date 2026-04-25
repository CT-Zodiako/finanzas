import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { DashboardSummary, CategorySummary, BudgetResponse } from '../models/dashboard.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/dashboard';
  private budgetUrl = '/api/v1/budget';

  private summarySignal = signal<DashboardSummary | null>(null);
  private categoriesSignal = signal<CategorySummary[]>([]);
  private budgetSignal = signal<BudgetResponse | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly summary = this.summarySignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly budget = this.budgetSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();

  loadSummary(): Observable<DashboardSummary> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.get<DashboardSummary>(`${this.apiUrl}/summary`).pipe(
      tap(data => {
        this.summarySignal.set({
          ...data,
          total_incomes: parseNumber(data.total_incomes),
          total_fixed_expenses: parseNumber(data.total_fixed_expenses),
          total_daily_expenses: parseNumber(data.total_daily_expenses),
          total_debts: parseNumber(data.total_debts),
          balance: parseNumber(data.balance),
          monthly_income: parseNumber(data.monthly_income)
        });
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error loading summary');
        this.loadingSignal.set(false);
        return of(null as any);
      })
    );
  }

  loadCategories(): Observable<CategorySummary[]> {
    return this.http.get<CategorySummary[]>(`${this.apiUrl}/categories`).pipe(
      tap(data => this.categoriesSignal.set(data)),
      catchError(() => of([]))
    );
  }

  loadBudget(): Observable<BudgetResponse> {
    return this.http.get<BudgetResponse>(`${this.budgetUrl}/recommendations`).pipe(
      tap(data => this.budgetSignal.set({
        ...data,
        total_income: parseNumber(data.total_income),
        recommendations: data.recommendations.map(rec => ({
          ...rec,
          amount: parseNumber(rec.amount),
          percentage: parseNumber(rec.percentage)
        }))
      })),
      catchError(() => of(null as any))
    );
  }

  refreshAll(): Observable<any> {
    return new Observable(observer => {
      this.loadSummary().subscribe({
        next: () => {
          this.loadCategories().subscribe();
          this.loadBudget().subscribe();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }
}