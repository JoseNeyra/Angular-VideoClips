import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ManageComponent } from './manage/manage.component';
import { UploadComponent } from './upload/upload.component';
import { AngularFireAuthGuard, redirectUnauthorizedTo } from '@angular/fire/compat/auth-guard'

const redirectUnauthorizedToHome = () => redirectUnauthorizedTo('/')    // Pipe that redirects unathorized users to the home page ('/)

const routes: Routes = [
  { 
    path: 'manage', 
    component: ManageComponent, 
    data: {
      authOnly: true,    //Adding this data object to help us identify routes that need authentication 
      authGuardPipe: redirectUnauthorizedToHome
    },         
    canActivate: [AngularFireAuthGuard]   // This uses Firebases auth guard to guard our path if the user is not logged in
  },  
  { 
    path: 'upload', 
    component: UploadComponent, 
    data: {
      authOnly: true,
      authGuardPipe: redirectUnauthorizedToHome
    },
    canActivate: [AngularFireAuthGuard]
  },
  { // This's an example of a redirect, use it in case you need to redirect users from paths you no longer use in your app
    path: 'manage-clips', 
    redirectTo: 'manage'
  }     
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VideoRoutingModule { }
