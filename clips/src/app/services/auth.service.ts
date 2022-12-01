import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { delay, filter, map, Observable, of, switchMap } from 'rxjs';

import IUser from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable <boolean>
  public isAuthenticatedWithDelay$: Observable<boolean>
  private redirect = false

  constructor(private auth: AngularFireAuth, private db: AngularFirestore, 
              private router: Router, private activeRoute: ActivatedRoute) {
    
    this.usersCollection = db.collection<IUser>('users')       // Creates or updates a collection named 'users'. The generic helps us specify what object is getting passed to the collection 
    
    this.isAuthenticated$ = auth.user.pipe(       //isAuthenticated is an observable. The $ is best practice to help other devs identfy observables in the code
      map(user => !!user)     //The map operator will help us cast the user object to a boolean, returns true if user is not null
    )
    
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )

    // Checking if the page the user is on requires authentication
    this.router.events.pipe(          
      filter( event => event instanceof NavigationEnd), //The events observable will emit all events that happened in the router, we can filter these events by class using the filter pipe. We are looking for the Navigation End event only.
      map( event => this.activeRoute.firstChild),        // Now we can take the Navigation End event and get the first activeRoute (current active Route)
      switchMap(activeRoute => activeRoute?.data ?? of({})) // Now we can subscribe to the active route observable and subscribe to it. NOTE the ?? is a new feature of JS, if the first part of our expression (activeRoute?.data) return null or undefined, the new return will be the second part of our expression (of({})) which returns an empty object, this will prevent a null pointer exception
    ).subscribe(data => {
      this.redirect = data['authOnly'] ?? false     // Sets the redirect attribute to true if the authOnly parameter is set to true, or false if it hasn't been set. Remember: this property has been set in the video-routing module
    })
  }

  public async createUser(userData: IUser) {
    // Check if we have the password
    if (!userData.password) {
      throw new Error("Password not provided!")
    }

    //Create a new user account associated with the specified email address and password. On successful creation of the user account, this user will also be signed in to the application.
    const userCredentials = await this.auth.createUserWithEmailAndPassword(
      userData.email as string, userData.password as string
    )

    // Check the user property in the UserCredentials object has been initialized
    if (!userCredentials.user) {
      throw new Error("User can't be found")
    }

    // The following creates a new document in the users collection and the document is given the user uid as an id, this makes it easier to map the user from the auth service to the db service
    await this.usersCollection.doc(userCredentials.user.uid).set({  // The set function returns a promise, need the await
      name: userData.name,
      email: userData.email,  // The authentication service is already storing the email, but it's handy to store this in the database service as well.
      age: userData.age,
      phoneNumber: userData.phoneNumber
    })

    // Set the Display name property in the user profile object in Firebase. You can also add a user image here by using the profileImage property
    await userCredentials.user.updateProfile({  
      displayName: userData.name
    })
  }

  public async logout() {
    await this.auth.signOut()    // Asynchronous method to remove Firebase auth token from application

    if (this.redirect) {
      await this.router.navigateByUrl('/')    // Redirect the user to the home page after logging out
    }
  }
}
