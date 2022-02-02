import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import IUser from '../models/user.model';
import { Observable, of } from 'rxjs';
import { map, delay, filter, switchMap } from 'rxjs/operators';
// Provides methods for interacting with the router
import { Router } from '@angular/router'
// Gather information about the route that the user is currently on
import { ActivatedRoute, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private usersCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable<boolean>
  public isAuthenticatedWithDelay$: Observable<boolean>
  private redirect = false;

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore,
    private router: Router,
    private route: ActivatedRoute
  ) { 
    this.usersCollection = db.collection('users')
    auth.user.subscribe(console.log)
    this.isAuthenticated$ = auth.user.pipe(
      map(user => !!user)
      
    )
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      map(event => this.route.firstChild),
      // nullish coalescing operator: checks if the value on the left is null or undefined
      // If the value is not empty, the operator will return the value. Otherwise it will return the value to the right of the operator
      switchMap(route => route?.data ?? of({}))
    ).subscribe(data => {
      this.redirect = data.authOnly ?? false
    })
  }

  public async createUser(userData: IUser){

    if (!userData.password){
      throw new Error("password not provided")
    }

    const userCred = await this.auth.createUserWithEmailAndPassword(
      userData.email, userData.password
     )

     if (!userCred.user){
       throw new Error("User can't be found")
     }

     await this.usersCollection.doc(userCred.user.uid).set({
       name: userData.name,
       email: userData.email,
       age: userData.age,
       phoneNumber: userData.phoneNumber
     })

     await userCred.user.updateProfile({
       displayName: userData.name
     })

  }

  public async logout($event?: Event){
    if ($event){
      $event.preventDefault();
    }
  
    await this.auth.signOut()

    if (this.redirect) {
      await this.router.navigateByUrl('/')
    }
  }
}
