// types/expense.ts
export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  notes?: string;
  receiptUrl?: string;
  attachedFiles?: string[]; // Array of file IDs/URLs for multiple attachments
  projectId: number;
  createdAt: string;
}

export interface CreateExpenseData {
  title: string;
  amount: number;
  category: ExpenseCategory;
  expenseDate: string;
  notes?: string;
  receiptUrl?: string;
  offlineReceiptId?: string; // For offline image tracking (online sync disabled)
  attachedFileIds?: string[]; // Array of offline file IDs for multiple attachments
  projectId: number;
}

export type ExpenseCategory = 
  | 'Labor'
  | 'Materials'
  | 'Transport'
  | 'Equipment Rental'
  | 'Permits'
  | 'Misc';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Labor',
  'Materials', 
  'Transport',
  'Equipment Rental',
  'Permits',
  'Misc'
];

// For expense filtering and sorting
export interface ExpenseFilters {
  category?: ExpenseCategory;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
}

export type SortBy = 'date' | 'amount' | 'title' | 'category';
export type SortOrder = 'asc' | 'desc';
