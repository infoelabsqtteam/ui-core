import { Injectable,Inject ,OnInit} from '@angular/core';
import { EnvService } from '../env/env.service';
import { HttpClient } from '@angular/common/http';
import { CoreUtilityService } from '../core-utility/core-utility.service';
import { StorageService } from '../storage/storage.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError,switchMap } from 'rxjs/operators';
import { ExceptionsHandlingService } from '../ExceptionsHandling/exceptions-handling.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService implements OnInit{
  

  constructor(private envService:EnvService,private http: HttpClient,private coreUtilityService:CoreUtilityService,private storageService:StorageService,private exceptionsHandlingService:ExceptionsHandlingService) { }


  ngOnInit(){

  }
  logout(payload:any){
    let api;            
    api = this.coreUtilityService.baseUrl('AUTH_SIGNOUT')
    this.http.post<any>(api+payload.appName, this.coreUtilityService.encryptRequest(payload.data))
    .subscribe(data => {
      this.storageService.removeDataFormStorage();
      this.coreUtilityService.notify("bg-info","Log out Successful.");
    })
  }
  signIn1(payload:any){

    let api;            
    api = this.coreUtilityService.baseUrl('AUTH_SIGNIN')
    this.http.post<any>(api+payload.appName, this.coreUtilityService.encryptRequest(payload.data))
    .subscribe(
      (respData) => {
        if(respData && respData['success'] && respData['success'].challengeName && respData['success'].challengeName == 'NEW_PASSWORD_REQUIRED'){
          this.storageService.setResetNewPasswordSession(respData['success'].session);
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
            this.coreUtilityService.notify("bg-success", " Login  Successful.");
            
        } else if (respData.hasOwnProperty('error')) {
            if (respData["error"] == "not_confirmed") {
                this.coreUtilityService.notify("bg-danger", "User Not Confirmed ");
            } else if (respData["error"] == "user_name_password_does_not_match") {
                this.coreUtilityService.notify("bg-danger", "Username password does not match ");
            }
        }
    },
    (error) => {
      console.log(error)
    })
    
  }
  signIn(payload: any): Observable<any> {
    let api;            
    api = this.coreUtilityService.baseUrl('AUTH_SIGNIN')
    
    return this.http.post<any>(api+payload.appName, this.coreUtilityService.encryptRequest(payload.data))
      .pipe(
        map((respData:any) => {
            if(respData && respData['success'] && respData['success'].challengeName && respData['success'].challengeName == 'NEW_PASSWORD_REQUIRED'){
              this.storageService.setResetNewPasswordSession(respData['success'].session);
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
                this.coreUtilityService.notify("bg-success", " Login  Successful.");
                
            } else if (respData.hasOwnProperty('error')) {
                if (respData["error"] == "not_confirmed") {
                    this.coreUtilityService.notify("bg-danger", "User Not Confirmed ");
                } else if (respData["error"] == "user_name_password_does_not_match") {
                    this.coreUtilityService.notify("bg-danger", "Username password does not match ");
                }
            }
        }),
        catchError((err) => {
          this.exceptionsHandlingService.handleError(err)
          return throwError(err);
        })
      )
  }

  

}
