import { Component, OnInit } from '@angular/core';

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

  constructor() { }

  ngOnInit(): void {
  }

  login(){
    this.showAlert = true
  }
}
