import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';

@Component({
  selector: 'app-nav',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {

  // isAuthenticated = false

  constructor(public modal: ModalService, public auth: AuthService) { 
    // Subscribe to the observable from the AuthService that tells us if the user has been authenticated
    // auth.isAuthenticated$.subscribe(status => {    // No longer needed because we are using the async pipe in the template to subscribe to the observable there
    //   this.isAuthenticated = status
    // })
  }

  ngOnInit(): void {
  }

  openModal($event: Event) {
    $event.preventDefault()       // Prevents the default behaviour of going to #

    this.modal.toggleModal('auth')
  }

  logout($event: Event) {
    $event.preventDefault()

    this.auth.logout()
  }
}
