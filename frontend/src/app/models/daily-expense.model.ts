export interface DailyExpense {
  id?: number;
  description: string;
  amount: number | string;
  category?: string;
  date: string;
}

export interface DailyExpenseCreate {
  description: string;
  amount: number;
  category?: string;
  date: string;
}

export interface DailyExpenseUpdate {
  description?: string;
  amount?: number;
  category?: string;
  date?: string;
}