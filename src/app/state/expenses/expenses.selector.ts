import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExpenseState } from './expenses.reducer';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';
import { ExpenseResponseModel } from 'src/app/expenses/model/expense-response.model';

export const selectExpenses = (state: AppState) => state.expenses;

export const selectAllExpenses = (
  params?: {
    startDate: Date;
    endDate: Date;
  } | null
) =>
  createSelector(
    selectExpenses,
    (state: ExpenseState): ExpenseResponseModel[] => {
      let expenses = [...state.expenses];

      if (params?.startDate) {
        expenses = expenses.filter(
          (exp) =>
            new Date(exp.expenseDate).getTime() >= params.startDate.getTime()
        );
      }

      if (params?.endDate) {
        expenses = expenses.filter(
          (exp) =>
            new Date(exp.expenseDate).getTime() <= params.endDate.getTime()
        );
      }

      return expenses;
    }
  );

export const selectCurrentMonthExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState): ExpenseResponseModel[] => state.currentMonthExpenses
);

export const selectFilteredExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.filteredExpenses
);

export const loadingStatus = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.loadingStatus
);

export const savingStatus = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.savingStatus
);
