import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { delay, map, Observable } from 'rxjs';

import IUser from '../models/user.model';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private usersCollection: AngularFirestoreCollection<IUser>
  public isAuthenticated$: Observable <boolean>
  public isAuthenticatedWithDelay$: Observable<boolean>

  constructor(private auth: AngularFireAuth, private db: AngularFirestore) {
    this.usersCollection = db.collection<IUser>('users')       // Creates or updates a collection named 'users'. The generic helps us specify what object is getting passed to the collection 
    this.isAuthenticated$ = auth.user.pipe(       //isAuthenticated is an observable. The $ is best practice to help other devs identfy observables in the code
      map(user => !!user)     //The map operator will help us cast the user object to a boolean, returns true if user is not null
    )
    this.isAuthenticatedWithDelay$ = this.isAuthenticated$.pipe(
      delay(1000)
    )
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
}
