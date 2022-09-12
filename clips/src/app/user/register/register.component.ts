import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import IUser from 'src/app/models/user.model';
import { AuthService } from 'src/app/services/auth.service';
import { EmailTaken } from '../validators/email-taken';
import { RegisterValidators } from '../validators/register-validators';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  showAlert = false
  alertMsg = 'Please wait! Your account is being created.'
  alertColor = 'blue'
  inSubmission = false

  constructor(private authService: AuthService, private emailTaken: EmailTaken){}

  name = new FormControl('', [                      // Passing in a default value of an empty string
    Validators.required,                            // Forces this input field to have value
    Validators.minLength(3)                         // Handles strings, this input must be higher than 3 chars
  ])
  email = new FormControl('', [
    Validators.required,
    Validators.email
  ], [this.emailTaken.validate])
  age = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(18),                              // Users under 18 cant register
    Validators.max(120)                              // Users over 120 cant register
  ])
  password = new FormControl('', [
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ])
  confirmPassword = new FormControl('', [
    Validators.required
  ])
  phoneNumber = new FormControl('', [
    Validators.required,
    Validators.minLength(13),                     // Phone numbers have 13 chars including the special chars (000)000-0000
    Validators.maxLength(13)
  ])

  // The form group takes in the controls of the form as an object and an array of validators to validate the form with.
  registerForm = new FormGroup({
    name : this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber
  }, [RegisterValidators.match('password', 'confirmPassword')])


  async register() {
    this.showAlert = true
    this.alertMsg = 'Please wait! Your account is being created.'   // Reseting the properties just in case initial submittion failed
    this.alertColor = 'blue'
    this.inSubmission = true

    // Get the email and password from the registerForm FormGroup object
    // const { email, password } = this.registerForm.value          // This is no longer needed since we moved the auth process to the auth service

    try{
      this.authService.createUser(this.registerForm.value as IUser)
    } catch(error) {
      console.error(error)

      this.alertMsg = 'An unexpected error ocurred. Please try again later'
      this.alertColor = 'red'
      this.inSubmission = false
      return
    }

    this.alertMsg = 'Success! Your account has been created.'
    this.alertColor = 'green'
  }
}
