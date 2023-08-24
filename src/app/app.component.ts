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
import {
  BehaviorSubject,
  filter,
  map,
} from 'rxjs';
import { Store } from '@ngrx/store';
import { loadReminders } from './state/reminders/reminders.action';
import { loadCategories } from './state/categories/categories.action';
import { loadSources } from './state/sources/sources.action';
import { loadBudgets } from './state/budgets/budgets.action';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ExpenseTracker';
  sidebarVisible: boolean = false;

  accountMenuItems: MenuItem[] = [];

  showActionButtons = false;
  showViewAllExpensesButton = false;
  showNewButton = false;

  queryParams$ = new BehaviorSubject<ParamMap | null>(null);
  store = inject(Store);

  constructor(
    private router: Router,
    public authService: AuthService,
    private route: ActivatedRoute,
  ) {

    this.route.queryParamMap.subscribe((v) => {
      this.queryParams$.next(v);
    });

    const url$ = this.router.events.pipe(
      filter((event) => {
        return event instanceof NavigationEnd;
      }),
      map(() => router.url.split('?')[0])
    );

    url$.subscribe((url) => {
      this.showNewButton = ['/'].includes(url);
      this.showViewAllExpensesButton = ['/'].includes(url);
      this.showActionButtons =
        this.showNewButton && this.showViewAllExpensesButton;
    });

    this.authService.isAuthenticated$
      .pipe(
        // debounceTime(2000)
      )
      .subscribe(isAuth => {
        if (isAuth) {
          this.store.dispatch(loadCategories());
          this.store.dispatch(loadSources());
          this.store.dispatch(loadReminders({ params: { startDate: '', endDate: '' }}));
          this.store.dispatch(loadBudgets());
        }
      })
  }

  ngOnInit(): void {

  }

  showSideBar() {
    this.sidebarVisible = true;
  }

  viewExpenses() {
    const view = this.queryParams$.value?.get('view');
    this.router.navigate(['/expenses'], {
      queryParams: {
        view,
      },
    });
  }

  newEntry() {
    // this.router.navigate(['/expenses', 'new']);
  }

  visibleChange(e: any) {
    console.log('[DEBUG] visibleChange', e)
  }
}

