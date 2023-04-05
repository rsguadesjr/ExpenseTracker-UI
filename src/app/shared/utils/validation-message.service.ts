import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ValidationMessageService {
  message$ = new BehaviorSubject<Message | null>(null);
  clear$ = new Subject<any>();
  defaultKey = 'route-level-validation-message';

  // TODO: make messages auto closable after certain duration
  constructor() {}

  showSuccess(detail: string, title: string = 'Success', key = this.defaultKey) {
    this.showMessage({ severity: 'success', summary: title, detail, key });
  }

  showInfo(detail: string, title: string = 'Info', key = this.defaultKey) {
    this.showMessage({ severity: 'info', summary: title, detail, key });
  }

  showWarning(detail: string, title: string = 'Warn', key = this.defaultKey) {
    this.showMessage({ severity: 'warn', summary: title, detail, key });
  }

  showError(detail: string, title: string = 'Error', key = this.defaultKey) {
    this.showMessage({ severity: 'error', summary: title, detail, key });
  }


  clear(key: string = '') {
    this.clear$.next(key);
  }

  showMessage(message: Message) {
    this.message$.next({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail,
      key: message.key
    });
  }
}
