import { Component } from '@angular/core';
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

@Component({
  selector: 'app-settings-category.page',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    ButtonModule,
    AccessDirective
  ],
  templateUrl: './settings-category.page.component.html',
  styleUrls: ['./settings-category.page.component.scss'],
})
export class SettingsCategoryPageComponent {
  categories$: Observable<any[]>;
  columns: DataTableColumn[] = [
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Status', field: 'isActive', formatValue: (value) => value.isActive ? 'Active' : 'Inactive' }
  ];

  constructor(
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private router: Router
  ) {
    // take only initial value
    this.categoryService.initCategories();
    this.categories$ = this.categoryService.getCategories();
  }

  onEdit(item: any) {
    const dialgoRef = this.dialogService.open(SettingsCategoryFormComponent, {
      width: '420px',
      header: 'Update',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        ...item
      },

    })

    dialgoRef.onClose.pipe(take(1))
    .subscribe((result) => {
      if (result) {
      }
    })
  }

  onCreate() {
    const dialgoRef = this.dialogService.open(SettingsCategoryFormComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isActive: true
      },

    })

    dialgoRef.onClose.pipe(take(1))
    .subscribe((result) => {
      if (result) {
      }
    })
  }

  onDelete(item: any) {
  }
}
