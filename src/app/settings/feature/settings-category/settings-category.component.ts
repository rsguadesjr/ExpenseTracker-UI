import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, take } from 'rxjs';
import { CategoryService } from 'src/app/shared/data-access/category.service';
import { ToastService } from 'src/app/shared/utils/toast.service';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DialogService } from 'primeng/dynamicdialog';
import { SettingsCategoryFormComponent } from '../settings-category-form/settings-category-form.component';
import { ButtonModule } from 'primeng/button';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { Store } from '@ngrx/store';
import { selectAllCategories } from 'src/app/state/categories/categories.selector';
import { CategoryResponseModel } from 'src/app/shared/model/category-response.model';
import { CategoryRequestModel } from 'src/app/shared/model/category-request.model';

@Component({
  selector: 'app-settings-category',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ButtonModule,
    AccessDirective
  ],
  templateUrl: './settings-category.component.html',
  styleUrls: ['./settings-category.component.scss'],
})
export class SettingsCategoryComponent {
  private store = inject(Store);
  private categoryService = inject(CategoryService);
  private dialogService = inject(DialogService);

  categories$ = this.store.select(selectAllCategories);
  columns: DataTableColumn[] = [
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Status', field: 'isActive', formatValue: (value) => value.isActive ? 'Active' : 'Inactive' }
  ];


  onEdit(item: CategoryResponseModel) {
    this.dialogService.open(SettingsCategoryFormComponent, {
      width: '420px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        id: item.id,
        description: item.description,
        isActive: item.isActive,
        name: item.name,
        order: item.order
      } as CategoryRequestModel,
    });
  }

  onCreate() {
    this.dialogService.open(SettingsCategoryFormComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isActive: true
      },
    });
  }

  onDelete(item: any) {
  }
}
