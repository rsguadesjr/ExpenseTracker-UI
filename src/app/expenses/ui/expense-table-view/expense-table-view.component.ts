import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { Expense } from '../../model/expense.model';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FilterService } from 'primeng/api';
import { BehaviorSubject, map, of } from 'rxjs';
import { Option } from 'src/app/shared/model/option.model';
import { SortPipe } from 'src/app/shared/utils/sort.pipe';
import { AccessDirective } from 'src/app/shared/utils/access.directive';

@Component({
  selector: 'app-expense-table-view',
  standalone: true,
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    PaginatorModule,
    MultiSelectModule,
    TagModule,
    AutoCompleteModule,
    SortPipe,
    AccessDirective
  ],
  templateUrl: './expense-table-view.component.html',
  styleUrls: ['./expense-table-view.component.scss'],
})
export class ExpenseTableViewComponent {
  items$ = new BehaviorSubject<Expense[]>([]);
  @Input() set items(value: Expense[]) {
    if (value) {
      this.items$.next(value);
    }
  }

  categories$ = this.items$.pipe(map(v => {
    const value = v.map(x => x.category);
    return Array.from(new Set(value)).map(x => ({ name: x } as Option));
  }))

  sources$ = this.items$.pipe(map(v => {
    const value = v.map(x => x.source);
    return Array.from(new Set(value)).map(x => ({ name: x } as Option));
  }))

  tags$ = this.items$.pipe(map(v => {
    const value = v.reduce((acc: string[], obj: Expense) => {
      acc = [...acc, ...obj.tags!];
      return acc;
    }, [])
    return Array.from(new Set(value)).map(x => ({ name: x } as Option));
  }))

  @Output() selected = new EventEmitter<Expense>();
  @Output() delete = new EventEmitter<Expense>();
  @Output() onFilterChange = new EventEmitter<Expense[]>();

  editEntry(item: Expense) {
    this.selected.emit(item);
  }

  deleteEntry(item: Expense) {
    this.delete.emit(item);
  }

  constructor(private filterService: FilterService) {
    const customFilterName = 'dataArrayFilter';
    this.filterService.register(customFilterName, (value: any | any[], filter: Option[]): boolean => {
      if (filter == null || filter.length == 0) {
        return true;
      }

      if (Array.isArray(value)) {
        return value.some((r: any) => filter.map(x => x.name).includes(r));
      }
      else {
        return filter.some(x => x.name == value);
      }
    });
  }

  onFilter({ filteredValue } : { filteredValue: Expense[] }) {
    this.onFilterChange.emit(filteredValue);
  }
}
