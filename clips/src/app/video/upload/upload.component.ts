import { Component, OnDestroy, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { last, switchMap } from 'rxjs';
import { v4 as uuid } from 'uuid'       // Getting the uuid package v4 as uuid
import firebase from 'firebase/compat/app'
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router'

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {

  isDragover = false
  file: File | null = null
  isFileSubmitted: boolean

  showAlert: boolean = false
  alertColor: string = 'blue'
  alertMsg: string = ''
  isUploading: boolean = false
  percentage: number = 0
  showPercentage: boolean = false
  user: firebase.User | null = null
  task?: AngularFireUploadTask


  constructor(private storage: AngularFireStorage, private auth: AngularFireAuth, private clipsService: ClipService, 
    private router: Router) {
    this.isFileSubmitted = false
    auth.user.subscribe(user => {
      this.user = user      // Holds the current logged-in user information, this will never be null because of our route guards
    })
  }
  ngOnDestroy(): void {
    this.task?.cancel()     // This will end the upload process if the user navigates out of the upload page
  }

  title: FormControl = new FormControl('', {
    validators: [
      Validators.required,
      Validators.minLength(3)
    ],
    nonNullable: true
  })

  uploadForm: FormGroup = new FormGroup({
    title: this.title
  })

  storeFile(event: Event) {
    this.isDragover = false

    // Here we're getting the file that was droped by the user from the event object
    // (??)If the files.item(0) returns undefined, we'll convert it to a null instead.
    this.file = (event as DragEvent).dataTransfer ? 
      (event as DragEvent).dataTransfer?.files.item(0) ?? null :     // This will trigger if the file was dragged and dropped
      (event.target as HTMLInputElement).files?.item(0) ?? null      // This will trigger if the file was inputted through the input tag

    // Checking if the files's mime type is video/mp4
    if (!this.file || this.file.type !== 'video/mp4') {
      console.log('The file is the wrong format')
      return
    }

    // This will replace the title formControl value to the name of the file the user uploaded
    this.title.setValue(                          
      this.file.name.replace(/\.[^/.]+$/, '')     // The replace method with this regex removes the file extension from the file name.
    )
    this.isFileSubmitted = true
  }

  uploadFile() {
    this.uploadForm.disable()   // Disable the form so that user can't modify the form as it's beeing submitting
    this.showAlert = true
    this.alertColor = 'blue'
    this.alertMsg = 'Uploading video, please wait ...'
    this.isUploading = true;
    this.showPercentage = true;

    // const clipPath = `clips/${this.file?.name}`   // This will allow us to specify the folder where all the clips will be located
    // If the directory does not exist in the storage, Firebase will create it  

    const clipFileName = uuid()                   // This function returns a random uuid
    const clipPath = `clips/${clipFileName}.mp4`  // We're changing the first approach because the user may upload files with the same name which will overwrite previous files, by using an uuid we make sure users wont overwrite earlier files

    this. task = this.storage.upload(clipPath, this.file)    // This is a Firebase function that allow us to upload a file. It takes the file name 'clipPath' and the file

    const clipReference = this.storage.ref(clipPath);   // This holds the Firestore reference to the file we're uploading. This wont be finalized until the upload is complete. We need to subscribe to an inner observable in the task observable to get the finalized value 

    this.task.percentageChanges().subscribe(progress => {      // This allows us to get the upload progress as a percentage from Firebase
      this.percentage = progress as number / 100
    })

    // Here is another subscription to the task observable, this will only be triggered when the upload has completed. 
    this.task.snapshotChanges().pipe(      
      last(),
      switchMap(() => clipReference.getDownloadURL())   // Allows us to subscribe to the last observable to retrieve the finalized clip reference
    ).subscribe({
      next: async(url) => {
        const clip: IClip = {             // The clip object will allow us to map the user to their video uploads in the Firestore
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url,           // Adding the url property from the getDownloadURL() to the object. This is using es6 syntax for(url: url)
          timestamp: firebase.firestore.FieldValue.serverTimestamp()        // Returns a timestamp from the server timestamp, this will allow us to sort the videos by upload time
        }

        const clipDocumentReference = await this.clipsService.createClip(clip)
        console.log(clip)

        this.alertColor = 'green'
        this.alertMsg = 'Video Upload Completed!'
        this.showPercentage = false

        setTimeout(() => {          // This will allow us to redirect the user to view the clip after 1 second of a successfull upload
          this.router.navigate([
            'clip', clipDocumentReference.id      // This will give the route the id as a parameter
          ])
        })
      },
      error: (error) => {
        this.uploadForm.enable()      // Enable the form again so that the user can address the error
        this.alertColor = 'red'
        this.alertMsg = 'Video Upload Failed!'
        this.showPercentage = false
        this.isUploading = false
        console.log(error)
      }
    })
  }
}
