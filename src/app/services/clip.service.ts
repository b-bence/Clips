import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection,DocumentReference,QuerySnapshot } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';
// The id of the user with the document upload -> user ID can be retrieved with the authentication service
import { AngularFireAuth } from '@angular/fire/compat/auth'
import { switchMap, map } from 'rxjs/operators';
// Combine latest: subscribe to multiple observables at the same time
import { of, BehaviorSubject, combineLatest, firstValueFrom } from 'rxjs'
import { AngularFireStorage } from '@angular/fire/compat/storage'
import { ThrowStmt } from '@angular/compiler';
 
@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>
  // Store the clips and grab the last document to prevent firebase from querying the same document
  pageClips: IClip[] = []
  pendingReq = false

  constructor(
    private db: AngularFirestore,
    private auth: AngularFireAuth,
    private storage: AngularFireStorage
  ) { 
    this.clipsCollection = db.collection('clips')
  }

  createClip(data:IClip):Promise<DocumentReference<IClip>> {
    // Add will create an id for us automatically
    // Returns a promise which will resolve to a document. It contains an id that the upload component can use
    return this.clipsCollection.add(data)
  }

  getUserClips(sort$: BehaviorSubject<string>){
    return combineLatest([
        this.auth.user,
        // The observable here should subscribe to the behavior subject observable we created in the manage component
        // When the sort order is changed (new value is pushed to the subscriber) a new request will be sent, and the result will be returned -> the pipeline will handle the new value
        sort$
      ]).pipe(
      // Switch map requires an observable to be returned
      switchMap(values => {
        // Values will be pushed to an array in the order they are presented in combineLatest
        // First observable: user -> value pushed in the array will be from the user observable
        // Second: sort -> value from sort observable
        const [user, sort] = values
        if (!user){
          return of([])
        }
        // To initiate a query we have to select a collection -> we already selected it before
        // Ref: stores a reference to the collection. They are objects with methods to communicate with the database
        // We can create and search documents in a collection. Just using the ref will return the entire collection
        // Where: filter the documents
        const query = this.clipsCollection.ref.where(
          'uid','==',user.uid
        ).orderBy(
          // Could be anything
          'timestamp',
          // Updated in manage component
          sort === '1' ? 'desc': 'asc'
        )

        // Returns a promise
        return query.get()
      }),
      // The value resolved by the promise is a snapshot object
      map(snapshot => (snapshot as QuerySnapshot<IClip>).docs)
    )
  }

  updateClip(id: string, title: string){
    // Update only changes properties that we provide. Additional properties can be added too. 
    // Returns a promise -> return the promise to let components to handle the response
    return this.clipsCollection.doc(id).update({
      title
    })
  }

  async deleteClip(clip: IClip){
    // Clips have to be deleted from both firebase storage and firebase database

    // the ref function accepts a path to the file -> we use the directory called clips
    const clipReference = this.storage.ref(`clips/${clip.fileName}`)
    const screenshotReference = this.storage.ref(`screenshots/${clip.screenshotFileName}`)

    // Will delete the file from the storage
    // Important: we have to write rules in firebase to be able to delete files
    await clipReference.delete()
    await screenshotReference.delete()

    await this.clipsCollection.doc(clip.docID).delete()
  }

  async getClips(){
    if (this.pendingReq){
      return
    }

    this.pendingReq = true
    // References store methods for performing queryies
    let query = this.clipsCollection.ref.orderBy(
      'timestamp', 'desc'
      ).limit(6)

    const { length } = this.pageClips

    if (length){
      const lastDocID = this.pageClips[length-1].docID
      const lastDoc = await firstValueFrom(this.clipsCollection.doc(lastDocID)
        // Returns an obversable (normally its a promise) - Used toPromise() to get a promise, but that is deprecated -> use firstValueFrom() instead
        .get())
      
      query = query.startAfter(lastDoc)
    }

    // Snapshot contains document data 
    const snapshot = await query.get()

    // Trim the snapshot reponse to the document data
    snapshot.forEach(doc => {
      this.pageClips.push({
        docID: doc.id,
        // Push the documents data by calling data()
        ...doc.data()
      })
    })

    this.pendingReq = false
  }
}
