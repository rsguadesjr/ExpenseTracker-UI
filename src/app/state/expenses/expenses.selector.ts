import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExpenseState } from './expenses.reducer';
import { state } from '@angular/animations';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';
import { ExpenseResponseModel } from 'src/app/expenses/model/expense-response.model';

export const selectExpenses = (state: AppState) => state.expenses;

export const selectAllExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState): ExpenseResponseModel[] => state.expenses
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

// TODO: do we move this to reducer or effects ???
// categorized expense / total amount per category
export const categorizedExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => {
    const expenses = state.expenses;
    const categories = expenses
      .filter(
        (exp, i) =>
          exp.category != null &&
          expenses.findIndex((e) => e.category.id === exp.category.id) === i
      )
      .map((exp) => ({ id: exp.category?.id, name: exp.category?.name }));

    return categories
      .map((category) => {
        const totalPerCategory = expenses
          .filter((exp) => category.id === exp.category.id)
          .reduce((total, current) => total + current.amount, 0);
        return <TotalPerCategory>{
          total: totalPerCategory,
          categoryId: category.id,
          category: category.name,
        };
      })
      .sort((a, b) => (a.total < b.total ? 0 : -1));
  }
);

// TODO: do we move this to reducer or effects ???
// categorized expense per date / total amount per category per date
export const dailyCategorizedExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => {
    const expenses = state.expenses;
    const dates = Array.from(new Set(expenses.map((exp) => exp.expenseDate)));
    const categories = expenses
      .filter(
        (exp, i) =>
          exp.category != null &&
          expenses.findIndex((e) => e.category.id === exp.category.id) === i
      )
      .map((exp) => ({ id: exp.category.id, name: exp.category.name }));

    return dates
      .map((date) => {
        const dateExpenses = expenses.filter((exp) => exp.expenseDate == date);
        return categories.map(
          (category) =>
            <TotalAmountPerCategoryPerDate>{
              categoryId: category.id,
              category: category.name,
              expenseDate: date,
              total: dateExpenses
                .filter((exp) => exp.category.id == category.id)
                .reduce((total, current) => total + current.amount, 0),
            }
        );
      })
      .flat();
  }
);
