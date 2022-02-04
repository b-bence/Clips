import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  isDragover = false
  file: File | null = null
  showUploadForm = false

  title = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])

  uploadForm = new FormGroup({
    title: this.title
  })

  constructor() { }

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
    console.log(this.file)
  }

  uploadFile(){
    console.log("File uploaded");
  }

}
