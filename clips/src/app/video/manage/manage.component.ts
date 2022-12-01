import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import IClip from 'src/app/models/clip.model';
import { ClipService } from 'src/app/services/clip.service';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.css']
})
export class ManageComponent implements OnInit {

  videoOrder = '1'        // This variable stores the sort order, there are only 2 options in our Select Element, so this will be either 1 or 2. We will set the default to 1
  sort$: BehaviorSubject<string>

  clips: IClip[] = []
  activeClip: IClip | null = null
  

  constructor(
    private activeRoute: ActivatedRoute,
    private router: Router, 
    private clipService: ClipService,
    private modalService: ModalService
  ) { 
    this.sort$ = new BehaviorSubject(this.videoOrder)
  }

  ngOnInit(): void {
    // this.activeRoute.data.subscribe(console.log)            // Allows us to view the data property being passed by the route
    this.activeRoute.queryParamMap.subscribe((params: Params) => {     // Obtaining the query value from our activeRoute updates
      this.videoOrder = params['params'].sort === '2' ? params['params'].sort : '1'   // This updates our videoOrder variable as the route changes with new query params. This obeservable will be destroyed by angular when this component gets destroyed
      this.sort$.next(this.videoOrder)
    })

    // This allows us to subscribe to the getUserClips observable
    this.clipService.getUserClips(this.sort$).subscribe(docs => {
      this.clips = []   // Reset the clips array to avoid getting duplicates

      docs.forEach(doc => {     // Loop through the docs array received and push it the clips array
        this.clips.push({       // Pushing each object recieved from the observable array
          docID: doc.id,        // Storing the id in case we need to modify the clip object
          ...doc.data()         // Spread operator merges the properties with the object. The data function will not retrieve the id so that's why we have to add the docID param
        })
      })
    })
  }

  // This is triggered by the (change) event in the template, the event object will give us the value selected by the user
  sort(event: Event) {
    const { value } = (event.target as HTMLSelectElement)     // Destructuring the value property from the event.target property

    // this.router.navigateByUrl(`/manage?sort=${value}`)        // Passing a template string as an argument with our query param
    
    // This is another way of doing the same but using the navigate function instead of the navigateByUrl
    this.router.navigate(
      //['clips','a'],    // Constructs an absolute path: /clips/a\   : This is a way of redirecting the user to another page.
      [],                 // In this case, we just want to add query params to our existing path, so we'll leave this empty
      {
        relativeTo: this.activeRoute,   // Setting the relative path to our current path
        queryParams: {
          sort: value       // Key value pair to store the property name as 'sort' and it's value as 'value. The router will take care of converting this to a string
        }
      })
  }

  // This method allow us to control the modal
  openModal($event: Event, clip: IClip) {
    $event.preventDefault()

    this.activeClip = clip
    this.modalService.toggleModal('editClip')
  }

  //Handles the update event triggered by the edit component
  update($event: IClip) {
    // Loop through the list of clips until the matching clip is found
    this.clips.forEach((element, index) => {
      if (element.docID === $event.docID) {
        // Update the clip title
        this.clips[index].title = $event.title
      }
    })
  }

  deleteClip($event: Event, clip: IClip) {
    $event.preventDefault()   // Use this when the event is triggered by an anchor element <a>

    this.clipService.deleteClip(clip)

    // Now that the clip has been deleted from the storage, remove the deleted clip from the list of clips
    this.clips.forEach((element, index) => {
      if(element.docID === clip.docID) {
        this.clips.splice(index, 1)   // Removes items from the array
      }
    })
  }
}
