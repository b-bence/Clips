import { Component, OnInit } from '@angular/core';
// Allows us to register a new form -> container for our forms. It helps to isolate one from another. 
// Just like in the case of tab and tab-container components
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  registerForm = new FormGroup({ })

}
