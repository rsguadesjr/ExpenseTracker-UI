import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../reminder-dashboard/reminder-dashboard.page.component').then(
        (m) => m.ReminderDashboardPageComponent
      ),
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReminderShellRoutingModule {}
