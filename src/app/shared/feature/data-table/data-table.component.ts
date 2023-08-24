import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { DataTableColumn } from '../../model/data-table-column';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { AccessDirective } from '../../utils/access.directive';

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    ToastModule,
    AccessDirective,
  ],
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss'],
})
export class DataTableComponent {
  @ViewChild(Table) dt?: Table;

  @Input() sortField = '';
  @Input() sortOrder = -1;
  @Input() showLoading = false;

  rowData?: any[];
  @Input() set data(value: any[] | null) {
    if (value) {
      // TODO: check behavior when removing setTimeout
      setTimeout(() => {
        this.rowData = value.map((row: any, i: number) => {
          const obj = Object.assign({}, row);
          obj.__data = {};

          for (const col of this._columns) {
            if (col.formatValue) {
              obj.__data[col.field] = col.formatValue(obj, i);
            } else if (col.html) {
              obj.__data[col.field] = col.html(obj, i);
            } else {
              obj.__data[col.field] = obj[col.field];
            }
          }

          return obj;
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
          const percentage = (1 / cols.length) * 100;
          d.width = `${percentage.toFixed(2)}%`;
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

  constructor(private cdr: ChangeDetectorRef) {}

  editItem(item: any) {
    this.editSelected.emit(item);
  }

  deleteItem(item: any) {
    this.deleteSelected.emit(item);
  }

  trackBy(index: number, item: any) {
    return item.id; // O index
  }
}
