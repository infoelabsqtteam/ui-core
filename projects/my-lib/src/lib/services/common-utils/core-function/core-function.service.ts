import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoreFunctionService {
  commonOperators:any={
    eq :"EQUAL",
    in : "IN",
    neq : "NOT_EQUAL",
    // stwic : "STARTS_WITH_IGNORE_CASE",
    cnts : "CONTAINS"
  };

  constructor() { }
  isNotBlank(value:any){
    if(value && value != undefined && value != null && value != '' && JSON.stringify(value) != "{}" && JSON.stringify(value) != "[]"){
      return true;
    }else{
      return false;
    }
  }
  getModulesFromMapObject(obj:any){
    let user = obj.user;
    let permissions = obj.permission;
    let rollList = obj.rollList;
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
    let modifiedModules = this.setDefaultIndexForModules(modules);
    utvn['modules'] = this.sortMenu(modifiedModules)
    utvn['permission'] = permissionList;
    utvn['user'] = user;
    utvn['rollList'] = rollList;
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
  setDefaultIndexForModules(modules:any){
    if(modules?.length>0){
      let maxIndex = modules.length
      modules.forEach((module:any) => {
        if(!module?.index){
        module["index"] = maxIndex;
        }
      })
    }
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
  getOperators(type:string){
    let operatorList = {...this.commonOperators};
    switch (type){
      case "date":
        operatorList['cntsic'] = 'CONTAINS_IGNORE_CASE';
        operatorList['lt'] = 'LESS_THAN';
        operatorList['lte'] = "LESS_THAN_EQUAL";
        operatorList['gt'] = 'GREATER_THAN';
        operatorList['gte'] = 'GREATER_THAN_EQUAL';
        break;
      case "number":
        operatorList['lt'] = 'LESS_THAN';
        operatorList['lte'] = "LESS_THAN_EQUAL";
        operatorList['gt'] = 'GREATER_THAN';
        operatorList['gte'] = 'GREATER_THAN_EQUAL';
        break;
      case "string":
        operatorList['stw'] = "STARTS_WITH";
        operatorList['stwic'] = "STARTS_WITH_IGNORE_CASE";
        operatorList['edw'] = 'ENDS_WITH';
        operatorList['edwic'] = 'ENDS_WITH_IGNORE_CASE';
        operatorList['cntsic'] = 'CONTAINS_IGNORE_CASE';
        operatorList['ncnts'] = 'NOT_CONTAINS';
        operatorList['ncntsic'] = 'NOT_CONTAINS_IGNORE_CASE';
        break;
      default:
        break;
    }
    return this.sortOperators(operatorList);
  }

  sortOperators(operatorList:any){
    const sortedKeys = Object.keys(operatorList).sort();
     const sortedOperatorList:any = {};
     sortedKeys.forEach(key => {
         sortedOperatorList[key] = operatorList[key];
     });

     return sortedOperatorList;
  }
}
