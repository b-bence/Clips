import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClipService } from './services/clip.service';

const routes: Routes = [
  {
    path:'',
    component: HomeComponent
  },
  {
    path:'about',
    component: AboutComponent
  },{
    path:'clip/:id',
    component: ClipComponent,
    // Angular will search for a function called resolve in our service. If it is available, it'll call it whenever the user visits this route
    // Data returned by the resolve function can be accessed throught the properties name of this object (data is referenced as clip in this case)
    resolve: {
      clip: ClipService
    }
  },{
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
