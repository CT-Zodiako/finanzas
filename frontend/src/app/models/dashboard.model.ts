export interface DashboardSummary {
  total_incomes: number;
  total_fixed_expenses: number;
  total_daily_expenses: number;
  total_debts: number;
  total_debts_with_installments?: number;
  balance: number;
  monthly_income: number;
}

export interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
}

export interface BudgetRecommendation {
  category: string;
  percentage: number;
  amount: number;
  description: string;
}

export interface BudgetResponse {
  total_income: number;
  recommendations: BudgetRecommendation[];
}