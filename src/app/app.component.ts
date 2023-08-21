import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {
  ActivatedRoute,
  NavigationEnd,
  NavigationStart,
  ParamMap,
  Router,
} from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { MenuItem } from 'primeng/api/menuitem';
import { ToastService } from './shared/utils/toast.service';
import { Message, MessageService } from 'primeng/api';
import { ValidationMessageService } from './shared/utils/validation-message.service';
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  debounceTime,
  filter,
  map,
  mergeMap,
  of,
  startWith,
  switchMap,
  takeUntil,
} from 'rxjs';
import { CategoryService } from './shared/data-access/category.service';
import { SourceService } from './shared/data-access/source.service';
import { ExpenseService } from './expenses/data-access/expense.service';
import { SummaryService } from './summary/data-access/summary.service';
import { ExpenseDetailComponent } from './expenses/feature/expense-detail/expense-detail.component';
import { DialogService } from 'primeng/dynamicdialog';
import { Store } from '@ngrx/store';
import { loadReminders } from './state/reminders/reminders.action';
import { endOfYear, startOfYear } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ExpenseTracker';
  sidebarVisible: boolean = false;

  accountMenuItems: MenuItem[] = [];
  validationMessages: Message[] = [];

  showActionButtons = false;
  showViewAllExpensesButton = false;
  showNewButton = false;

  queryParams$ = new BehaviorSubject<ParamMap | null>(null);
  store = inject(Store);

  constructor(
    private afAuth: AngularFireAuth,
    private router: Router,
    public authService: AuthService,
    private alertService: ToastService,
    private messageService: MessageService,
    private validationMessagService: ValidationMessageService,
    private route: ActivatedRoute,
    private categoryService: CategoryService,
    private sourceService: SourceService,
    private expenseService: ExpenseService,
    private summaryService: SummaryService,
    private dialogService: DialogService,
  ) {

    this.validationMessagService.message$.subscribe((v) => {
      if (v) {
        this.validationMessages = [v, ...this.validationMessages];
      }
    });

    this.route.queryParamMap.subscribe((v) => {
      this.queryParams$.next(v);
    });

    const url$ = this.router.events.pipe(
      filter((event) => {
        return event instanceof NavigationEnd;
      }),
      map((event: any) => router.url.split('?')[0])
    );

    url$.subscribe((url) => {
      this.showNewButton = ['/'].includes(url);
      this.showViewAllExpensesButton = ['/'].includes(url);
      this.showActionButtons =
        this.showNewButton && this.showViewAllExpensesButton;
    });


    this.validationMessagService.clear$.subscribe((v) => {
      this.validationMessages = [];
    });


    // this.authService.user$
    // .subscribe({
    //   next: (user) => {
    //     if (user) {
    //       this.categoryService.initCategories();
    //       this.sourceService.initSources();
    //     }
    //   }
    // })

    this.authService.isAuthenticated$
      .pipe(
        debounceTime(2000)
      )
      .subscribe(isAuth => {
        if (isAuth) {
          this.categoryService.initCategories();
          this.sourceService.initSources();
          this.store.dispatch(loadReminders({ params: { startDate: '', endDate: '' }}))
        }
      })


    combineLatest([
      this.expenseService.getCreatedOrUpdateItem().pipe(startWith('')),
      this.expenseService.getDeletedId().pipe(startWith(''))
    ])
    .pipe()
    .subscribe(([latestData, id]) => {
      if (latestData || id) {
        this.summaryService.clearCache()
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
    const dialgoRef = this.dialogService.open(ExpenseDetailComponent, {
      width: '420px',
      header: 'Create',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      styleClass: 'component-dialog',
      closeOnEscape: true,
      data: {
        isDialog: true
      },

    })
  }

  visibleChange(e: any) {
    console.log('[DEBUG] visibleChange', e)
  }
}

