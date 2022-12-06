import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './about/about.component';
import { ClipComponent } from './clip/clip.component';
import { HomeComponent } from './home/home.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { ClipService } from './services/clip.service';

const routes: Routes = [
  {
    path: '', 
    component: HomeComponent
  },
  {
    path: 'about', 
    component: AboutComponent
  },
  {
    path: 'clip/:id', 
    component: ClipComponent, 
    resolve: {clip: ClipService}},      // Passing a route parameter: id . Using the resolve property to tell angular to look for the reolve method impl in the clip service
  {
    path: '', 
    loadChildren: async () => (await import('./video/video.module')).VideoModule    // Allows us to lazy load the Video Module. You must also remove the video module from the app.module
  },
  {
    path: '**',   // Using a Wild Card route in case a user tries to access a page that doesnt exist 
    component: NotFoundComponent
  }        
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
