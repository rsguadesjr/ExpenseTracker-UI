import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { DataTableColumn } from '../../model/data-table-column';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    ToastModule
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent {

  rowData?: any[];
  @Input() set data(value: any[] | null) {
    if (value) {
      setTimeout(() => {
        this.rowData = value.map((row: any, i: number) => {
          row.__data = {};

          for (const col of this._columns) {
            if (col.formatValue) {
              row.__data[col.field] = col.formatValue(row, i);
            }
            else {
              row.__data[col.field] = row[col.field];
            }
          }

          return row;
        });

        this.cdr.detectChanges();
      });
    }
  }

  private _columns: DataTableColumn[] = [];
  @Input() set columns(cols: DataTableColumn[]) {
    if (cols) {
      this._columns = cols.map((d: any, i) => {
        // set width
        if (!d.width) {
          const percentage = (1/cols.length) * 100;
          d.width = `${percentage.toFixed(2)}%`
        }

        return d;
      });
    }
  }

  get columns() {
    return this._columns;
  }

  @Output() editSelected = new EventEmitter();
  @Output() deleteSelected = new EventEmitter();

  constructor(private cdr: ChangeDetectorRef) {

  }

  editItem(item: any) {
    this.editSelected.emit(item);
  }

  deleteItem(item: any) {
    console.log(item);
    this.deleteSelected.emit(item);
  }

  trackBy(index: number, item: any) {
    return item.id // O index
  }
}
