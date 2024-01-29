import { ApiCallService } from './../../api/api-call/api-call.service';
import { Injectable,OnInit} from '@angular/core';
import { EnvService } from '../../env/env.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../storage/storage.service';
import { StorageTokenStatus } from '../../../shared/enums/storage-token-status.enum';
import { Router } from '@angular/router';
import { EncryptionService } from '../../encryption/encryption.service';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { ApiService } from '../api.service';
import { CoreFunctionService } from '../../common-utils/core-function/core-function.service';
import { AuthDataShareService } from '../../data-share/auth-data-share/auth-data-share.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{


  constructor(
    private http:HttpClient,
    private envService:EnvService,
    private apiService:ApiService,
    private storageService:StorageService,
    private router:Router,
    private encryptionService:EncryptionService,
    private commonFunctionService:CommonFunctionService,
    private coreFunctionService:CoreFunctionService,
    private authDataShareService: AuthDataShareService,
    private apiCallService:ApiCallService
    ) { }


  ngOnInit(){

  }

  Logout(payload:any){
    this.resetData();
    this.logOutRedirection();
    this.authDataShareService.restSettingModule('logged_out');
  }
  SessionExpired(payload?:any){
    let response = {
      status: '',
      class: '',
      msg: ''
    };
    this.resetData();
    this.logOutRedirection();
    response.class = "bg-info";
    response.status = "success";
    response.msg = "Session Expired, Kindly Login Again.";
    this.authDataShareService.setSessionExpired(response);
    if(this.storageService.checkPlatForm() != 'mobile'){
      this.authDataShareService.restSettingModule('logged_out');
    }
  }
  resetData(){
    this.storageService.removeDataFormStorage();
    this.apiService.resetMenuData();
    this.apiService.resetTempData();
    this.apiService.resetGridData();
    this.envService.setRequestType('PUBLIC');
    this.apiCallService.getApplicationAllSettings();
  }
  logOutRedirection(){
    if (this.envService.checkRedirectionUrl()) {
      window.location.href = this.envService.checkRedirectionUrl();
    }else{
      this.redirectToSignPage();
    }
  }
  gotToSigninPage(){
    this.resetData()
    this.redirectToSignPage();
  }

  GetUserInfoFromToken(payload:any, loginRedirect?:string){
    let response = {
      status: '',
      class: '',
      msg: ''
    };
    let api = "";
    let reqBody = {};
    if(payload && payload.roleName && payload.roleName != ''){
      api = this.envService.getAuthApi('GET_USER_PERMISSION')+"/"+payload.roleName;
      reqBody = { key: payload.token };
    }else{
      api = this.envService.getAuthApi('GET_USER_PERMISSION')+"/"+null;
      reqBody = { key: payload };
    }

    this.http.post(api, reqBody).subscribe(
      (respData:any) =>{
        if (respData && respData.user) {
          let modifyData = this.coreFunctionService.getModulesFromMapObject(respData);
          this.storageService.SetUserInfo(modifyData);
          this.storageService.GetUserInfo();
          this.envService.setRequestType('PRIVATE');
          this.apiCallService.getApplicationAllSettings();
          this.authDataShareService.restSettingModule('logged_in');
          this.apiService.gitVersion('');
          this.apiCallService.getUserPrefrerence(respData.user);
          this.apiCallService.getUserNotification(1);
          this.redirectionWithMenuType(loginRedirect);
          response.status = "success";
          this.authDataShareService.setUserInfo(response);
        } else {
            this.envService.setRequestType('PUBLIC');
            this.redirectToSignPage();
        }
      },
      (error)=>{
        if(error.status == 403){
          this.envService.setRequestType('PUBLIC');
          this.redirectToSignPage();
        }else{
          if(error && error.status == 403){
            response.msg = 'Username password does not match.';
          }else if(error && error.error && error.error.message){
            response.msg = error.error.message;
          }else{
            response.msg = error.message;
          }
          response.status = 'error';
          response.class = 'bg-danger';
          this.authDataShareService.setUserInfo(response);
        }
      }
    )
  }
  redirectionWithMenuType(loginRedirectUrl?:string){
    const menuType = this.storageService.GetMenuType();
    const redirectUrl = this.storageService.getRedirectUrl();
    const childWindowUrl = this.storageService.getChildWindowUrl();
    let route = '/dashboard';
    if(menuType == 'Horizontal'){
      route = '/home';
    }
    if(redirectUrl && redirectUrl != '' && redirectUrl != '/'){
      route = redirectUrl;
    }else if(childWindowUrl && childWindowUrl != '' && childWindowUrl != '/'){
      route = childWindowUrl;
    }else if(loginRedirectUrl && loginRedirectUrl != '' && loginRedirectUrl != '/'){
      route = loginRedirectUrl;
    }
    this.router.navigate([route]);
  }
  redirectToSignPage(){
    this.router.navigate(['/signin']);
  }
  Signin(payload:any){
    let response = {
      status: '',
      class: '',
      msg: '',
      message:''
    };
    let api = this.envService.getAuthApi('AU_SIGNIN');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['token']){
            const cognitoIdToken = respData['token'];
            const cognitoExpiresIn = 86400;
            // const cognitoExpiresIn = 420;
            this.storageService.setExpiresIn(cognitoExpiresIn);
            this.storageService.SetIdToken(cognitoIdToken);
            response.status = 'success';
            response.class = 'bg-success';
            response.msg = 'Login  Successful.';
            if(respData['message']){
              response.message = respData['message'];
            }
            this.authDataShareService.setAuthentication(true);
        } else if(respData && respData['message']){
          response.status = 'error';
          response.class = 'bg-danger';
          response.msg = respData['message'];
        }else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                response.msg = 'User Not Confirmed ';
            } else if (respData["error"] == "user_name_password_does_not_match") {
                response.msg = 'Username password does not match ';
            }else {
              response.msg = 'Username password does not match ';
            }
            response.status = 'error';
            response.class = 'bg-danger';
        }
        this.authDataShareService.setSigninResponse(response);
      },
      (error)=>{
        if(error && error.status == 403){
          console.log("Sign In first error handling." + JSON.stringify(error));
          response.msg = 'Username password does not match.';
        }else if(error && error.error && error.error.message){
          console.log("Sign In Secong error handling." + JSON.stringify(error));
          response.msg = error.error.message;
        }else{
          console.log("Sign In Third error handling." + JSON.stringify(error));
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';

        this.authDataShareService.setSigninResponse(response);
      }
    )
  }
  Signup(payload:any){
    let response = {
      status: '',
      class: '',
      msg: '',
      appPresentAlert: false,
      autoLogin:false,
      payload: {}
    };
    let newPayload :any = '';
    let isHybridPlatform = false;
    if(this.storageService.checkPlatForm() == 'mobile'){
      isHybridPlatform = true;
      newPayload = payload.data;
    }else{
      newPayload = payload;
    }
    let api = this.envService.getAuthApi('AU_SIGNUP');
    this.http.post(api, this.encryptionService.encryptRequest(newPayload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message'] == 'User registered successfully'){
          if(payload.autologin && isHybridPlatform){
            response.msg = 'Successfully Registered.';
            response.autoLogin = payload.autologin;
            response.payload = { userId: newPayload.userId, password: newPayload.password };
            // this.Signin(appPayload);
          }else{
            if(this.envService.getVerifyType() == 'mobile'){
                response.msg = 'OTP has been sent to your registered Mobile no.';
                response.payload = { userId: newPayload.userId, password: newPayload.password };
                if(isHybridPlatform){
                  response.appPresentAlert = true;
                  // this.router.navigate([payload.redirection +'/'+payload.data.userId]);
                }else{
                  // this.router.navigate(['otp_varify'+'/'+payload.userId]);
                }
            }else{
              if(newPayload.admin){
                response.msg = 'A verification link has been sent to your email account. If not received, please connect to admin to verify your email.';
              }else{
                response.msg = 'A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process.';
              }
              response.appPresentAlert = true;
            }
          }
        } else if(respData && respData['message']){
          response.msg = respData['message'];
        }
        response.status = 'success';
        response.class = 'bg-success';
        this.authDataShareService.setSignUpResponse(response);
      },
      (error)=>{
        if(error && error.error && error.error.message){
          console.log("Sign In Secong error handling." + JSON.stringify(error));
          response.msg = error.error.message;
        }else{
          console.log("Sign In Third error handling." + JSON.stringify(error));
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.setSignUpResponse(response);
      }
    )
  }
  TryForgotPassword(payload:any){
    let response = {
      status: '',
      class: '',
      msg: ''
    };
    let api = this.envService.getAuthApi('AUTH_FORGET_PASSWORD');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message']){
          response.status = 'success';
          response.class = 'bg-success';
          response.msg = respData['message'];
        }
        this.authDataShareService.setForgot(response);
      },
      (error)=>{
        if(error && error.error && error.error.message){
          response.msg = error.error.message;
        }else{
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.setForgot(response);
      }
    )
  }
  SaveNewPassword(payload:any){
    let response = {
      status: '',
      class: '',
      msg: ''
    };
    let api = this.envService.getAuthApi('AUTH_RESET_PASSWORD');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message']){
          response.status = 'success';
          response.class = 'bg-success';
          response.msg = respData['message'];
        }
        this.authDataShareService.resetPassword(response);
      },
      (error)=>{
        if(error && error.error && error.error.message){
          response.msg = error.error.message;
        }else{
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.resetPassword(response);
      }
    )
  }
  ResetPass(payload:any){
    let api = this.envService.getAuthApi('RESET_PASSWORD');
    this.http.post(api,this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if (respData && respData.hasOwnProperty('success')) {
            // this.notificationService.notify("bg-success", " New Password Set  Successfully.");
            this.router.navigate(['/admin']);
        } else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                // this.notificationService.notify("bg-danger", "User Not Confirmed ");
            } else if (respData["error"] == "user_name_password_does_not_match") {
                // this.notificationService.notify("bg-danger", "Username password does not match ");
            }
        }
      },
      (error)=>{
        // this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  TryVerify(payload:object){
    console.log(payload);
  }
  changePassword(payload:any){
    let response = {
      status: '',
      class: '',
      msg: ''
    };
    let api = this.envService.getAuthApi('AUTH_CHANGE_PASSWORD')
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) => {
        if(respData && respData['message']){
          response.status = 'success';
          response.class = 'bg-success';
          response.msg = respData['message'];
        }
        this.authDataShareService.setChangePwd(response);
      },
      (error) => {
        if(error && error.status == 403){
          response.msg = "Invalid current password.";
        }else if(error && error.error && error.error.message){
          response.msg =  error.error.message;
        }else{
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.setChangePwd(response);
      }
    )
  }
  userVarify(payload:any){
    let response = {
      status: '',
      class: '',
      msg: '',
      autoLogin:false,
    };
    let newPayload :any = '';
    let isHybridPlatform = false;
    if(this.storageService.checkPlatForm() == 'mobile'){
      isHybridPlatform = true;
      newPayload = payload.data;
    }else{
      newPayload = payload;
    }
    let api = this.envService.getAuthApi('USER_VARIFY');
    this.http.post(api, this.encryptionService.encryptRequest(newPayload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message'] == "User has been verified successfully"){
          response.msg = respData['message'];
          if(payload.autologin){
            response.autoLogin = payload.autologin;
          }
          // if(this.storageService.getVerifyType() == 'mobile'){
          // }
        }else if(respData && respData['message']){
          response.msg = respData['message'];
        }
        response.status = 'success';
        response.class = 'bg-success';
        this.authDataShareService.setOtpResponse(response);
      },
      (error)=>{
        if(error && error.error && error.error.message){
          response.msg = error.error.message;
        }else{
          response.msg = error.message;
        }
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.setOtpResponse(response);
      }
    )
  }
  checkIdTokenStatus(){
    let statusWithMsg={
      "status":false,
      "msg" : ""
    };
    if (this.storageService != null && this.storageService.GetIdToken() != null) {
      if(this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE){
        statusWithMsg.status = true;
      }else{
        statusWithMsg.status = false;
          this.SessionExpired();
      }
    }else{
      statusWithMsg.status=false;
      statusWithMsg.msg="Your are already logout !!!";
    }
    return statusWithMsg;
  }
  checkApplicationSetting(){
    let exists = false;
    let applicationSetting = this.storageService.getApplicationSetting();
    if(applicationSetting){
      exists = true;
    }else{
      exists = false;
    }
    return exists;
  }

  authenticateUser(payload:any){
    let response = {
      status: '',
      class: '',
      msg: '',
      message:''
    };
    let api = this.envService.getAuthApi('TWO_FACTOR_AUTHENTICATION');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['token']){
            const cognitoIdToken = respData['token'];
            const cognitoExpiresIn = 86400;
            this.storageService.setExpiresIn(cognitoExpiresIn);
            this.storageService.SetIdToken(cognitoIdToken);
            response.status = 'success';
            response.class = 'bg-success';
            response.msg = 'Login  Successful.';
            if(respData['message']){
              response.message = respData['message'];
            }
            this.authDataShareService.setAuthentication(true);
            this.authDataShareService.setAuthenticationResponce(response);
        }
      },
      (error)=>{
        response.msg = error.message;
        response.status = 'error';
        response.class = 'bg-danger';
        this.authDataShareService.setAuthenticationResponce(response);
      }
    )
  }
}
