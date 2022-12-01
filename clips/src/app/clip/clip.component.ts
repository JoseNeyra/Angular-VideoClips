import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css']
})
export class ClipComponent implements OnInit {

  id: string = ''

  constructor(public activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    //this.id = this.activeRoute.snapshot.params['id']      // Get the id value from the route parameter, this is asnapshot only. This wont work if the id gets updated and the page needs to update it's information

    this.activeRoute.params.subscribe( (params: Params) => {  // Use this instead of above, this uses an observable and updates the id param as it gets updated
      this.id = params['id']
    })
  }

}
