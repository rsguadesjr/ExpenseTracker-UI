import { environment } from './../environments/environment';
import { NgModule } from '@angular/core';
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

@NgModule({
  declarations: [
    AppComponent,
  ],
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
        tokenGetter: () => localStorage.getItem("accessToken"),
        allowedDomains: [],
        disallowedRoutes: [],
      },
    }),
    DynamicDialogModule,
    ConfirmDialogModule,
    HeaderComponent,
    SidebarComponent,
    AccessDirective
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    JwtHelperService,
    AuthGuard,
    RoleGuard,
    MessageService,
    ToastService,
    DialogService,
    ConfirmationService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
