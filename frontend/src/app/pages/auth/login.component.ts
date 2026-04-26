import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Iniciar sesión</h1>

        <label>
          Email
          <input type="email" formControlName="email" placeholder="tu@email.com" />
        </label>

        <label>
          Contraseña
          <input type="password" formControlName="password" placeholder="Tu contraseña" />
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || auth.loading()">
          {{ auth.loading() ? 'Entrando...' : 'Entrar' }}
        </button>

        <p>¿No tenés cuenta? <a routerLink="/register">Registrate</a></p>
      </form>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; place-items: center; min-height: 100vh; padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; display: grid; gap: 12px; padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    label { display: grid; gap: 6px; color: var(--text-secondary); }
    input { padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
    input::placeholder { color: var(--text-secondary); opacity: 0.6; }
    button { padding: 10px; border: none; border-radius: 8px; background: var(--accent); color: #00140d; font-weight: 700; cursor: pointer; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .error { color: var(--danger); }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.error.set(err?.error?.detail ?? 'Credenciales inválidas')
    });
  }
}
