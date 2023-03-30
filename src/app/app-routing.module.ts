import { AuthGuardLoggedIn } from './shared/data-access/auth-guard-logged-in.service';
import { AuthGuard } from './shared/data-access/auth-guard.service';
import { LoginComponent } from './login/feature/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'expenses',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./expenses/feature/expense-shell/expense-shell.module').then(
        (m) => m.ExpenseShellModule
      ),
  },
  {
    path: '', pathMatch: 'full', redirectTo: 'expenses',
    // loadComponent: () =>
    //   import('./home/feature/home/home.component').then(
    //     (m) => m.HomeComponent
    //   ),
  },
  {
    path: 'login',
    canActivate: [AuthGuardLoggedIn],
    loadComponent: () =>
      import('./login/feature/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'sign-up',
    loadComponent: () =>
      import('./register/feature/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      ),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
