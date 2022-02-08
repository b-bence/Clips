import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection,DocumentReference } from '@angular/fire/compat/firestore';
import IClip from '../models/clip.model';

@Injectable({
  providedIn: 'root'
})
export class ClipService {
  public clipsCollection: AngularFirestoreCollection<IClip>

  constructor(
    private db: AngularFirestore
  ) { 
    this.clipsCollection = db.collection('clips')
  }

  createClip(data:IClip):Promise<DocumentReference<IClip>> {
    // Add will create an id for us automatically
    // Returns a promise which will resolve to a document. It contains an id that the upload component can use
    return this.clipsCollection.add(data)
  }
}
