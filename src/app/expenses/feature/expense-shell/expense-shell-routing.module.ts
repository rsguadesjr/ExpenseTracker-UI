import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../expense-list/expense-list.page.component').then(
        (m) => m.ExpenseListPageComponent
      ),
  },
  {
    path: 'new',
    loadComponent: () =>
      import('../expense-detail/expense-detail.component').then(
        (m) => m.ExpenseDetailComponent
      ),
  },
  {
    path: 'edit/:id',
    loadComponent: () =>
      import('../expense-detail/expense-detail.component').then(
        (m) => m.ExpenseDetailComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseShellRoutingModule {}
