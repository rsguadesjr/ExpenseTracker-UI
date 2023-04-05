import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SidebarModule } from 'primeng/sidebar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { MenuModule } from 'primeng/menu';
import { ToastModule } from 'primeng/toast';
import { MessagesModule } from 'primeng/messages';
@NgModule({
  imports: [
    ButtonModule,
    ToolbarModule,
    SidebarModule,
    SlideMenuModule,
    MenuModule,
    ToastModule,
    MessagesModule
  ],
  exports: [
    ButtonModule,
    ToolbarModule,
    SidebarModule,
    SlideMenuModule,
    MenuModule,
    ToastModule,
    MessagesModule
  ],
})
export class PrimeNgModule { }
