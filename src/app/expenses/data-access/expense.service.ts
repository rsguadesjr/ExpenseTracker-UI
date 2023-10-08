import { environment } from './../../../environments/environment';
import { Observable } from 'rxjs';
import { Injectable, inject } from '@angular/core';
import { ExpenseResponseModel } from '../model/expense-response.model';
import { HttpClient } from '@angular/common/http';
import { ExpenseRequestModel } from '../model/expense-request.model';
import { PaginatedList } from 'src/app/shared/model/paginated-list.model';
import { TotalPerCategory } from 'src/app/shared/model/total-per-category.mode';
import { TotalAmountPerCategoryPerDate } from 'src/app/summary/model/total-amount-per-category-per-date';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private http = inject(HttpClient);
  private baseUrl = environment.API_BASE_URL + 'api/expenses';

  getExpenses(params: any): Observable<PaginatedList<ExpenseResponseModel>> {
    return this.http.post<PaginatedList<ExpenseResponseModel>>(
      `${this.baseUrl}/GetExpenses`,
      params
    );
  }

  getExpense(id: string): Observable<ExpenseRequestModel> {
    return this.http.get<ExpenseRequestModel>(`${this.baseUrl}/${id}`);
  }

  createExpense(data: ExpenseRequestModel) {
    return this.http.post<ExpenseResponseModel>(`${this.baseUrl}`, data);
  }

  updateExpense(data: ExpenseRequestModel) {
    return this.http.put<ExpenseResponseModel>(
      `${this.baseUrl}/${data.id}`,
      data
    );
  }

  deleteExpense(id: string) {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  categorizedExpenses(expenses: ExpenseResponseModel[]) {
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

  dailyCategorizedExpenses(expenses: ExpenseResponseModel[]) {
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
}
