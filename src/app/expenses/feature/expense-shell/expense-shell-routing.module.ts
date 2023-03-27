import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('../expense-list/expense-list.module').then(
        (m) => m.ExpenseListModule
      ),
  },
  {
    path: ':id',
    loadChildren: () =>
      import('../expense-detail/expense-detail.module').then(
        (m) => m.ExpenseDetailModule
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseShellRoutingModule {}
