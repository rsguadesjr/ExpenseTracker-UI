import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTableComponent } from 'src/app/shared/feature/data-table/data-table.component';
import { DataTableColumn } from 'src/app/shared/model/data-table-column';
import { DialogService } from 'primeng/dynamicdialog';
import { SettingsSourceFormComponent } from '../settings-source-form/settings-source-form.component';
import { take } from 'rxjs';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-settings-source.page',
  standalone: true,
  imports: [
    CommonModule,
    DataTableComponent,
    SettingsSourceFormComponent,
    ButtonModule
  ],
  templateUrl: './settings-source.page.component.html',
  styleUrls: ['./settings-source.page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsSourcePageComponent {

  data: any[] = [
    { id: 1, name: 'Cash', description: 'Cash Source', tags: [ 'tag1', 'tag2'] },
    { id: 2, name: 'Credit Card', description: 'Credit Card Source', tags: [ 'tag1111', 'tag2222'] },
  ];

  columns: DataTableColumn[] = [
    { header: 'Name', field: 'name' },
    { header: 'Description', field: 'description' },
    { header: 'Tags', field: 'tags', formatValue: (value: any, index: number) => {

      console.log('[DEBUG] formatvalue', { value, index})
      // return `${value.tags.join('-')} [${index + 1}]`
      return 'test'
    } }
  ]


  constructor(private dialogService: DialogService) { }


  onEdit(item: any) {
    const dialgoRef = this.dialogService.open(SettingsSourceFormComponent, {
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
    const dialgoRef = this.dialogService.open(SettingsSourceFormComponent, {
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
