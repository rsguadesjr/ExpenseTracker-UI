export interface ExpenseRequestModel {
  id?: string | null;
  categoryId: number;
  amount: number;
  expenseDate: any;
  description: string;
  sourceId?: number;
  tags?: string[];
}
