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
    // Adding lazy loading:
    // Apps are made of multiple files → we don’t need all of them, only has to load the ones the user is interacting with
    // We can break our app into chunks
    // We process the application with Webpack → A chunk is a webpack feature:
    // By default webpack bundles the files into as few files as possible → can override it to keep a chunk out of the bundle and only load it when its needed

    // Going to add lazy loading for the video module -> will load when the user visits the upload or manage page
    path:'', // could add different values to append, e.g.: dashboard -> would turn to dashboard/manage, dashboard/upload
    // Load a module dynamically -> async
    // To sum up: Telling Angular to load this module when the user visits the paths from this module -> has to tell webpack explicitly which module to export -> .VideoModule  
    loadChildren: async () => (await import('./video/video.module')).VideoModule
  },
  {
    path: '**',
    component: NotFoundComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
