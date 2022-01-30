import { ValidationErrors, AbstractControl, ValidatorFn } from "@angular/forms";

export class RegisterValidators {

// ValidatorFn:
// Angular exports an interface for factory functions that return a validator
static match(controlName: string, matchingControlName: string): ValidatorFn {

    return (group: AbstractControl): ValidationErrors | null => {
        const control = group.get(controlName)
        const matchingControl = group.get(matchingControlName)
    
        if (!control || !matchingControl){
            console.error('Form controls cannot be found in the form group')
            return { controlNotFound: false}
        }
    
        const error = control.value === matchingControl.value? 
            null:
            { noMatch: true }

        // This makes us responsible for handling the error. Angular will not remove the error automatically if we add it
        matchingControl.setErrors(error)
    
        return error
    }
    
}

}
