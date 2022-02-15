import { Component, OnInit, OnDestroy, Input, OnChanges, Output, EventEmitter} from '@angular/core';
import { ModalService } from 'src/app/services/modal.service'
import IClip from 'src/app/models/clip.model';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ClipService } from 'src/app/services/clip.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit,OnDestroy, OnChanges {
  // Accept data from the manage template
  @Input() activeClip: IClip | null = null

  // Output: Allows the parent component to listen to an event on the component
  // Event emitter: Generates a custom event -> listen to it by (update)="eventHandler($event)"
  // $event: in this case it will be the object we pass (emit)
  @Output() update = new EventEmitter()

  inSubmission = false
  showAlert = false
  alertColor = "blue"
  alertMessage = "Please wait! Updating the clip."

  clipID = new FormControl('')

  title = new FormControl('', [
    Validators.required,
    Validators.minLength(3)
  ])

  editForm = new FormGroup({
    title: this.title,
    id: this.clipID
  })

  constructor(
    private modal: ModalService,
    private clipService: ClipService
  ) { }

  ngOnInit(): void {
    this.modal.register("editClip")
  }

  ngOnDestroy(): void {
      this.modal.unregister("editClip")
  }

  // OnChanges will be called whenever a components properties are updated by a parent component. 
  // This method can be used to update our form control when the activeClip property is modified
  ngOnChanges(): void {
      if (!this.activeClip){
        return
      }

      // If we submit changes on one clip, the modal will (ideally) shoow the success message
      // However, if we close the modal and click edit on an other clip, the success message will be on that modal as well -> set values to prevent it
      this.inSubmission = false
      this.showAlert = false

      // FormControl method to update form control value
      // Have to bind them to a FormGroup in the template file to see the changes
      this.clipID.setValue(this.activeClip.docID)
      this.title.setValue(this.activeClip.title)
  }

  async submit(){
    if (!this.activeClip){
      return
    }

    this.inSubmission = true
    this.showAlert = true
    // Reset the value in case of re-submission
    this.alertColor = "blue"
    this.alertMessage = "Please wait! Updating the clip."

    try{
      // If we don't handle the promise, the code that comes after this might run 
      await this.clipService.updateClip(this.clipID.value, this.title.value)
    } catch(error){
      this.inSubmission = false
      this.alertColor = "red"
      this.alertMessage = "Something went wrong! Please try again later."
      return
    }

    // At the manage component the active clip was created using deep copy
    // In case it was only a shallow one, this change would affect the clip object as well, overwriting the clip title
    this.activeClip.title = this.title.value
    // Sends an update to the parent component
    this.update.emit(this.activeClip)

    this.inSubmission = false
    this.alertColor = "green"
    this.alertMessage = "Success!"

    
  }

}
