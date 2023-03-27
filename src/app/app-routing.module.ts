import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'expenses',
    loadChildren: () =>
      import('./expenses/feature/expense-shell/expense-shell.module').then(
        (m) => m.ExpenseShellModule
      ),
  },
  {
    path: '',
    redirectTo: 'expense',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
