import { DatePipe } from '@angular/common';
import { Component, ElementRef, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import videojs from 'video.js';
import IClip from '../models/clip.model';

@Component({
  selector: 'app-clip',
  templateUrl: './clip.component.html',
  styleUrls: ['./clip.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [DatePipe]
})
export class ClipComponent implements OnInit {
  @ViewChild('videoPlayer', { static: true }) target?: ElementRef
  player?: videojs.Player
  clip?: IClip

  constructor(public activeRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.player = videojs(this.target?.nativeElement, )

    //this.id = this.activeRoute.snapshot.params['id']      // Get the id value from the route parameter, this is asnapshot only. This wont work if the id gets updated and the page needs to update it's information

    // this.activeRoute.params.subscribe( (params: Params) => {  // Use this instead of above, this uses an observable and updates the id param as it gets updated
    //   this.id = params['id']
    // })

    this.activeRoute.data.subscribe( data => {
      this.clip = data['clip'] as IClip

      this.player?.src({
        src: this.clip.url,
        type: 'video/mp4'
      })
    })
  }

}
