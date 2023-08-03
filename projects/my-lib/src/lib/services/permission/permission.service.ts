import { Injectable } from '@angular/core';
import { AuthService } from '../api/auth/auth.service';
import { NotificationService } from '../notify/notification.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  permission:any;

  constructor(
    private storageService:StorageService,
    private authService:AuthService,
    private notificationService:NotificationService
    ) {
      this.permission = this.storageService.GetPermission();
     }

  checkPermission(template:string,option:string){
    this.permission = this.storageService.GetPermission();
    if(this.permission && this.permission != null && this.permission != undefined){
      return this.checkList(template,option);
    }else{
      return this.checkList(template,option);
    }
  }
  checkList(template:string,option:string){
    if(this.permission[template]){
      let permissionList = this.permission[template]
      return this.check(permissionList,option);
    }else{
      return false;
    }
  }
  check(list:any,actionName:string){
    let check = false;
    if(list && list.length > 0){
      let action:string = '';
      if(actionName == 'auditHistory'){
        action = 'AUDIT_HISTORY';
      }else{
        action = actionName.toUpperCase();
      }
      for (let i = 0; i < list.length; i++) {
        const permission = list[i];
        if(permission == action){
          check = true;
          break;
        }
      }
    }else{
      check = false;
    }
    return check;
  }
  checkTokenStatusForPermission(){
    let getTokenStatus = this.authService.checkIdTokenStatus()
    if(getTokenStatus.status){
      this.notificationService.notify("bg-danger", "Permission denied !!!");
    }else{
      if(getTokenStatus.msg != ""){
        this.notificationService.notify("bg-info", getTokenStatus.msg);
      }
      this.authService.gotToSigninPage();
    }
  }
}
