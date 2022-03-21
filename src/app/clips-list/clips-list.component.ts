import { Component, OnInit, OnDestroy } from '@angular/core';
import { ClipService } from '../services/clip.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-clips-list',
  templateUrl: './clips-list.component.html',
  styleUrls: ['./clips-list.component.css'],
  // Pipes are not Injectable and has to add to providers to be become injectable
  // Has to be injectable in the class, because if we were to add it to a module, we'd need to add it to every module that uses this pipe
  // By adding it to the component class, whenever we use the component, the pipe will become injectable
  providers:[DatePipe]
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
