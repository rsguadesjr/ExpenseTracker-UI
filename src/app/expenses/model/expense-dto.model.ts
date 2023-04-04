export interface ExpenseDto {
  id?: string | null;
  categoryId: number;
  category?: string;
  amount: number;
  expenseDate: any;
  description: string;
  sourceId?: number;
  source?: string;
}
