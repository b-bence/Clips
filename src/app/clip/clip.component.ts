import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css']
})
export class ClipComponent implements OnInit {
  id = ''
  // Will perform a query on the template -> can select components, directives and regular html elements
  // Static: true -> the decorator will update this property with the element before ngOnInit function is called -> can initialize it in ngOnInit
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.id = params.id
    })
  }

}
