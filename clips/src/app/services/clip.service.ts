import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore, AngularFirestoreCollection, DocumentReference, QuerySnapshot } from '@angular/fire/compat/firestore';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { BehaviorSubject, combineLatest, map, of, switchMap } from 'rxjs';
import IClip from '../models/clip.model';


@Injectable({
  providedIn: 'root'
})
export class ClipService {

  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(private db: AngularFirestore, private auth: AngularFireAuth, 
    private storage: AngularFireStorage) { 
    this.clipsCollection = db.collection('clips')
  }

  // Adds a clip video to our clip collection in Firestore
  createClip(data: IClip): Promise<DocumentReference<IClip>> {
    return this.clipsCollection.add(data)     // Returns a promise as a Firestore Document Reference formated as an IClip
  } 

  // Method to help us retrieve the user's clips from the datastore
  getUserClips(sort$: BehaviorSubject<string>) {
    // First we need to get the user id
    return combineLatest([      // The combineLatest operator will allow us to subscribe to both the sort$ and auth.user observables
      this.auth.user,
      sort$
    ]).pipe(
      // Using switchMap to observe the result of the first observable
      switchMap(values => {

        const [user, sort] = values

        // If the user is null return an empty array
        if(!user) {
          return of([])
        } 

        // If the user is valid create a query to get all documents that match the user uid
        const query = this.clipsCollection.ref.where(     // A query can be made against a collection. We already have a reference to our clips collection
          'uid', '==', user.uid       // Checks if the user uid matches the user logged in
        ).orderBy(      // Allows us to order our query results, in this case by timeStamp, in etiher descencing or ascending order depending on the value pushed by the sort$ observable
          'timestamp',
          sort === '1' ? 'desc' : 'asc'
        )

        return query.get()    // Performs the query and returns a Promise with all the matching documents
      }),
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)      // Attaching the map operator to get the docs only and not all the remaining attibutes from the user. Remember the clip document was structured with the IClip interface.
    )
  }

  updateClip(id: string, title: string) {
    // The doc() function allows us to select a document by id
    return this.clipsCollection.doc(id).update({  
      title         // The update function will update the title property only in this case, You can also modify any other property and also add new properties through the update() function
    })
  }

  async deleteClip(clip: IClip) {
    const clipReference = this.storage.ref(`clips/${clip.fileName}`)    //Stores a reference to the file. the ref() takes in the path to the file
    
    await clipReference.delete()      // Deletes the clip from the storage

    await this.clipsCollection.doc(clip.docID).delete()   // Deletes the document from the collection
  }
}
