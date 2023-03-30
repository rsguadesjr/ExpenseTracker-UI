import { NgModule } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { SidebarModule } from 'primeng/sidebar';
import { SlideMenuModule } from 'primeng/slidemenu';
import { MenuModule } from 'primeng/menu';
@NgModule({
  imports: [
    ButtonModule,
    ToolbarModule,
    SidebarModule,
    SlideMenuModule,
    MenuModule,
  ],
  exports: [
    ButtonModule,
    ToolbarModule,
    SidebarModule,
    SlideMenuModule,
    MenuModule,
  ],
})
export class PrimeNgModule {}
