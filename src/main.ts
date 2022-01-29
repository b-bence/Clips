import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';
import firebase from 'firebase/compat/app'
import 'firebase/compat/auth'

if (environment.production) {
  enableProdMode();
}
// manually set up firebase - connect to firebaase before initializing Angular
// by the time angular is bootstrapped, it will know if the user is logged in or not
firebase.initializeApp(environment.firebase)

let appInit = false

firebase.auth().onAuthStateChanged(() => {
  if (!appInit){
    platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.error(err));
    appInit = true
  }
  
})


