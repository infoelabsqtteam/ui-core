import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthDataShareService {
  
  signinResponse:Subject<any> = new Subject();
  authenticated:Subject<boolean> = new BehaviorSubject<boolean>(false);
  forgot:Subject<any> = new Subject<any>();
  settingData:Subject<any> = new Subject<any>();
  signUpResponse:Subject<any> = new Subject();
  otpResponse:Subject<any> = new Subject();
  OtpAutoLoginData:any = {}
  

  constructor() { }

  setSigninResponse(responce:any){
    this.signinResponse.next(responce);
  } 
  setAuthentication(responce:boolean){
    this.authenticated.next(responce);
  }
  getAuthentication(){
    return this.authenticated;
  }
  setForgot(responce:any){
    this.forgot.next(responce);
  }
  restSettingModule(value:any){
    this.settingData.next(value)
  }
  setSignUpResponse(response:any){
    this.signUpResponse.next(response);
  }
  setOtpResponse(response:any){
    this.otpResponse.next(response);
  }
  setOtpAutoLogin(response:any){
    this.OtpAutoLoginData = response
  }
  getOtpAutoLogin(){
    return this.OtpAutoLoginData;
  }


}
