import { Component, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  credentials = {
    email: "",
    password: ""
  }

  showAlert = false
  alertMsg = 'Please wait! Your are being logged in'
  alertColor = 'green'
  inSubmission = false;

  constructor(
    private auth: AngularFireAuth
  ) { }

  ngOnInit(): void {
  }

  async login(){
    this.alertMsg = 'Please wait! Your are being logged in'
    this.alertColor = 'green'
    try{
      this.showAlert = true
      this.inSubmission = true;
      await this.auth.signInWithEmailAndPassword(
        this.credentials.email,this.credentials.password
      )
    }catch(e){
        this.showAlert = true;
        this.alertMsg = "Login failed!"
        this.alertColor = "red"
        return
    }
    this.alertMsg = "Login is successful!"
    this.alertColor = "blue"
  }
}
