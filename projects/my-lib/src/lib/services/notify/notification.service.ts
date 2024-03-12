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

  getModulesFromNotificationObject(obj:any){
    let utvn:any = {};
    if(obj.userId){
        utvn.userId=obj.userId;
    }
    if(obj.notifications){
        obj=obj.notifications
    
    let modules:any = [];
    if(obj && Object.keys(obj).length > 0){
      Object.keys(obj).forEach((mokey,i) => {
        let moduleObj:any = {};
        let module = obj[mokey];
        
        if(module && module.reference){
          moduleObj = module.reference;
          moduleObj.keyName=mokey;
        }
        if(module && module.notification){
          moduleObj.notification = module.notification;
        }else{
          moduleObj.notification = false;
        }
        let menuList:any = [];
        if(module && module.menus){
          let menus = module.menus;
          if(Object.keys(menus).length > 0){
            Object.keys(menus).forEach((mekey,j) => {
              let menuobj:any = {};
              let menu = menus[mekey];
              if(menu && menu.reference){
                menuobj = menu.reference;
                menuobj.keyName=mekey;
                let tabsList:any=[];
                if(menu?.templateTabs){
                  let tabs=menu.templateTabs;
                  if(Object.keys(tabs).length > 0){
                    Object.keys(tabs).forEach((tabkey,k) => {
                        let tabObj:any = {};
                        let tab = tabs[tabkey];
                        if(tab && tab.reference){
                            tabObj = tab.reference;
                            tabObj.keyName=tabkey;
                            let alerts=tab.activeAlerts;
                            if(alerts){
                                alerts.forEach((alert:any)=>{
                                    if(alert=="EMAIL"){
                                        tabObj.email=true;
                                    }
                                    if(alert=="WHATSAPP"){
                                        tabObj.whatsapp=true;
                                    }
                                    if(alert=="SMS"){
                                        tabObj.sms=true;
                                    }
                                })
                            }
                            // tabObj-{...tabObj,activeAlerts:tab?.activeAlerts}                                
                            tabsList.push(tabObj);
                        }    
                    })
                  }
                  menuobj={...menuobj,templateTabs:tabsList};
                }
              }
              let submenuList:any = [];
              if(menu && menu.submenus){
                let submenus = menu.submenus;
                if(Object.keys(submenus).length > 0){
                  Object.keys(submenus).forEach((smkey,k) => {
                    let submenuObj:any = {};
                    let submenu = submenus[smkey];
                    if(submenu && submenu.reference){
                      submenuObj = submenu.reference;
                      submenuObj.keyName=smkey;
                      let tabsList:any=[];
                      if(submenu?.templateTabs){
                        let tabs=submenu.templateTabs;
                        if(Object.keys(tabs).length > 0){
                          Object.keys(tabs).forEach((tabkey,k) => {
                              let tabObj:any = {};
                              let tab = tabs[tabkey];
                              if(tab && tab.reference){
                                  tabObj = tab.reference;
                                  tabObj.keyName=tabkey;
                                  let alerts=tab.activeAlerts;
                                    if(alerts){
                                        alerts.forEach((alert:any)=>{
                                            if(alert=="EMAIL"){
                                                tabObj.email=true;
                                            }
                                            if(alert=="WHATSAPP"){
                                                tabObj.whatsapp=true;
                                            }
                                            if(alert=="SMS"){
                                                tabObj.sms=true;
                                            }
                                        })
                                    }
                                  tabsList.push(tabObj);
                              }    
                          })
                        }
                        submenuObj={...submenuObj,templateTabs:tabsList};
                      }
                    }
                    submenuList.push(submenuObj);
                  });
                }
              }
              if(submenuList && submenuList.length > 0){
                menuobj['submenu'] = this.coreFunctionService.sortMenu(submenuList);
              }else{
                menuobj['submenu'] = null;
              }
              menuList.push(menuobj);
            })
          }
        }
        if(menuList && menuList.length > 0){
          moduleObj['menu_list'] = this.coreFunctionService.sortMenu(menuList);
        }else{
          moduleObj['menu_list'] = null;
        }
        modules.push(moduleObj);
      });
    }
    utvn['modules'] = modules;
 }
    return utvn;
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
