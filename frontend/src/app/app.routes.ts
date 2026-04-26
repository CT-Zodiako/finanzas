import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IncomesComponent } from './pages/incomes/incomes.component';
import { DailyExpensesComponent } from './pages/daily-expenses/daily-expenses.component';
import { FixedExpensesComponent } from './pages/fixed-expenses/fixed-expenses.component';
import { DebtsComponent } from './pages/debts/debts.component';
import { BudgetComponent } from './pages/budget/budget.component';
import { OptimizeComponent } from './pages/optimize/optimize.component';
import { LoginComponent } from './pages/auth/login.component';
import { RegisterComponent } from './pages/auth/register.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'incomes', component: IncomesComponent, canActivate: [authGuard] },
  { path: 'daily-expenses', component: DailyExpensesComponent, canActivate: [authGuard] },
  { path: 'fixed-expenses', component: FixedExpensesComponent, canActivate: [authGuard] },
  { path: 'debts', component: DebtsComponent, canActivate: [authGuard] },
  { path: 'budget', component: BudgetComponent, canActivate: [authGuard] },
  { path: 'optimize', component: OptimizeComponent, canActivate: [authGuard] }
];
