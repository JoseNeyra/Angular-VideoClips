import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";


export class RegisterValidators {
    
    // Returns a factory function to be used as a validator
    static match(controlName: string, matchingControlName: string): ValidatorFn {

    // Returns a custom validator function for matching the password and confirm_password controls. Takes in the formGroup object
    // this factory function returns a key value pair when an error occurs, or null when validation passes
        return (group: AbstractControl): ValidationErrors | null => {
            const control = group.get(controlName)
            const matchingControl = group.get(matchingControlName)
    
            if (!control || !matchingControl) {
                console.error('Form controls can not be found in the form group')
                return { controlNotFound: false }
            }
    
            // Sets the error variable to null (if the values of the controls match) or to the {noMatch: true} object if the controls dont match 
            const error = control.value === matchingControl.value?
                null: 
                { noMatch: true }
            
            // Adds the error to the matchingControl control errors object
            matchingControl.setErrors(error)

            return error
        }
    }
}
