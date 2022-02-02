import { Component, OnInit } from '@angular/core';
import { Params, ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {
  // 2 means ascending, 1 means descening order
  videoOrder = '1'

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params:Params) => {
      this.videoOrder = params.sort === '2' ? params.sort : '1'
      // We don't have to unsubscribe from this observable because Angular will complete it when the component is destroyed
      // It is destroyed when the user navigates to a different page

    })
  }

  sort(event: Event){
    const {value} = (event.target as HTMLSelectElement)

    this.router.navigateByUrl(`/manage?sort=${value}`)
  }

}
