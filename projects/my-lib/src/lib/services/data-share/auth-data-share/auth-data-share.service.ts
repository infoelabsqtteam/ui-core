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
  createPwd:Subject<any> = new Subject();
  userInfo:Subject<any> = new Subject();
  sessionexpired:Subject<any> = new Subject();
  resetPass:Subject<any> = new Subject();


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
  setChangePwd(responce:any){
    this.createPwd.next(responce);
  }
  setUserInfo(responce:any){
    this.userInfo.next(responce);
  }
  setSessionExpired(responce:any){
    this.sessionexpired.next(responce);
  }
  resetPassword(responce:any){
    this.resetPass.next(responce);
  }


}
