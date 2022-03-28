import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';
// Can create objects that acts as an observer and observable at the same time
// Normally we can subscribe to observables to wait for values pushed by the observer
// Subscribers cant force the observable to push a new value → Behavior subjects can do this
// It can push a value, while being subscribed to an observable
import { BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  // 2 means ascending, 1 means descening order
  videoOrder = '1'
  clips:IClip[] = []
  activeClip: IClip | null = null
  // $ is used as a practice to identify observables
  // BehaviorSubject must specify the type of value pushed by the observable. Will omit values whenever the sorting value changes
  sort$: BehaviorSubject<string>

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) { 
    this.sort$ = new BehaviorSubject(this.videoOrder)
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1'
      // We don't have to unsubscribe from this observable because Angular will complete it when the component is destroyed
      // It is destroyed when the user navigates to a different page

      // Have to push the sort order to the obserable, otherwise it would push the same value -> orderBy in clip service will use it
      this.sort$.next(this.videoOrder)

    })
    this.clipService.getUserClips(this.sort$).subscribe(docs => {
      // The observable always pushes a fresh list of documents
      this.clips = []

      docs.forEach(doc => {
        this.clips.push({
          // The data function below does not return the id -> have to add manually
          // Has to add docID to the IClip model
          docID: doc.id,
          ...doc.data()
        })
      })
    })
  }

  sort(event: Event){
    const {value} = (event.target as HTMLSelectElement)

    this.router.navigate([],{
      relativeTo: this.route,
      queryParams: {
        sort: value
      }
    })
  }

  openModal($event: Event, clip: IClip){
    $event.preventDefault()

    // Has to create a deep copy. Otherwise changes on the active clip (eg on title edit) will be reflected on the original object as well
    this.activeClip = JSON.parse(JSON.stringify(clip))

    this.modal.toggleModal("editClip")
  }

  // The event object will not contain the typical event data. 
  // Data stored here will be the data emitted by the child component -> Annotate it with the IClip model
  update($event: IClip){
    this.clips.forEach((element,index) => {
      if (element.docID == $event.docID){
        this.clips[index].title = $event.title
      }
    })
  }

  deleteClip($event: Event, clip: IClip){
    $event.preventDefault()

    this.clipService.deleteClip(clip)

    // After deleting the clip from the storage and database, delete from the page as well
    this.clips = this.clips.filter((element) => element.docID != clip.docID)

    // this.clips.forEach((element, index) => {
    //   if(element.docID == clip.docID){
    //     this.clips.splice(index, 1)
    //   }
    // })
  }

  async copyToClipboard($event: MouseEvent, docID: string | undefined){
    $event.preventDefault()

    if (!docID){
      return
    }

    // location is defined by the browser -> info about the current location of the browser
    // location.url -> base url
    const url = `${location.origin}/clip/${docID}`

    // Using the clipboard api instead of the execCOmmand
    await navigator.clipboard.writeText(url)

    alert("Link copied!")
  }
}
