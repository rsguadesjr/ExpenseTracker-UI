import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from 'src/app/core/utils/auth-guard';
import { RoleGuard } from 'src/app/core/utils/role-guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('../expense-page/expense-page.component').then(
        (m) => m.ExpensePageComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ExpenseShellRoutingModule {}
