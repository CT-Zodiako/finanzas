import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  template: `
    <div class="app">
      <nav class="navbar">
        <div class="navbar__brand">
          <span class="navbar__logo">F</span>
          <span class="navbar__title">Finanzas</span>
        </div>
        
        <button class="navbar__toggle" (click)="toggleMenu()" [class.is-open]="menuOpen()">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div class="navbar__menu" [class.is-open]="menuOpen()">
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Dashboard</span>
          </a>
          <a routerLink="/incomes" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <span>Ingresos</span>
          </a>
          <a routerLink="/daily-expenses" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Gastos Diarios</span>
          </a>
          <a routerLink="/fixed-expenses" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 4H3a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            <span>Gastos Fijos</span>
          </a>
          <a routerLink="/debts" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
            <span>Deudas</span>
          </a>
          <a routerLink="/budget" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
            <span>Presupuesto</span>
          </a>
          <a routerLink="/optimize" routerLinkActive="active" (click)="closeMenu()">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            <span>Optimizar</span>
          </a>
        </div>
      </nav>
      <main class="main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrl: './app.scss'
})
export class App implements OnInit {
  private auth = inject(AuthService);
  menuOpen = signal(false);

  ngOnInit() {
    this.auth.checkSession().subscribe();
  }
  
  toggleMenu() {
    this.menuOpen.update(v => !v);
  }
  
  closeMenu() {
    this.menuOpen.set(false);
  }
}
