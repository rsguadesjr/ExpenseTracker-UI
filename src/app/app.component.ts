import { Component } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { GoogleAuthProvider } from 'firebase/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ExpenseTracker';

  constructor(private afAuth: AngularFireAuth) {

    this.afAuth.authState.subscribe(v => {
      console.log('[DEBUG] authState', {
        result: v,
        token: v?.getIdToken()
      });
      v?.getIdToken
      v?.getIdToken().then(x => {
        console.log('[DEBUG] x', x)
      })
    })
  }

  signIn() {
    this.afAuth.signInWithRedirect(new GoogleAuthProvider())
    .then((result) => {
      console.log('[DEBUG] signInWithRedirect', result)
    })
    .catch((error) => {
      console.log('[DEBUG] signInWithRedirect', error)
    });
  }

  signOut() {
    this.afAuth.signOut().then(() => {
      console.log('[DEBUG] signout');
    })
  }
}
