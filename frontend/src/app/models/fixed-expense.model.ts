export interface FixedExpense {
  id?: number;
  name: string;
  amount: number | string;
  category?: string;
  due_day?: number;
  is_active: boolean;
}

export interface FixedExpenseCreate {
  name: string;
  amount: number;
  category?: string;
  due_day?: number;
  is_active?: boolean;
}

export interface FixedExpenseUpdate {
  name?: string;
  amount?: number;
  category?: string;
  due_day?: number;
  is_active?: boolean;
}