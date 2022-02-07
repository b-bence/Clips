import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// Inject one of AngularFireStorageModule's services to upload a file
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid'
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import firebase from 'firebase/compat/app';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover = false
  file: File | null = null
  showUploadForm = false

  showAlert = false
  alertMsg = 'Please wait! Your file is being uploaded'
  alertColor = 'blue'
  inSubmission = false
  percentage = 0
  showPercentage = false

  user: firebase.User | null = null

  title = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])

  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage:AngularFireStorage,
    private auth: AngularFireAuth
  ) { 
    // Its possible that the subscribe observable will send a null value instead of an user object. 
    // However the route guards prevent visitors from accessing this page if they are not authenticated
    auth.user.subscribe(user => this.user = user)
  }

  ngOnInit(): void {
  }

  storeFile($event: Event){
    this.isDragover = false

    // To be able to log files which are dropped in Chrome we have to do an extra step
    // dataTransfer --> files property is empty when dropped something
    // Chrome does not log the files unless we access it directly

    // Nullish coalescing operator in this case: the method could return a value of undefined, which is not good for our file variable
    // We could extend and add undefined too, but the nullish coalescing operator can be a good solution too
    // In case the value is File or null, it will return that (left side of the operator), 
    // but if its undefined the the right side of the operator will be returned
    this.file = ($event as DragEvent).dataTransfer?.files.item(0) ?? null


    if (!this.file || this.file.type !== 'video/mp4'){
      return
    }

    this.title.setValue(
      // removes the file extension from the string
      this.file.name.replace(/\.[^/.]+$/, "")
    )

    this.showUploadForm = true
  }

    uploadFile(){
    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    // Reset the values in case the user re submits the content
    this.alertMsg = 'Please wait! Your file is being uploaded'
    this.alertColor = 'blue'

    this.showAlert = true
    this.inSubmission = true
    this.showPercentage = true
    
      const task = this.storage.upload(clipPath,this.file)

      // Create a reference to the file
      const clipRef = this.storage.ref(clipPath)

      task.percentageChanges().subscribe(progress => {
        this.percentage = progress as number / 100
      })

      task.snapshotChanges().pipe(
        // Ignore values pushed by the observable. 
        // The snaposhotChanges sends an observable on percentage changes and also when the upload is complete, which is the last
        //We can set it so that no value will be pushed until the upload is finished

        // This observable would be push a snapshot object to subscribe
        last(),
        // Switchmap pushes an url object
        switchMap(() => clipRef.getDownloadURL())
      ).subscribe({
        // Define as arrow function to prevent the context from changing
        // The components properties won't be accessible unless we use an arrow function
        next: (url) =>{
          const clip = {
            uid: this.user?.uid,
            displayName: this.user?.displayName,
            title: this.title.value,
            fileName: `${clipFileName}.mp4`,
            url
          }

          console.log(clip)

          this.alertColor = "green"
          this.alertMsg = " Your file was uploaded!"
          this.showPercentage = false
        },
        error: (error) => {
          this.showAlert = true;
          this.alertMsg = "Uplad failed! Please try again!"
          this.alertColor = "red"
          this.showPercentage = false
          this.inSubmission = false
          console.error(error);
        }
      })
  }

}
