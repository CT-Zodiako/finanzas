export interface Income {
  id?: number;
  name: string;
  amount: number | string;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'daily';
  is_recurring: boolean;
  category?: string;
  date?: string;
}

export interface IncomeCreate {
  name: string;
  amount: number;
  frequency: 'monthly' | 'biweekly' | 'weekly' | 'daily';
  is_recurring: boolean;
  category?: string;
  date?: string;
}

export interface IncomeUpdate {
  name?: string;
  amount?: number;
  frequency?: 'monthly' | 'biweekly' | 'weekly' | 'daily';
  is_recurring?: boolean;
  category?: string;
  date?: string;
}