import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from '../data-access/auth.service';

@Directive({
  selector: '[access]',
  standalone: true,
})
export class AccessDirective {
  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private authService: AuthService
  ) {}

  @Input() set access(allowedRoles: string[]) {
    const userData = this.authService.getUserData();

    let roles: string[] = [];
    if (userData && userData['Role']) {
      roles =
        typeof userData['Role'] === 'string'
          ? [userData['Role']]
          : userData['Role'];
    }

    if (roles.some((r) => allowedRoles.includes(r))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
