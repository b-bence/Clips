import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipService } from '../services/clip.service';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css']
})
export class ClipsListComponent implements OnInit,OnDestroy {

  constructor(public clipService: ClipService) { 
    this.clipService.getClips()
  }

  ngOnInit(): void {
    window.addEventListener('scroll', this.handleScroll)
  }

  ngOnDestroy(): void {
      window.removeEventListener('scroll', this.handleScroll)
  }

  // It has to be an arrow function, because with a normal function we would not be able to access component's injective services
  handleScroll = () => {
    const { scrollTop, offsetHeight } = document.documentElement
    const { innerHeight } = window

    const bottomOfWindow = Math.round(scrollTop) + innerHeight === offsetHeight

    if (bottomOfWindow){
      console.log('Reached the bottom of the window')
      this.clipService.getClips()
    }
  }

}
