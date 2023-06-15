import { Injectable } from '@angular/core';
import { Common } from '../../shared/enums/common.enum';
import { EndPoint } from '../../shared/enums/end-point.enum';
import { EnvService } from '../env/env.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';



@Injectable({
  providedIn: 'root'
})
export class CoreUtilityService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private envService: EnvService,
    private _snackBar: MatSnackBar
  ) { }

  baseUrl(applicationAction: string) {    
      return this.envService.getBaseUrl() +  (<any>EndPoint)[applicationAction];
  }
  publicBaseUrl(applicationAction: string) {
      return this.envService.getBaseUrl() + EndPoint.PUBLIC + (<any>EndPoint)[applicationAction];
  }
  otpApi(){
    return "https://2factor.in/API/V1/" + Common.API_KEY + "/SMS/"
  }
  verifyOtpApi(){
    return "https://2factor.in/API/V1/" + Common.API_KEY + "/SMS/VERIFY/"
  }
  encryptRequest(obj:any) {
    return btoa(JSON.stringify(obj));
  }
  notify(className:string,message:string) {    
    this._snackBar.open(message, 'Dismiss', {
      duration: 5000,
      panelClass: className,
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition
    });
  }
  isNotBlank(value:any){
    if(value && value != undefined && value != null && value != '' && JSON.stringify(value) != "{}" && JSON.stringify(value) != "[]"){
      return true;
    }else{
      return false;
    }
  }
}
