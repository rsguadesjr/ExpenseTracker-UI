import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  toast$ = new BehaviorSubject<Message | null>(null);
  defaultKey = 'global-toast';

  constructor(private messageService: MessageService) {}

  showSuccess(detail: string, title: string = 'Success', key = this.defaultKey) {
    this.showMessage({ severity: 'success', summary: title, detail, key });
  }

  showInfo(detail: string, title: string = 'Info', key = this.defaultKey) {
    this.showMessage({ severity: 'infos', summary: title, detail, key });
  }

  showWarning(detail: string, title: string = 'Warn', key = this.defaultKey) {
    this.showMessage({ severity: 'warn', summary: title, detail, key });
  }

  showError(detail: string, title: string = 'Error', key = this.defaultKey) {
    this.showMessage({ severity: 'error', summary: title, detail, key });
  }

  clear(key = this.defaultKey) {
    this.messageService.clear(key);
  }


  private showMessage(alert: Message) {
    // this.toast$.next({
    //   severity: alert.severity,
    //   summary: alert.summary,
    //   detail: alert.detail,
    //   key: alert.key
    // });
    this.messageService.add(alert)
  }
}
