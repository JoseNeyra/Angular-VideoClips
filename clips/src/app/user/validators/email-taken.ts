import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/compat/auth";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";
import { Observable } from "rxjs";

// This class will serve as a validator to check on requirements that require an async operatation, such as Making sure an email is not being already used.
// Need to @Injectable to tell Angular to perform dependency injection to our class
// Need to implement the AsyncValidator interface in our class
@Injectable({
    providedIn: 'root'
})
export class EmailTaken implements AsyncValidator{

    constructor(private auth: AngularFireAuth) {}

    // This needs to be an arrow function to avoid issues with the context
    validate = (control: AbstractControl): Promise<ValidationErrors | null> => {
        // The fetchSignInMethodsForEmail checks takes in an email value and checks how the account is able to login and returns a promise with a string[] of available sign in options for the account, the chained then() will modify the resonse to an error object or false. If the array is empty, then this means that the account is not in use so we return null, otherwise we attach an error
        return this.auth.fetchSignInMethodsForEmail(control.value).then(
            response => response.length ?  { emailTaken: true }: null
        )
    }

    registerOnValidatorChange?(fn: () => void): void {
        throw new Error("Method not implemented.");
    }
}
