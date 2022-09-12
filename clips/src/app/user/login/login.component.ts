import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  credentials = {
    email: '',
    password: ''
  }

  showAlert: boolean = false
  alertMsg: string = ''
  alertColor: string = ''
  signingIn: boolean = false

  constructor(private auth: AngularFireAuth) { }

  ngOnInit(): void {
  }

  async login() {
    try {
      this.showAlert = true
      this.alertMsg = 'Logging in! please wait.'   // Reseting the properties just in case initial submittion failed
      this.alertColor = 'blue'
      this.signingIn = true

      await this.auth.signInWithEmailAndPassword(   // Attempting to sign in, this is an asynchronous method
        this.credentials.email, this.credentials.password
      )
    } catch (error) {
      console.error(error)

      this.alertMsg = 'An unexpected error ocurred. Please try again later'
      this.alertColor = 'red'
      this.signingIn = false
      return
    }

    this.alertMsg = 'Success!'
    this.alertColor = 'green'
  }
}
