import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';
import { ModalService } from 'src/app/services/modal.service';

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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService,
    private modal: ModalService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1'
      // We don't have to unsubscribe from this observable because Angular will complete it when the component is destroyed
      // It is destroyed when the user navigates to a different page

    })
    this.clipService.getUserClips().subscribe(docs => {
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

}
