import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/utils/auth-guard';
import { RoleGuard } from 'src/app/core/utils/role-guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../expense-list/expense-list.page.component').then(
        (m) => m.ExpenseListPageComponent
      ),
  },
  {
    path: 'new',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: ['SuperAdmin', 'Admin', 'Standard', 'BasicExpense'] },
    loadComponent: () =>
      import('../expense-detail/expense-detail.component').then(
        (m) => m.ExpenseDetailComponent
      ),
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard, RoleGuard],
    data: { role: ['SuperAdmin', 'Admin', 'Standard', 'BasicExpense'] },
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
