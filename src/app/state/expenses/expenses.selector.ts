import { createSelector } from '@ngrx/store';
import { AppState } from '../app.state';
import { ExpenseState } from './expenses.reducer';
import { state } from '@angular/animations';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';

export const selectExpenses = (state: AppState) => state.expenses;

export const selectCurrentMonthExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.currentMonthExpenses
);

export const selectAllExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.expenses
);

export const loadingStatus = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.loadingStatus
);

export const savingStatus = createSelector(
  selectExpenses,
  (state: ExpenseState) => state.savingStatus
)

// categorized expense / total amount per category
export const categorizedExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => {
    const expenses = state.expenses;
    const categories = expenses
      .filter(
        (exp, i) =>
          expenses.findIndex((e) => e.categoryId === exp.categoryId) === i
      )
      .map((exp) => ({ id: exp.categoryId, name: exp.category }));

    return categories
      .map((category) => {
        const totalPerCategory = expenses
          .filter((exp) => category.id === exp.categoryId)
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

// categorized expense per date / total amount per category per date
export const dailyCategorizedExpenses = createSelector(
  selectExpenses,
  (state: ExpenseState) => {
    const expenses = state.expenses;
    const dates = Array.from(new Set(expenses.map((exp) => exp.expenseDate)));
    const categories = expenses
      .filter(
        (exp, i) =>
          expenses.findIndex((e) => e.categoryId === exp.categoryId) === i
      )
      .map((exp) => ({ id: exp.categoryId, name: exp.category }));

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
                .filter((exp) => exp.categoryId == category.id)
                .reduce((total, current) => total + current.amount, 0),
            }
        );
      })
      .flat();
  }
);
