import { Component, OnInit } from '@angular/core';
// FormGroup:
// Allows us to register a new form -> container for our forms. It helps to isolate one from another. 
// Just like in the case of tab and tab-container components
import { FormGroup, FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm = new FormGroup({ 
    name: new FormControl('',[
      Validators.required
    ]),
    email: new FormControl(''),
    age: new FormControl(''),
    password: new FormControl(''),
    confirmPassword: new FormControl(''),
    phoneNumber: new FormControl('')
   })

}
