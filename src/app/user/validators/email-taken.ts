import { AngularFireAuth } from "@angular/fire/compat/auth";
import { Injectable } from "@angular/core";
import { AbstractControl, AsyncValidator, ValidationErrors } from "@angular/forms";

// This decorator allows us to inject services into the constructor function
// This is needed because by default classes cannot be injected with services
// Same for directives, plain js class -> need to tell Angular we need dependency injection support
// Components are supported by default
// It also makes it possible to inject this class to other classes
// The decorator allows to inject the class with services. ->
// However, an issue arises when we want to inject this class to components. Angular doesnt assume it can be injected to our app
// We must explicitly tell that the class can be injected to other areas in the app -> use 'providedIn'
@Injectable({
    providedIn:'root'
})
export class EmailTaken implements AsyncValidator{
    constructor(private auth: AngularFireAuth){}
    // Has to be an arrow function to avoid context issues
    validate = async (control: AbstractControl): Promise<ValidationErrors | null> =>  {
        const response = await this.auth.fetchSignInMethodsForEmail(control.value);
        return response.length ? { emailTaken: true } : null;
    }
}
