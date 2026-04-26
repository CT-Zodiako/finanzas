import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

export type SessionUser = {
  id: number;
  nombre: string;
  email: string;
  rol: 'usuario' | 'admin' | string;
};

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  nombre: string;
  email: string;
  password: string;
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/auth';

  private userSignal = signal<SessionUser | null>(null);
  private loadingSignal = signal(false);

  readonly user = computed(() => this.userSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly isAuthenticated = computed(() => !!this.userSignal());

  checkSession(): Observable<SessionUser | null> {
    this.loadingSignal.set(true);
    return this.http.get<SessionUser>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.loadingSignal.set(false);
      }),
      catchError(() => {
        this.userSignal.set(null);
        this.loadingSignal.set(false);
        return of(null);
      })
    );
  }

  login(payload: LoginPayload): Observable<SessionUser> {
    this.loadingSignal.set(true);
    return this.http.post<SessionUser>(`${this.apiUrl}/login`, payload).pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.loadingSignal.set(false);
      })
    );
  }

  register(payload: RegisterPayload): Observable<SessionUser> {
    this.loadingSignal.set(true);
    return this.http.post<SessionUser>(`${this.apiUrl}/register`, payload).pipe(
      tap((user) => {
        this.userSignal.set(user);
        this.loadingSignal.set(false);
      })
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/logout`, {}).pipe(
      tap(() => this.clearSession())
    );
  }

  clearSession(): void {
    this.userSignal.set(null);
    this.loadingSignal.set(false);
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.isAuthenticated()) {
      return of(true);
    }

    return this.checkSession().pipe(map((user) => !!user));
  }
}
