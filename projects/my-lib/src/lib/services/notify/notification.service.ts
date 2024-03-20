import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
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
  

  getMenuDetails(module: any) {
    let obj: any = {};
    if (module) {
        module.forEach((menu: any) => {
            let menuName = menu?.keyName;
            let menuDetails: any = {};
            let reference: any = {
                name: menu?.name,
                _id: menu?._id
            }
            if (menu) {
                if (menu?.templateTabs) {
                    menuDetails = {
                        reference,
                        templateTabs: this.getTempDetails(menu.templateTabs)
                    }
                    obj[menuName] = menuDetails;
                } else if (menu?.submenu) {
                    menuDetails = {
                        reference,
                        submenus: this.getMenuDetails(menu.submenu)
                    }
                  obj[menuName] = menuDetails;
                }
            }
        })

        return obj;
    }
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
