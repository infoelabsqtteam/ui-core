import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
    private coreFunctionService: CoreFunctionService,
  ) { }


  notify(className:string,message:string) { 
    if(className !=null && message !=null){
      this._snackBar.open(message, 'Dismiss', {
        duration: 5000,
        panelClass: className,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition
      });
    }
  }

  //notification setting

  saveNotification(allModuleList:any){
    let obj:any={}
    allModuleList.forEach((module:any)=>{
      if(module && module.name && module.notification && module.keyName){
        let name=module.keyName;
        let mod={
            reference:{
              name:module.name,
              _id:module._id
            },
            menus:this.getMenuDetails(module?.menu_list),
            notification:module.notification
        }
        obj[name]=mod
      }
    })
    return obj;
  }
  
  getMenuDetails(module:any){
    let obj:any={};
    if(module){
     module.forEach((menu:any)=>{
      if(menu && menu.templateTabs){
        let menuName=menu.keyName;
        let menuDetails={
          reference:{
            name:menu.name,
            _id:menu._id
          },
          templateTabs:this.getTempDetails(menu.templateTabs)
        }
        obj[menuName]=menuDetails;
      }
      else if(menu.submenu){
        let menuName=menu.name;
        let menuDetails={
          reference:{
            name:menu.name,
            _id:menu._id
          },
          submenus:this.getMenuDetails(menu.submenu)
        }
        obj[menuName]=menuDetails;
      }
    })
  }
    return obj;

  }

  getTempDetails(tabs:any){
    let obj:any={};
    tabs.forEach((tab:any)=>{
      if(tab){
        let tabName=tab.keyName;
        let tabDetails={
          reference:{
            name:tab.name,
            _id:tab._id
          },
          activeAlerts:this.getActiveAlerts(tab)
        }
        obj[tabName]=tabDetails;
      }
    })
    return obj;
  }

  getActiveAlerts(tab:any){
    let arr=[];
    if(tab?.email){
      arr.push('EMAIL');
    }
    if(tab?.whatsapp){
      arr.push('WHATSAPP');
    }
    if(tab?.sms){
      arr.push('SMS');
    }
    return arr;
  }

}
