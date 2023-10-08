import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { AuthService } from 'src/app/core/data-access/auth.service';

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
    const userData = this.authService.getAuthData();
    let roles: string[] = [];
    if (userData?.role) {
      roles =
        typeof userData.role === 'string' ? [userData.role] : userData.role;
    }

    if (roles.some((r) => allowedRoles.includes(r))) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
}
