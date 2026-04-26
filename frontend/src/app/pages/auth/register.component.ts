import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <form class="auth-card" [formGroup]="form" (ngSubmit)="submit()">
        <h1>Crear cuenta</h1>

        <label>
          Nombre
          <input type="text" formControlName="nombre" />
        </label>

        <label>
          Email
          <input type="email" formControlName="email" />
        </label>

        <label>
          Contraseña
          <input type="password" formControlName="password" />
        </label>

        @if (error()) {
          <p class="error">{{ error() }}</p>
        }

        <button type="submit" [disabled]="form.invalid || auth.loading()">Registrarme</button>

        <p>¿Ya tenés cuenta? <a routerLink="/login">Iniciá sesión</a></p>
      </form>
    </div>
  `,
  styles: [`
    .auth-page { display: grid; place-items: center; min-height: 100vh; padding: 16px; }
    .auth-card { width: 100%; max-width: 420px; display: grid; gap: 12px; padding: 24px; border: 1px solid var(--border); border-radius: 12px; background: var(--surface); }
    label { display: grid; gap: 6px; color: var(--text-secondary); }
    input { padding: 10px; border-radius: 8px; border: 1px solid var(--border); background: transparent; color: var(--text-primary); }
    button { padding: 10px; border: none; border-radius: 8px; background: var(--accent); color: #00140d; font-weight: 700; cursor: pointer; }
    .error { color: var(--danger); }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  readonly auth = inject(AuthService);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  submit() {
    if (this.form.invalid) {
      return;
    }

    this.error.set(null);
    this.auth.register(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => this.error.set(err?.error?.detail ?? 'No se pudo registrar')
    });
  }
}
