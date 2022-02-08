import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';
import { ClipService } from 'src/app/services/clip.service';
import IClip from 'src/app/models/clip.model';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  // 2 means ascending, 1 means descening order
  videoOrder = '1'
  clips:IClip[] = []

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private clipService: ClipService
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

}
