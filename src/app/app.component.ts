import { AuthService } from './shared/data-access/auth.service';
import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { GoogleAuthProvider } from 'firebase/auth';
import { MenuItem } from 'primeng/api/menuitem';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'ExpenseTracker';
  sidebarVisible: boolean = false;

  accountMenuItems: MenuItem[] = [];

  constructor(private afAuth: AngularFireAuth, private router: Router, private authService: AuthService) {
    // this.afAuth.authState.subscribe((v) => {
    //   if (!v) {
    //     localStorage.removeItem('token');
    //     this.router.navigate(['login']);
    //   }
    //   console.log('[DEBUG] authState', {
    //     result: v,
    //     token: v?.getIdToken(),
    //   });
    //   v?.getIdToken;
    //   v?.getIdToken().then((x) => {
    //     console.log('[DEBUG] authState x', x);
    //     localStorage.setItem('token', 'sample value');
    //   });
    // });
  }
  ngOnInit(): void {
    this.accountMenuItems = [
      { label: 'Logout', command: () => this.signOut() },
    ];
  }

  signOut() {
    this.authService.signOut();
  }

  showSideBar() {
    this.sidebarVisible = true;
  }
}
