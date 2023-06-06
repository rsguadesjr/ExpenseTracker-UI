export interface BudgetRequest {
  id?: number;
  amount: number;
  month: number;
  year: number;
  isActive: boolean;

  budgetCategories: {
    amount: number,
    categorId: number
  }[];
}
