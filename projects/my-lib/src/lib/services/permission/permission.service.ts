import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  permission:any;

  constructor(private storageService:StorageService) { }

  checkPermission(template:string,option:string){ 
    const userPermission = this.storageService.GetPermission();
    if(userPermission && userPermission != null && userPermission != undefined && userPermission[template]){
      this.permission = userPermission[template][option];
    }else{
      this.permission = false;
    }
    return this.permission;
  }
}
