import { environment } from './../environments/environment';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireAuthModule } from '@angular/fire/compat/auth';
import { PrimeNgModule } from './prime-ng.module';
import { JwtHelperService, JwtModule, JWT_OPTIONS } from '@auth0/angular-jwt';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { AuthInterceptor } from './shared/utils/auth-interceptor';
import { ToastService } from './shared/utils/toast.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { HeaderComponent } from './home/feature/header/header.component';
import { SidebarComponent } from './home/feature/sidebar/sidebar.component';
import { AccessDirective } from './shared/utils/access.directive';
import { AuthGuard } from './core/utils/auth-guard';
import { RoleGuard } from './core/utils/role-guard';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { expenseReducer } from './state/expenses/expenses.reducer';
import { EffectsModule } from '@ngrx/effects';
import { ExpenseEffects } from './state/expenses/expenses.effects';
import { reminderReducer } from './state/reminders/reminders.reducer';
import { ReminderEffects } from './state/reminders/reminders.effects';
import { CategoryEffects } from './state/categories/categories.effects';
import { SourceEffects } from './state/sources/sources.effects';
import { BudgetEffects } from './state/budgets/budget.effects';
import { categoryReducer } from './state/categories/categories.reducer';
import { sourceReducer } from './state/sources/sources.reducer';
import { budgetReducer } from './state/budgets/budget.reducer';
import { authReducer } from './state/auth/auth.reducer';
import { AuthEffects } from './state/auth/auth.effects';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebaseConfig),
    AngularFireAuthModule,
    PrimeNgModule,
    BrowserAnimationsModule,
    HttpClientModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => localStorage.getItem('accessToken'),
        allowedDomains: [],
        disallowedRoutes: [],
      },
    }),
    DynamicDialogModule,
    ConfirmDialogModule,
    HeaderComponent,
    SidebarComponent,
    AccessDirective,
    StoreModule.forRoot({
      expenses: expenseReducer,
      reminders: reminderReducer,
      categories: categoryReducer,
      sources: sourceReducer,
      budgets: budgetReducer,
      auth: authReducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: !isDevMode(), // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
      trace: false, //  If set to true, will include stack trace for every dispatched action, so you can see it in trace tab jumping directly to that part of code
      traceLimit: 75, // maximum stack trace frames to be stored (in case trace option was provided as true)
    }),
    EffectsModule.forRoot([
      ExpenseEffects,
      ReminderEffects,
      CategoryEffects,
      SourceEffects,
      BudgetEffects,
      AuthEffects,
    ]),
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    JwtHelperService,
    AuthGuard,
    RoleGuard,
    MessageService,
    ToastService,
    DialogService,
    ConfirmationService,
    DecimalPipe,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
