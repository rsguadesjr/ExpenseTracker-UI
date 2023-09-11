import { LoginComponent } from './login/feature/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/utils/auth-guard';
import { AuthGuardLoggedIn } from './core/utils/auth-guard-logged-in';

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
    path: '',
    canActivate: [AuthGuard],
    loadComponent: () =>
      import('./home/feature/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'login',
    canActivate: [AuthGuardLoggedIn],
    loadComponent: () =>
      import('./login/feature/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  // Temporary disable this route
  // {
  //   path: 'sign-up',
  //   canActivate: [AuthGuardLoggedIn],
  //   loadComponent: () =>
  //     import('./login/feature/sign-up/sign-up.component').then(
  //       (m) => m.SignUpComponent
  //     ),
  // },
  // {
  //   path: 'forgot-password',
  //   canActivate: [AuthGuardLoggedIn],
  //   loadComponent: () =>
  //     import('./login/feature/forgot-password/forgot-password.component').then(
  //       (m) => m.ForgotPasswordComponent
  //     ),
  // },

  {
    path: 'sign-up',
    canActivate: [AuthGuardLoggedIn],
    loadComponent: () =>
      import('./login/feature/disabled-page/disabled-page.component').then(
        (m) => m.DisabledPageComponent
      ),
  },
  {
    path: 'forgot-password',
    canActivate: [AuthGuardLoggedIn],
    loadComponent: () =>
      import('./login/feature/disabled-page/disabled-page.component').then(
        (m) => m.DisabledPageComponent
      ),
  },
  {
    path: 'summary',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./summary/feature/summary-shell/summary-shell.module').then(
        (m) => m.SummaryShellModule
      ),
  },
  {
    path: 'account',
    canActivate: [AuthGuard],
    data: { role: ['SuperAdmin', 'Admin', 'Standard'] },
    loadChildren: () =>
      import(
        './account/feature/account-shell/account-shell-routing.module'
      ).then((m) => m.AccountShellRoutingModule),
  },
  {
    path: 'settings',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./settings/feature/settings-shell/settings-shell.module').then(
        (m) => m.SettingsShellModule
      ),
  },
  {
    path: 'reminders',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./reminders/feature/reminder-shell/reminder-shell.module').then(
        (m) => m.ReminderShellModule
      ),
  },
  {
    path: 'home',
    redirectTo: '',
  },
  {
    path: '**',
    redirectTo: '',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
