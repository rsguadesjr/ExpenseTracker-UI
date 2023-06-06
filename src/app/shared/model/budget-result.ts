import { BudgetCategoryResult } from "./budget-category-result";

export interface BudgetResult {
  id: number;
  amount: Number
  month: number;
  year: number;
  isDefault: boolean;
  isActive: boolean;
  userId: string;
  createdDate: string;
  modifiedDate: string;

  budgetCategories: BudgetCategoryResult[];
}
