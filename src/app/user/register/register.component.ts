import { Component, OnInit } from '@angular/core';
// FormGroup:
// Allows us to register a new form -> container for our forms. It helps to isolate one from another. 
// Just like in the case of tab and tab-container components
import { FormGroup, FormControl, Validators} from '@angular/forms';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {

  constructor(
    private auth: AngularFireAuth,
    private db: AngularFirestore
    ) {}

  inSubmission = false

  name = new FormControl('',[
    Validators.required,
    Validators.minLength(3)
  ])
  email = new FormControl('',[
    Validators.required,
    Validators.email
  ])
  age = new FormControl('',[
    Validators.required,
    Validators.min(18),
    Validators.max(120)
  ])
  password = new FormControl('',[
    Validators.required,
    Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/gm)
  ])
  confirmPassword = new FormControl('',[
    Validators.required
  ])
  phoneNumber = new FormControl('',[
    Validators.required
  ])

  registerForm = new FormGroup({ 
    name: this.name,
    email: this.email,
    age: this.age,
    password: this.password,
    confirmPassword: this.confirmPassword,
    phoneNumber: this.phoneNumber
   })

   async register(){
     this.inSubmission = true
     this.showAlert = true
     this.alertMsg = "Please wait! Your account is being created"
     this.alertColor = 'blue'

     const { email, password } = this.registerForm.value

     try{
      const userCred = await this.auth.createUserWithEmailAndPassword(
        email, password
       )

       await this.db.collection('users').add({
         name: this.name.value,
         email: this.email.value,
         age: this.age.value,
         phoneNumber: this.phoneNumber.value
       })
       
     } catch(e){
       console.error(e)

       this.alertMsg = "An unexpected color occured. Please try again!"
       this.alertColor = 'red'
       this.inSubmission = false
       return
     }

     this.alertMsg = "Success! Your account has been created."
     this.alertColor = 'green'

   }

   showAlert = false
   alertMsg = 'Please wait! Your account is being created'
   alertColor = 'blue'

}
