import { Injectable,Inject ,OnInit} from '@angular/core';
import { EnvService } from '../../env/env.service';
import { HttpClient } from '@angular/common/http';
import { StorageService } from '../../storage/storage.service';
import { StorageTokenStatus } from '../../../shared/enums/storage-token-status.enum';
import { NotificationService } from '../../notify/notification.service';
import { Router } from '@angular/router';
import { EncryptionService } from '../../encryption/encryption.service';
import { DataShareService } from '../../data-share/data-share.service';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { ApiService } from '../api.service';
import { Common } from '../../../shared/enums/common.enum';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{
  

  constructor(
    private http:HttpClient,
    private envService:EnvService,
    private dataShareService:DataShareService,
    private notificationService:NotificationService,
    private apiService:ApiService,
    private storageService:StorageService,
    private router:Router,
    private encryptionService:EncryptionService,
    private commonFunctionService:CommonFunctionService
    ) { }


  ngOnInit(){

  }
  

  Logout(payload:any){
    // let api = this.envService.getAuthApi('AUTH_SIGNOUT');
    // this.http.post(api + payload.appName, this.encryptionService.encryptRequest(payload.data)).subscribe(
    //   (respData) =>{
    //     this.resetData();
    //     this.notificationService.notify("bg-info","Log out Successful.");                
    //     this.dataShareService.restSettingModule('logged_out');
    //   },
    //   (error)=>{
    //     this.notificationService.notify("bg-danger", error.message);
    //   }
    // )
    this.resetData();
    this.logOutRedirection();
    this.notificationService.notify("bg-info","Log out Successful.");                
    this.dataShareService.restSettingModule('logged_out');
  }
  SessionExpired(payload?:any){
    // let api = this.envService.getAuthApi('AUTH_SIGNOUT');
    // this.http.post(api + payload.appName, this.encryptionService.encryptRequest(payload.data)).subscribe(
    //   (respData) =>{
    //     this.resetData();
    //     this.notificationService.notify("bg-info", "Session Expired, Kindly Login Again.");
    //     this.dataShareService.restSettingModule('logged_out');
    //   },
    //   (error)=>{
    //     this.notificationService.notify("bg-danger", error.message);
    //   }
    // )
    this.resetData();
    this.logOutRedirection();
    this.notificationService.notify("bg-info", "Session Expired, Kindly Login Again.");
    this.dataShareService.restSettingModule('logged_out');
  }
  resetData(){
    this.storageService.removeDataFormStorage();                
    this.apiService.resetMenuData();
    this.apiService.resetTempData();
    this.apiService.resetGridData();
    this.envService.setRequestType('PUBLIC');
    this.commonFunctionService.getApplicationAllSettings();
    
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
  GetUserInfoFromToken(payload:any){
    let api = this.envService.getAuthApi('GET_USER_PERMISSION');
    const reqBody = { key: payload };
    this.http.post(api, reqBody).subscribe(
      (respData:any) =>{
        if (respData && respData.user) {
          this.storageService.SetUserInfo(respData);
          this.storageService.GetUserInfo();
          this.envService.setRequestType('PRIVATE');  
          this.commonFunctionService.getApplicationAllSettings();        
          this.dataShareService.restSettingModule('logged_in');
          this.apiService.gitVersion('');
          this.commonFunctionService.getUserPrefrerence(respData.user);
          this.commonFunctionService.getUserNotification(1);
          this.redirectionWithMenuType();                                  
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
            this.notificationService.notify("bg-danger", error.message);
        } 
      }
    )
  }
  
  redirectionWithMenuType(){
    const menuType = this.storageService.GetMenuType();
    const redirectUrl = this.storageService.getRedirectUrl();
    const childWindowUrl = this.storageService.getChildWindowUrl();
    const loginRedirectUrl:any = this.storageService.getLoginRedirectUrl();
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
  TrySignin(payload:any){
    let api = this.envService.getAuthApi('AUTH_SIGNIN');
    this.http.post(api + payload.appName, this.encryptionService.encryptRequest({ username: payload.username, password: payload.password })).subscribe(
      (respData:any) =>{
        if(respData && respData['success'] && respData['success'].challengeName && respData['success'].challengeName == 'NEW_PASSWORD_REQUIRED'){
          this.storageService.setResetNewPasswordSession(respData['success'].session);
          this.router.navigate(['/resetpwd/'+payload.username]); 
        }else if (respData && respData.hasOwnProperty('success')) {
            //console.log(respData["success"].authenticationResult);
            const cognitoIdToken = respData["success"].authenticationResult.idToken;
            const cognitoRefreshToken = respData["success"].authenticationResult.refreshToken;
            const cognitoAccessToken = respData["success"].authenticationResult.accessToken;
            const cognitoExpiresIn = respData["success"].authenticationResult.expiresIn;
            this.storageService.setExpiresIn(cognitoExpiresIn);
            this.storageService.SetIdToken(cognitoIdToken);                        
            this.storageService.SetRefreshToken(cognitoRefreshToken);
            this.storageService.SetAccessToken(cognitoAccessToken);
            this.notificationService.notify("bg-success", " Login  Successful.");
            this.dataShareService.setAuthentication(true);
            this.GetUserInfoFromToken(cognitoIdToken);

        } else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                this.notificationService.notify("bg-danger", "User Not Confirmed ");
            } else if (respData["error"] == "user_name_password_does_not_match") {
                this.notificationService.notify("bg-danger", "Username password does not match ");
            }else {
              this.notificationService.notify("bg-danger", "Username password does not match ");
            }
        }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  Signin(payload:any){
    let api = this.envService.getAuthApi('AU_SIGNIN');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['token']){
            //console.log(respData["success"].authenticationResult);
            const cognitoIdToken = respData['token'];
            // const cognitoRefreshToken = respData["success"].authenticationResult.refreshToken;
            // const cognitoAccessToken = respData["success"].authenticationResult.accessToken;
            const cognitoExpiresIn = 86400;
            this.storageService.setExpiresIn(cognitoExpiresIn);
            this.storageService.SetIdToken(cognitoIdToken);                        
            //this.storageService.SetRefreshToken(cognitoRefreshToken);
            //this.storageService.SetAccessToken(cognitoAccessToken);
            this.notificationService.notify("bg-success", " Login  Successful.");
            this.dataShareService.setAuthentication(true);
            this.GetUserInfoFromToken(cognitoIdToken);

        } else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                this.notificationService.notify("bg-danger", "User Not Confirmed ");
            } else if (respData["error"] == "user_name_password_does_not_match") {
                this.notificationService.notify("bg-danger", "Username password does not match ");
            }else {
              this.notificationService.notify("bg-danger", "Username password does not match ");
            }
        }
      },
      (error)=>{
        if(error && error.status == 403){
          this.notificationService.notify("bg-danger", "Username password does not match.");
          console.log("Sign In first error handling." + JSON.stringify(error));
        }else if(error && error.error && error.error.message){
          this.notificationService.notify("bg-danger", error.error.message);
          console.log("Sign In Secong error handling." + JSON.stringify(error));
        }else{
          this.notificationService.notify("bg-danger", error.message);
          console.log("Sign In Third error handling." + JSON.stringify(error));
        }
      }
    )
  }
  TrySignup(payload:any){
    let api = this.envService.getAuthApi('AUTH_SIGNUP');
    this.http.post(api + payload.appName, this.encryptionService.encryptRequest(payload.data)).subscribe(
      (respData:any) =>{
        if(respData['error']){
          this.notificationService.notify("bg-danger", respData['error']);
        }else{
            if(Common.VERIFY_WITH_OTP){
                this.notificationService.notify("bg-success", "Otp Sent to your mobile number !!!");
                const username = payload.data.username;
                this.router.navigate(['/otp_varify/'+username]);                           
            }else{
                this.notificationService.notify("bg-success", "A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process. ");
                this.redirectToSignPage();
            }
        }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  Signup(payload:any){
    let api = this.envService.getAuthApi('AU_SIGNUP');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message'] == 'User registered successfully'){
          if(this.storageService.getVerifyType() == 'mobile'){
            // this.notificationService.notify("bg-success", "A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process. ");
            this.router.navigate(['otp_varify'+'/'+payload.userId]);
          }else{
            this.notificationService.notify("bg-success", "A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process. ");
            this.redirectToSignPage();
          }

        } else if(respData && respData['message']){
          this.notificationService.notify("bg-success", respData['message']);
        }
        // if(respData['error']){
        //   this.notificationService.notify("bg-danger", respData['error']);
        // }else{
        //     if(Common.VERIFY_WITH_OTP){
        //         this.notificationService.notify("bg-success", "Otp Sent to your mobile number !!!");
        //         const username = payload.data.username;
        //         this.router.navigate(['/otp_varify/'+username]);                           
        //     }else{
        //         this.notificationService.notify("bg-success", "A verification link has been sent to your email account. please click on the link to verify your email and continue the registration process. ");
        //         this.redirectToSignPage();
        //     }
        // }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  OtpVarify(payload:any){
    let api = this.envService.getAuthApi('OTP_VARIFICATION');
    this.http.post(api + payload.appName, this.encryptionService.encryptRequest(payload.data)).subscribe(
      (respData:any) =>{
        if(respData['success']){
          this.redirectToSignPage();
        }else if(respData['error']){
            this.notificationService.notify("bg-danger", respData['message']);
        }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  TryForgotPassword(payload:any){
    let api = this.envService.getAuthApi('AUTH_FORGET_PASSWORD');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{        
        if(respData && respData['message']){
          this.notificationService.notify("bg-success", respData['message']);
          this.dataShareService.setForgot('reset');
          //this.dataShareService.setAuthentication(true);
        }
        // if (respData && respData.hasOwnProperty('success')) {
        //   this.notificationService.notify("bg-info", "Verification Code Sent.");
        //   this.dataShareService.setAuthentication(true);
        // } else if (respData.hasOwnProperty('error')) {
        //     this.notificationService.notify("bg-danger", respData['message']);
        // }

      },
      (error)=>{
        if(error && error.error && error.error.message){
          this.notificationService.notify("bg-danger", error.error.message);
        }else{
          this.notificationService.notify("bg-danger", error.message);
        }        
      }
    )
  }
  SaveNewPassword(payload:any){
    let api = this.envService.getAuthApi('AUTH_RESET_PASSWORD');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message']){
          this.notificationService.notify("bg-success", respData['message']);          
        }
        this.redirectToSignPage();
        // if (respData && respData.hasOwnProperty('success')) {
        //     this.notificationService.notify("bg-info", "New Password changed successfully.");
        //     this.dataShareService.setAuthentication(true);
        // } else if (respData.hasOwnProperty('error')) {
        //     this.notificationService.notify("bg-danger", respData['message']);
        // }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  ResetPass(payload:any){
    let api = this.envService.getAuthApi('RESET_PASSWORD');
    this.http.post(api,this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if (respData && respData.hasOwnProperty('success')) {                        
            this.notificationService.notify("bg-success", " New Password Set  Successfully.");
            this.router.navigate(['/admin']);
        } else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                this.notificationService.notify("bg-danger", "User Not Confirmed ");
            } else if (respData["error"] == "user_name_password_does_not_match") {
                this.notificationService.notify("bg-danger", "Username password does not match ");
            }
        }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  GetAuthAppName(payload:any){
    let api = this.envService.getAuthApi('GET_AUTH_APP');
    this.http.post(api + payload.appName, this.encryptionService.encryptRequest(payload.data)).subscribe(
      (respData) =>{
        
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
      }
    )
  }
  TryVerify(payload:object){
    console.log(payload);
  }
  //function created for - change password
  changePassword(payload:object){
    let api = this.envService.getAuthApi('AUTH_CHANGE_PASSWORD')
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) => {
        if(respData && respData['message']){
          this.notificationService.notify("bg-success", respData['message']);
          this.Logout("");
        }
      //   if (data && data.hasOwnProperty('success')) {
      //     this.notificationService.notify("bg-info", "Password changed successfully.");
      //     this.router.navigate(['signin']);
      // }
      //  else if (data.hasOwnProperty('error'))
      //   {
      //     this.notificationService.notify("bg-danger", data['message']);
      //   }
        },
      (error) => {
        if(error && error.status == 403){
          this.notificationService.notify("bg-danger", "Invalid current password.");
        }else if(error && error.error && error.error.message){
          this.notificationService.notify("bg-danger", error.error.message);
        }else{
          this.notificationService.notify("bg-danger", error.message);
        }
      }
    ) 
  }
  userVarify(payload:object){
    let api = this.envService.getAuthApi('USER_VARIFY');
    this.http.post(api, this.encryptionService.encryptRequest(payload)).subscribe(
      (respData:any) =>{
        if(respData && respData['message'] == "User has been verified successfully"){
          this.notificationService.notify("bg-success", respData['message']);
          if(this.storageService.getVerifyType() == 'mobile'){
            this.router.navigate(['signin']);
          }
        }
      },
      (error)=>{
        this.notificationService.notify("bg-danger", error.message);
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

  

}
