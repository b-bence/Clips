import { Component, OnDestroy } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
// Inject one of AngularFireStorageModule's services to upload a file
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { v4 as uuid } from 'uuid'
import { last, switchMap } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/compat/auth';
// Angular fire package doesn't expose all methods which are present in firebase (e.g.: timestamp)-> import firebase object
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
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

  task?: AngularFireUploadTask

  screenshots: string[] = []
  selectedScreenshot = ''
  screenshotTask?: AngularFireUploadTask

  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])

  uploadForm = new FormGroup({
    title: this.title
  })

  constructor(
    private storage: AngularFireStorage,
    private auth: AngularFireAuth,
    private clipsService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService
  ) {
    // Its possible that the subscribe observable will send a null value instead of an user object. 
    // However the route guards prevent visitors from accessing this page if they are not authenticated
    auth.user.subscribe(user => this.user = user)
    this.ffmpegService.init()
  }

  ngOnDestroy(): void {
    // When we navigate to a different page the component will be destroyed, but the upload in the background would continue
    // Cancel uploads to firebase
    this.task?.cancel()
  }

  async storeFile($event: Event) {

    // Only allow to process one file at a time
    if (this.ffmpegService.isRunning){
      return
    }

    this.isDragover = false

    // To be able to log files which are dropped in Chrome we have to do an extra step
    // dataTransfer --> files property is empty when dropped something
    // Chrome does not log the files unless we access it directly

    // Nullish coalescing operator in this case: the method could return a value of undefined, which is not good for our file variable
    // We could extend and add undefined too, but the nullish coalescing operator can be a good solution too
    // In case the value is File or null, it will return that (left side of the operator), 
    // but if its undefined the the right side of the operator will be returned
    this.file = ($event as DragEvent).dataTransfer ?
      // in case the event is drag and drop
      ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      // Checking in case the event is something else, e.g.: using the upload button
      ($event.target as HTMLInputElement).files?.item(0) ?? null


    if (!this.file || this.file.type !== 'video/mp4') {
      return
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file)

    // Add image highlight to selected screenshot
    this.selectedScreenshot = this.screenshots[0]

    // Hyperlinks and image sources are sanitized by Angular. If it doesn't trust the url -> prefix with unsafe -> browser throws an error
    this.title.setValue(
      // removes the file extension from the string
      this.file.name.replace(/\.[^/.]+$/, "")
    )

    this.showUploadForm = true
  }

  async uploadFile() {
    const clipFileName = uuid()
    const clipPath = `clips/${clipFileName}.mp4`

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot)
    // Path to firebase
    const screenshotPath = `screenshots/${clipFileName}.png`

    // Preventing users from editing forms during upload
    // Alternative to binding the disabled attribute
    this.uploadForm.disable()

    // Reset the values in case the user re submits the content
    this.alertMsg = 'Please wait! Your file is being uploaded'
    this.alertColor = 'blue'

    this.showAlert = true
    this.inSubmission = true
    this.showPercentage = true

    this.task = this.storage.upload(clipPath, this.file)

    // Create a reference to the file
    const clipRef = this.storage.ref(clipPath)

    // The value retuned by this will be helpful to give updates about the status of the upload
    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob)

    this.task.percentageChanges().subscribe(progress => {
      this.percentage = progress as number / 100
    })

    this.task.snapshotChanges().pipe(
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
      next: async (url) => {
        const clip = {
          // Firebase will annotate uid and display name as string | undefined
          // However we know they will return a value because the user must be authenticated
          // Assert the values to strings, so that the createClips method and IClip interface wouldn't have errors
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url,
          // Firestore object contains methods and properties related to the database service -> Every service in firebase are under an object
          // Field value property is an object used to generate values for a document. Values generated with this method can be used with the add function
          timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }

        const clipDocumentReference = await this.clipsService.createClip(clip)

        console.log(clip)

        this.alertColor = "green"
        this.alertMsg = " Your file was uploaded!"
        this.showPercentage = false

        // Success message appears after upload. Let the user see that message for a while
        setTimeout(() => {
          // The navigate function assumes that the path is absolute
          this.router.navigate([
            'clip',clipDocumentReference.id
          ])
        },1000)
      },
      error: (error) => {
        this.uploadForm.enable()
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
