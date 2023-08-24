import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { DialogService } from 'primeng/dynamicdialog';
import { SettingsSourceFormComponent } from '../settings-source-form/settings-source-form.component';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { AccessDirective } from 'src/app/shared/utils/access.directive';

@Component({
  selector: 'app-settings-source',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SettingsSourceFormComponent,
    ButtonModule,
    AccessDirective
  ],
  templateUrl: './settings-source.component.html',
  styleUrls: ['./settings-source.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSourceComponent {

  data: any[] = [
    { id: 1, name: 'Cash', description: 'Cash Source', tags: [ 'tag1', 'tag2'] },
    { id: 2, name: 'Credit Card', description: 'Credit Card Source', tags: [ 'tag1111', 'tag2222'] },
  ];

  columns: DataTableColumn[] = [
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Tags', field: 'tags', formatValue: (value: any, index: number) => {
      return 'test'
    } }
  ]


  constructor(private dialogService: DialogService) { }


  onEdit(item: any) {
    this.dialogService.open(SettingsSourceFormComponent, {
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
  }

  onCreate() {
    this.dialogService.open(SettingsSourceFormComponent, {
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
  }

  onDelete(item: any) {
  }

}
