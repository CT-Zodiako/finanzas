import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, of } from 'rxjs';
import { OptimizeInput, OptimizeResult, AlertsResult, DebtOptimize } from '../models/optimize.model';
import { parseNumber } from '../utils/number.utils';

@Injectable({
  providedIn: 'root'
})
export class OptimizeService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/optimize';

  private optimizeResultSignal = signal<OptimizeResult | null>(null);
  private alertsSignal = signal<AlertsResult | null>(null);
  private loadingSignal = signal(false);
  private errorSignal = signal<string | null>(null);

  readonly optimizeResult = computed(() => this.optimizeResultSignal());
  readonly alerts = computed(() => this.alertsSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  calculate(input: OptimizeInput): Observable<OptimizeResult> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    const payload = {
      ingreso_mensual: parseNumber(input.ingreso_mensual),
      gastos_fijos: parseNumber(input.gastos_fijos),
      ahorro_minimo: parseNumber(input.ahorro_minimo),
      deudas: input.deudas.map(d => ({
        nombre: d.nombre,
        saldo_total: parseNumber(d.saldo_total),
        cuota_minima: parseNumber(d.cuota_minima),
        tasa_interes_mensual: parseNumber(d.tasa_interes_mensual),
        fecha_limite: d.fecha_limite,
        tipo: d.tipo
      }))
    } as any;

    return this.http.post<OptimizeResult>(`${this.apiUrl}/calculate`, payload).pipe(
      tap(data => {
        this.optimizeResultSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error calculating optimization');
        this.loadingSignal.set(false);
        return of(null as any);
      })
    );
  }

  calculateFromDatabase(): Observable<OptimizeResult> {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    return this.http.post<OptimizeResult>(`${this.apiUrl}/from-database`, {}).pipe(
      tap(data => {
        this.optimizeResultSignal.set(data);
        this.loadingSignal.set(false);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error calculating from database');
        this.loadingSignal.set(false);
        return of(null as any);
      })
    );
  }

  getAlerts(input: OptimizeInput): Observable<AlertsResult> {
    const payload = {
      ingreso_mensual: parseNumber(input.ingreso_mensual),
      gastos_fijos: parseNumber(input.gastos_fijos),
      ahorro_minimo: parseNumber(input.ahorro_minimo),
      deudas: input.deudas.map(d => ({
        nombre: d.nombre,
        saldo_total: parseNumber(d.saldo_total),
        cuota_minima: parseNumber(d.cuota_minima),
        tasa_interes_mensual: parseNumber(d.tasa_interes_mensual),
        fecha_limite: d.fecha_limite,
        tipo: d.tipo
      }))
    } as any;

    return this.http.post<AlertsResult>(`${this.apiUrl}/alerts`, payload).pipe(
      tap(data => {
        this.alertsSignal.set(data);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error getting alerts');
        return of(null as any);
      })
    );
  }

  getAlertsFromDatabase(): Observable<AlertsResult> {
    return this.http.post<AlertsResult>(`${this.apiUrl}/from-database`, {}).pipe(
      tap(data => {
        this.alertsSignal.set(data);
      }),
      catchError(err => {
        this.errorSignal.set(err.message || 'Error getting alerts from database');
        return of(null as any);
      })
    );
  }
}
