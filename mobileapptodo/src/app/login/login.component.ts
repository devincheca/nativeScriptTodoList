import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Router, ActivatedRoute } from "@angular/router";
import reqService from '../services/reqService';
const appSettings = require("tns-core-modules/application-settings");
let req = new reqService();
@Component({
  selector: 'ns-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  moduleId: module.id,
})
export class LoginComponent implements OnInit {
  constructor(private router: Router) { }
  
  @Output() loginTrigger = new EventEmitter<string>(); 
  
  code:number = 0;
  errorMessage:string = '';
  phoneNumber:number = 0;
  phoneNumberMessage:string = ''; 
  spinner:boolean = false;
  
  imageSrc() { return 'https://www.todo-manager.com/logo/180.png'; }
  
  login():void
  {
    this.spinner = true;
    req.req('users/validateCode',
    {
      code: this.code,
      phoneNumber: this.phoneNumber
    })
    .then((res) =>
    {
      this.spinner = false;
      if (res.res === "success")
      {
        this.router.navigate(['../main/' + res.token]);
        appSettings.setString('token', res.token);
      }
      else { this.phoneNumberMessage = 'Something went wrong'; }
    })
    .catch((error) => { console.trace(error); });
  }

  onCodeInput(event):void { this.code = event.object.text; }
  
  onPhoneNumberInput(event):void { this.phoneNumber = event.object.text; }
      
  sendCode():void
  {
    this.spinner = true;
    req.req('users/login', { phoneNumber: this.phoneNumber })
    .then((res) =>
    {
      this.spinner = false;
      if (res.res === "code sent")
      {
        this.phoneNumberMessage = 'Code sent to ' + this.phoneNumber;
      }
      else { this.phoneNumberMessage = 'Something went wrong'; }
    })
    .catch((error) => { console.trace(error); });
  } 
  
  ngOnInit()
  {
  }
}