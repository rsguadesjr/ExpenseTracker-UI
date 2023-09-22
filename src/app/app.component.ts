import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import {
  ActivatedRoute,
  NavigationEnd,
  ParamMap,
  Router,
} from '@angular/router';
import { MenuItem } from 'primeng/api/menuitem';
import { Message } from 'primeng/api';
import { ValidationMessageService } from './shared/utils/validation-message.service';
import { BehaviorSubject, filter, map, take, takeUntil } from 'rxjs';
import { Store } from '@ngrx/store';
import { loadReminders } from './state/reminders/reminders.action';
import { loadCategories } from './state/categories/categories.action';
import { loadSources } from './state/sources/sources.action';
import { loadBudgets } from './state/budgets/budgets.action';
import { autoLogin } from './state/auth/auth.action';
import { isAuthenticated, token } from './state/auth/auth.selector';
import { loadExpenses } from './state/expenses/expenses.action';
import { endOfMonth, startOfMonth } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private store = inject(Store);
  private router = inject(Router);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private date = new Date();

  title = 'ExpenseTracker';
  sidebarVisible: boolean = false;

  accountMenuItems: MenuItem[] = [];

  showActionButtons = false;
  showViewAllExpensesButton = false;
  showNewButton = false;

  queryParams$ = this.route.queryParamMap;
  view$ = this.route.queryParamMap.pipe(map((qp) => qp.get('view')));

  constructor() {}

  ngOnInit() {
    this.store.dispatch(autoLogin());

    this.store
      .select(isAuthenticated)
      .pipe()
      .subscribe((authenticated) => {
        if (authenticated) {
          this.store.dispatch(loadCategories());
          this.store.dispatch(loadSources());
          this.store.dispatch(
            loadReminders({ params: { startDate: '', endDate: '' } })
          );
          this.store.dispatch(loadBudgets());

          this.store.dispatch(
            loadExpenses({
              params: {
                dateFrom: startOfMonth(this.date),
                dateTo: endOfMonth(this.date),
                pageNumber: 0,
                totalRows: 9999, //this.rowsPerPage,
              },
            })
          );
        }
      });
  }

  showSideBar() {
    this.sidebarVisible = true;
  }

  viewExpenses(view: string) {
    // const view = this.queryParams$.value?.get('view');
    this.router.navigate(['/expenses'], {
      queryParams: {
        view,
      },
    });
  }

  newEntry() {
    // this.router.navigate(['/expenses', 'new']);
  }

  visibleChange(e: any) {}
}
