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
                menuobj['submenu'] = this.sortMenu(submenuList);
              }else{
                menuobj['submenu'] = null;
              }
              menuList.push(menuobj);
            })
          }
        }
        if(menuList && menuList.length > 0){
          moduleObj['menu_list'] = this.sortMenu(menuList);
        }else{
          moduleObj['menu_list'] = null;
        }
        modules.push(moduleObj);
      });
    }
    let modifiedModules = this.setDefaultIndex(modules);
    utvn['modules'] = this.sortMenu(modifiedModules)
    console.log(  );
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
          if(tkey in permissionList){
            if(tab && tab.access){
              let oldPermissoin:Array<string> = permissionList[tkey];
              let newPermission = tab.access;
              if(newPermission && newPermission.length > 0){
                newPermission.forEach((permission:string) => {
                  if(!oldPermissoin.includes(permission)){
                    oldPermissoin.push(permission);
                  }
                });
              }
              permissionList[tkey] = oldPermissoin;
            }
          }else{
            if(tab && tab.access){
              permissionList[tkey] = tab.access;
            }
          }
        });
      }
    }
  }
  setDefaultIndex(modules:any){
    modules.forEach((module:any) => {
      if(!module?.index){
        module["index"] = 0;
      }
    })
    return modules;
  }
  sortMenu(menuList:any){
    let list:any=[];
    let mlist = menuList.sort((a:any,b:any) =>  a.index - b.index);
    if(mlist && mlist.length > 0){
      mlist.forEach((m:any) => {
        list.push(m);
      });
    }
    return list;
  }
  convertListToColonString(list:any,type:any,key?:string){
    let value = "";
    if(type.toLowerCase() == 'text'){
      if(list && list.length > 0){
        for (let index = 0; index < list.length; index++) {
          const str = list[index];
          if((index + 1) == list.length){
            value = value + str;
          }else{
            value = value  + str +':';
          }
        }
      }
    }
    return value;
  }
  prepareTemplate(tempList:any,moduleName:string){
    let preParedList:any = {};
    if(tempList && tempList.length > 0){
      tempList.forEach((temp:any) => {
        let name = moduleName+"_"+temp.name;
        preParedList[name] = temp;
      });
    }
    return preParedList;
  }
  getTempNameFromPayload(payload:any){
    let value = '';
    if(Object.keys(payload).length > 0){
      let crList = payload['crList'];
      if(crList && crList.length > 0){
        let criteria = crList[0];
        value = criteria['fValue'];
      }
    }
    return value;
  }
  getJsonSizeInKilobyte(obj:any){
    const bytes = new TextEncoder().encode(JSON.stringify(obj)).length;
    const kiloBytes = (bytes / 1024).toFixed(2);
    //const megaBytes = kiloBytes / 1024;
    return Number(kiloBytes);
  }
  removeSpaceFromString(str:string){
    if(str && typeof str == "string"){
      return str.trim();
    }else{
      return str;
    }
  }
  checkBlankProperties(data:any) {
    const objWithoutNull:any = {...data};
    Object.keys(objWithoutNull).forEach(key => {
      if (objWithoutNull[key] === "") {
        objWithoutNull[key] = null;
      }
    });
    return objWithoutNull;
  }
}
