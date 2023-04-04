import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MessageService } from 'primeng/api';
import { Alert } from '../model/alert';

@Injectable({
  providedIn: 'root'
})
export class AlertService {
    
    alert$ = new BehaviorSubject<Alert | null>(null);

    showSuccess(detail: string, title: string = 'Success') {
        this.showMessage({ severity: 'success', summary: title, detail })
    }

    showInfo(detail: string, title: string = 'Info') {
        this.showMessage({ severity: 'success', summary: title, detail })
    }

    showWarn(detail: string, title: string = 'Warn') {
        this.showMessage({ severity: 'success', summary: title, detail })
    }

    showError(detail: string, title: string = 'Error') {
        this.showMessage({ severity: 'success', summary: title, detail })
    }

    showMessage(alert: Alert) {
        this.alert$.next({ severity: alert.severity, summary: alert.summary, detail: alert.detail });
    }
}