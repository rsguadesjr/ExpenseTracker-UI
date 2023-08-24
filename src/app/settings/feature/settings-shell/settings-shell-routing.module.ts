import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('../settings/settings.page.component').then(
        (m) => m.SettingsPageComponent
      ),
    children: [
      {
        path: 'category',
        loadComponent: () =>
          import('../settings-category/settings-category.component').then(
            (m) => m.SettingsCategoryComponent
          )
      },
      {
        path: 'source',
        loadComponent: () =>
          import('../settings-source/settings-source.component').then(
            (m) => m.SettingsSourceComponent
          )
      },
      {
        path: 'budget',
        loadComponent: () =>
          import('../settings-budget/settings-budget.component').then(
            (m) => m.SettingsBudgetComponent
          )
      },
      {
        path: 'preference',
        loadComponent: () =>
          import('../settings-preference/settings-preference.page.component').then(
            (m) => m.SettingsPreferencePageComponent
          )
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SettingsShellRoutingModule { }
