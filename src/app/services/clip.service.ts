import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection,DocumentReference } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
// The id of the user with the document upload -> user ID can be retrieved with the authentication service
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs'
 
@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth
  ) { 
    this.clipsCollection = db.collection('clips')
  }

  createClip(data:IClip):Promise<DocumentReference<IClip>> {
    // Add will create an id for us automatically
    // Returns a promise which will resolve to a document. It contains an id that the upload component can use
    return this.clipsCollection.add(data)
  }

  getUserClips(){
    return this.auth.user.pipe(
      // Swithc map requires an observable to be returned
      switchMap(user => {
        if (!user){
          return of([])
        }
        // To initiate a query we have to select a collection -> we already selected it before
        // Ref: stores a reference to the collection. They are objects with methods to communicate with the database
        // We can create and search documents in a collection. Just using the ref will return the entire collection
        // Where: filter the documents
        const query = this.clipsCollection.ref.where(
          'uid','==',user.uid
        )

        // Returns a promise
        return query.get()
      })
    )
  }
}
