import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../api/api.service';
import { CommonFunctionService } from '../common-utils/common-function.service';
import { DataShareService } from '../data-share/data-share.service';
import { PermissionService } from '../permission/permission.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class MenuOrModuleCommonService {

constructor(
  private storageService: StorageService,
  private permissionService:PermissionService,
  private commonFunctionService:CommonFunctionService,
  private dataShareService:DataShareService,
  private apiService:ApiService,
  private router:Router
) { }

  // modifyModuleListWithPermission(moduleList:any){
  //   let modifyModuleList:any = [];
  //   if(moduleList && moduleList.length > 0){
  //     moduleList.forEach((module:any) => {
  //       if(module && module.menu_list && module.menu_list.length > 0){
  //         let menuList = module.menu_list;
  //         module.menu_list = this.setDisplayInMenuWithPermission(menuList);
  //         if(this.setDisplayInModuleWithPermission(module.menu_list)){
  //           module['display'] = true;
  //         }else{
  //           module['display'] = false;
  //         }
  //         modifyModuleList.push(module);
  //       }else{
  //         modifyModuleList.push(module);
  //       }
  //     });
  //   }
  //   return modifyModuleList;
  // }
  getDefaultMenuIndex(menuList:any){
    let defaultmenuIndex = 0;
    let defaultSubmenuIndex = -1;
    let defaultIndexs = {
      'defaultmenuIndex':defaultmenuIndex,
      'defaultSubmenuIndex' :defaultSubmenuIndex
    };
    if(menuList && menuList.length > 0){
      defaultmenuIndex = this.getDefaultIndex(menuList)
      const defaultMenu =menuList[defaultmenuIndex];
      if(defaultMenu.submenu && defaultMenu.submenu.length > 0){
        defaultSubmenuIndex = this.getDefaultIndex(defaultMenu.submenu);
        if(defaultSubmenuIndex == -1){
          defaultSubmenuIndex = 0;
        }
      }
    }
    defaultIndexs.defaultmenuIndex = defaultmenuIndex;
    defaultIndexs.defaultSubmenuIndex = defaultSubmenuIndex;
    return defaultIndexs;
  }
  getDefaultIndex(menuList:any){
    let defaultmenuIndex = 0;
    if(menuList && menuList.length > 0){
      for (let index = 0; index <  menuList.length; index++) {
        if(menuList[index].defaultMenu){
          defaultmenuIndex = index;
          break;
        }
      }
    }
    return defaultmenuIndex;
  }
  // setDisplayInMenuWithPermission(menuList:any){
  //   let modifyMenuList = [];
  //   if(menuList && menuList.length > 0){
  //       for (let index = 0; index < menuList.length; index++) {
  //           const menu = menuList[index];
  //           if(menu.submenu && menu.submenu != null){
  //               let modifySubMenuList = [];
  //               let check = 0;
  //               for (let j = 0; j < menu.submenu.length; j++) {
  //                   const submenu = menu.submenu[j];
  //                   if(!this.checkPermission(submenu)){
  //                       submenu['display'] = true;
  //                       modifySubMenuList.push(submenu);
  //                       check = 1;
  //                   }else{
  //                       submenu['display'] = false;
  //                       modifySubMenuList.push(submenu);
  //                   }
  //               }
  //               if(check == 1){
  //                   menu['display'] = true;
  //               }else{
  //                   menu['display'] = false;
  //               }
  //               menu.submenu = modifySubMenuList;
  //               modifyMenuList.push(menu);
  //           }else{
  //               if(!this.checkPermission(menu)){
  //                   menu['display'] = true;
  //                   modifyMenuList.push(menu);
  //               }else{
  //                   menu['display'] = false;
  //                   modifyMenuList.push(menu);
  //               }
  //           }
  //       }
  //   }
  //   return modifyMenuList;
  // }
  // setDisplayInModuleWithPermission(menuList:any){
  //   let check = false;
  //   if(menuList && menuList.length > 0){
  //     for (let index = 0; index < menuList.length; index++) {
  //       const menu = menuList[index];
  //       if(menu.submenu && menu.submenu != null){
  //         for (let j = 0; j < menu.submenu.length; j++) {
  //           const submenu = menu.submenu[j];
  //           if(submenu.display){
  //             check = true;
  //             break;
  //           }
  //         }
  //       }else{
  //         if(menu.display){
  //           check = true;
  //           break;
  //         }
  //       }
  //     }
  //   }
  //   return check;
  // }
  getDefaultMenu(menuList:any){
      let menu:any = {};
      let defaultMenu:any = {};
      let defaultMenuIndexs = this.getDefaultMenuIndex(menuList);
      menu['indexs'] = defaultMenuIndexs;
      if(defaultMenuIndexs.defaultSubmenuIndex > -1){
          defaultMenu = menuList[defaultMenuIndexs.defaultmenuIndex].submenu[defaultMenuIndexs.defaultSubmenuIndex];
      }else{
          defaultMenu = menuList[defaultMenuIndexs.defaultmenuIndex];
      }
      menu['menu'] = defaultMenu;
      // if(defaultMenu.display){

      // }else{
      //     menu['menu'] = this.findMenuWithPermission(menuList);
      // }
      return menu;
  }
  // findMenuWithPermission(menuList:any){
  //     let modifyMenu = {};
  //     if(menuList && menuList.length > 0){
  //         for (let index = 0; index < menuList.length; index++) {
  //             const menu = menuList[index];
  //             if(menu.display && menu.submenu && menu.submenu != null){
  //                 for (let j = 0; j < menu.submenu.length; j++) {
  //                     const submenu = menu.submenu[j];
  //                     if(submenu.display){
  //                         modifyMenu = submenu;
  //                         break;
  //                     }
  //                 }
  //             }else{
  //                 if(menu.display){
  //                     modifyMenu = menu;
  //                     break;
  //                 }
  //             }
  //         }
  //     }
  //     return modifyMenu;
  // }
  setModuleName(moduleName:string){
    this.storageService.setModule(moduleName);
  }
  getModuleIndexById(moduleId:any){
    let moduleList = this.storageService.GetModules();
    return this.commonFunctionService.getIndexInArrayById(moduleList,moduleId);
  }
  shareMenuIndex(menuIndex:number,subMenuIndex:number,moduleIndex?:number){
    let indexs:any = {};
    indexs['menuIndex'] = menuIndex;
    indexs['submenuIndex'] = subMenuIndex;
    indexs['moduleIndex'] = moduleIndex;
    this.dataShareService.setMenuIndexs(indexs);
}
  getIndexsByMenuName(menuList:any,menuName:any){
    let indexs= {
      'menuindex':-1,
      'submenuindex':-1
    }
    for (let index = 0; index < menuList.length; index++) {
      const menu = menuList[index];
      if(menu.name == menuName){
        indexs.menuindex = index;
        indexs.submenuindex = -1;
      }else{
        if(menu.submenu && menu.submenu.length > 0){
          for (let j = 0; j < menu.submenu.length; j++) {
            const subMenu = menu.submenu[j];
            if(subMenu.name == menuName){
              indexs.menuindex = index;
              indexs.submenuindex = j;
            }
          }
        }
      }
    }
    return indexs;
  }
  getMenuNameById(module:any,menuId:any,submenuId:any,key?:any){
    let menuName:any = {};
    let menuList = module.menu_list;
    let menuIndex = this.commonFunctionService.getIndexInArrayById(menuList,menuId,key);
    menuName['menuIndex'] = menuIndex;
    let menu = menuList[menuIndex];
    if(submenuId != ""){
      if(menu.submenu){
        let subMenuList = menu.submenu;
        if(subMenuList && subMenuList.length > 0){
            let subMenuIndex = this.commonFunctionService.getIndexInArrayById(subMenuList,submenuId,key);
            menuName['subMenuIndex'] = subMenuIndex;
            let submenu = subMenuList[subMenuIndex];
            menuName['name'] = submenu.name;
        }
      }
    }else{
      menuName['name'] = menu.name;
    }
    return menuName;
  }
  // checkPermission(menu:any){
  //     return !this.permissionService.checkPermission(menu.name, 'view')
  // }
  getTemplateData(module:any,submenu:any) {
    if(submenu && submenu.name){
        this.storageService.SetActiveMenu(submenu);
        if (submenu.label == "Navigation") {
            this.router.navigate(['Navigation']);
        }
        else if (submenu.label == "Permissions") {
            this.router.navigate(['permissions']);
        }
        else {
          const menu = submenu;
          if(menu.name == "document_library"){
            this.router.navigate(['vdr']);
          }else if(menu.name == "report"){
            this.router.navigate(['report']);
          }
          else{
            this.apiService.resetTempData();
            this.apiService.resetGridData();
            this.GoToSelectedModule(module);
            const route = 'browse/'+module.name+"/"+submenu.name;
            //console.log(route);
            this.router.navigate([route]);
            //this.router.navigate(['template']);
          }
        }
    }else{
      this.permissionService.checkTokenStatusForPermission();
    }
  }

  GoToSelectedModule(item:any){
    if(item && item.name){
        this.setModuleName(item.name);
    }
    this.dataShareService.sendCurrentPage('DASHBOARD');
  }
  goToMOdule() {
    this.dataShareService.sendCurrentPage('MODULE');
    this.dataShareService.resetHeaderMenu([]);
    this.dataShareService.setModuleIndex(-1);
    this.dataShareService.setMenuIndexs({menuIndex:-1,submenuIndex:-1});
    const menuType = this.storageService.GetMenuType()
    if (menuType == 'Horizontal') {
        this.router.navigate(['/home']);
    } else {
        this.router.navigate(['/dashboard']);
    }
  }

  viewPermissionInTabs(tabs:any){
    tabs.forEach((tab:any) => {
      let tab_name = tab.tab_name;
      let check = this.permissionService.checkPermission(tab_name,'view');
      tab['display'] = check;
      tab['febMenu'] = this.checkFebMenuAddOrNot(tab,'');
    });
    return tabs;
  }

  addPermissionInTab(tab:any){
    if(tab && tab.tab_name){
      let name = tab.tab_name;
      let check = this.permissionService.checkPermission(name,'add');
      tab['addForm'] = check;
    }
    return tab;
  }
  checkFebMenuAddOrNot(tab:any,parent:any){
    let tabId = tab._id;
    if(parent != ''){
      tabId = parent._id;
    }
    let userFebTab = this.commonFunctionService.getUserPreferenceByFieldName('favoriteTabs');
    if(userFebTab && userFebTab != null && userFebTab.length > 0){
      let match = -1;
      for (let index = 0; index < userFebTab.length; index++) {
        const element = userFebTab[index];
        if(element._id == tabId ){
          match = index;
          break;
        }
      }
      if(match > -1){
        if(parent != ''){
          const submenu = userFebTab[match]['tab'];
          let subMatchIndex = -1;
          if(submenu && submenu.length > 0){
            for (let j = 0; j < submenu.length; j++) {
              const subMenu = submenu[j];
              if(subMenu._id == tab._id){
                subMatchIndex = j;
                break;
              }

            }
          }
          if(subMatchIndex > -1){
            return true
          }else{
            return false;
          }
        }else{
          return true;
        }
      }else{
        return false;
      }
    }else{
      return false;
    }
  }


}
