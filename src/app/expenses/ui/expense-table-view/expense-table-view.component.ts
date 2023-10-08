import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { PaginatorModule } from 'primeng/paginator';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FilterService } from 'primeng/api';
import { BehaviorSubject, map, of } from 'rxjs';
import { Option } from 'src/app/shared/model/option.model';
import { SortPipe } from 'src/app/shared/utils/sort.pipe';
import { AccessDirective } from 'src/app/shared/utils/access.directive';
import { ExpenseResponseModel } from '../../model/expense-response.model';

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
    AccessDirective,
  ],
  templateUrl: './expense-table-view.component.html',
  styleUrls: ['./expense-table-view.component.scss'],
})
export class ExpenseTableViewComponent {
  items$ = new BehaviorSubject<ExpenseResponseModel[]>([]);
  @Input() set items(value: ExpenseResponseModel[]) {
    if (value) {
      this.items$.next(value.map((v) => Object.assign(v)));
    }
  }

  categories$ = this.items$.pipe(
    map((v) => {
      return v
        .filter(
          (exp, i) =>
            exp.category != null &&
            v.findIndex((e) => e.category.id === exp.category.id) === i
        )
        .map((exp) => exp.category);
    })
  );

  sources$ = this.items$.pipe(
    map((v) => {
      return v
        .filter(
          (exp, i) =>
            exp.source != null &&
            v.findIndex((e) => e.source.id === exp.source.id) === i
        )
        .map((exp) => exp.source);
    })
  );

  tags$ = this.items$.pipe(
    map((v) => {
      const value = v.reduce((acc: string[], obj: ExpenseResponseModel) => {
        acc = [...acc, ...obj.tags!];
        return acc;
      }, []);
      return Array.from(new Set(value)).map((x) => ({ name: x } as Option));
    })
  );

  @Output() selected = new EventEmitter<ExpenseResponseModel>();
  @Output() delete = new EventEmitter<ExpenseResponseModel>();
  @Output() onFilterChange = new EventEmitter<ExpenseResponseModel[]>();

  editEntry(item: ExpenseResponseModel) {
    this.selected.emit(item);
  }

  deleteEntry(item: ExpenseResponseModel) {
    this.delete.emit(item);
  }

  constructor(private filterService: FilterService) {
    const customFilterName = 'dataArrayFilter';
    this.filterService.register(
      customFilterName,
      (value: any | any[], filter: Option[]): boolean => {
        if (filter == null || filter.length == 0) {
          return true;
        }

        if (Array.isArray(value)) {
          return value.some((r: any) => {
            const lookup = r?.name ?? r;
            return filter.map((x) => x.name).includes(lookup);
          });
        } else {
          return filter.some((x) => {
            const lookup = value?.name ?? value;
            return x.name == lookup;
          });
        }
      }
    );
  }

  onFilter({ filteredValue }: { filteredValue: ExpenseResponseModel[] }) {
    this.onFilterChange.emit(filteredValue);
  }
}
