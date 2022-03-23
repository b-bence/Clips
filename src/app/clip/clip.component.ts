import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params} from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  // Turning off ViewEncapsulation
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ClipComponent implements OnInit {
  // Will perform a query on the template -> can select components, directives and regular html elements
  // Static: true -> the decorator will update this property with the element before ngOnInit function is called -> can initialize it in ngOnInit
  @ViewChild('videoPlayer', {static: true}) target?: ElementRef
  player? : videojs.Player
  clip?: IClip

  constructor(
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement)

    this.route.data.subscribe(data => {
      // Update the clip with the data we get from the resolver
      this.clip = data.clip as IClip

      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4'
      })
    })
  }

}
