import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoreFunctionService {

  constructor() { }
  isNotBlank(value:any){
    if(value && value != undefined && value != null && value != '' && JSON.stringify(value) != "{}" && JSON.stringify(value) != "[]"){
      return true;
    }else{
      return false;
    }
  }
  getModulesFormMapObject(obj:any){
    let user = obj.user;
    let permissions = obj.permission;
    let utvn:any = {};
    let modules:any = [];
    let permissionList = {};
    if(permissions && Object.keys(permissions).length > 0){
      Object.keys(permissions).forEach((mokey,i) => {
        let moduleObj:any = {};
        let module = permissions[mokey];
        if(module && module.details){
          moduleObj = module.details;
        }
        let menuList:any = []; 
        if(module && module.menuMap){
          let menuMap = module.menuMap;
          if(Object.keys(menuMap).length > 0){
            Object.keys(menuMap).forEach((mekey,j) => {
              let menuobj:any = {};
              let menu = menuMap[mekey];
              if(menu && menu.details){
                menuobj = menu.details;
              }
              let submenuList:any = [];
              if(menu && menu.submenuMap){
                let submenuMap = menu.submenuMap;
                if(Object.keys(submenuMap).length > 0){
                  Object.keys(submenuMap).forEach((smkey,k) => {
                    let submenuObj:any = {};
                    let submenu = submenuMap[smkey];
                    if(submenu && submenu.details){
                      submenuObj = submenu.details;
                    }
                    this.setTabOrPermission(submenu,permissionList);                    
                    submenuList.push(submenuObj);                    
                  });
                }
              }else{
                this.setTabOrPermission(menu,permissionList);                
              }
              if(submenuList && submenuList.length > 0){
                menuobj['submenu'] = submenuList;
              }else{
                menuobj['submenu'] = null;
              }
              menuList.push(menuobj);
            })
          }          
        }
        if(menuList && menuList.length > 0){
          moduleObj['menu_list'] = menuList;
        }else{
          moduleObj['menu_list'] = null;
        }
        modules.push(moduleObj);
      });
    }
    utvn['modules'] = modules;
    utvn['permission'] = permissionList;
    utvn['user'] = user;
    return utvn;
  }
  setTabOrPermission(menu:any,permissionList:any){
    if(menu && menu.templateTabMap){
      let tabsMap = menu.templateTabMap;
      if(Object.keys(tabsMap).length > 0){
        Object.keys(tabsMap).forEach((tkey,l) => {
          let tab = tabsMap[tkey];          
          if(tab && tab.access){
            permissionList[tkey] = tab.access;
          }
        });
      }
    }
  }
}
