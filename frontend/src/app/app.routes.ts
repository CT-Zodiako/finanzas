import { Routes } from '@angular/router';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { IncomesComponent } from './pages/incomes/incomes.component';
import { DailyExpensesComponent } from './pages/daily-expenses/daily-expenses.component';
import { FixedExpensesComponent } from './pages/fixed-expenses/fixed-expenses.component';
import { DebtsComponent } from './pages/debts/debts.component';
import { BudgetComponent } from './pages/budget/budget.component';
import { OptimizeComponent } from './pages/optimize/optimize.component';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'incomes', component: IncomesComponent },
  { path: 'daily-expenses', component: DailyExpensesComponent },
  { path: 'fixed-expenses', component: FixedExpensesComponent },
  { path: 'debts', component: DebtsComponent },
  { path: 'budget', component: BudgetComponent },
  { path: 'optimize', component: OptimizeComponent }
];