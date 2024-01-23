import { Injectable } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { ApiService } from '../api/api.service';
import { DataShareService } from '../data-share/data-share.service';
import { CommonFunctionService } from '../common-utils/common-function.service';

@Injectable({
  providedIn: 'root',
})
export class UserPrefrenceService {
  constructor(
    private storageService: StorageService,
    private apiService: ApiService,
    private dataShareService: DataShareService,
    private commonFunctionService: CommonFunctionService
  ) {}

  updateUserPreference(data: object, fieldName: string, parent?: string): Promise<{ success: boolean }> {
    return new Promise(async (resolve) => {
      try {
        let payloadData;
  
        switch (fieldName) {
          case 'preferenceMap':
            payloadData = this.modifiedMenuObj(data, fieldName, parent);
            break;
          case 'tab':
            payloadData = this.addOrRemoveTabs(data);
            break;
          default:
            payloadData = this.storageService.getUserPreference();
            break;
        }
        const payload = {
          curTemp: 'user_preference',
          data: payloadData,
        };
        this.apiService.SaveFormData(payload);

        resolve({ success: true });
      } catch (error) {
        resolve({ success: false });
      }
    });
  } 

  addOrRemoveTabs(tab: any) {
    let menuIndexs = this.dataShareService.getMenuOrSubmenuIndexs();
    let modules = this.storageService.GetModules();
    let extractedMenu = this.extractMenuDetails(tab, modules, menuIndexs);
    // let userPreference = this.updateFavTabs(extractedMenu, tab);
    let userPreference = this.createUserPreference('preferenceMap')
    userPreference['preferenceMap'] = extractedMenu;
    return userPreference;
  }
  // Modifies the user preference object with the provided data
  modifiedMenuObj(data: any, fieldName: string, parent?: string) {
    let modifiedMenuObj = this.prepareMenuJson(data, fieldName, parent);
    // let userPreference = this.storageService.getUserPreference();
    // userPreference[fieldName] = this.mergeMenus(userPreference[fieldName],modifiedMenuObj,parent);
    let userPreference =  this.createUserPreference(fieldName);
    userPreference[fieldName] = modifiedMenuObj;
    return userPreference;
  }
  // Prepares a menu object from menu items
  prepareMenuJson(menuItems: any, fieldName: string, parent?: any) {
    const menu: any = {};
    const itemsArray = Array.isArray(menuItems) ? menuItems : [menuItems];
    itemsArray.forEach((item) => {
      const moduleName:string | null = this.storageService.getModule();
      const menuReference = {
        ...this.commonFunctionService.getReferenceObject(item),
        allSelected: true,
      };

      let menuData: any;
      // let menus = userPreference[fieldName];
      if (parent) {
        // If parent exists and has a submenu, add the current menu to the existing submenu
        let refObj: any = {
          favourite: true,
          reference: {
            ...this.commonFunctionService.getReferenceObject(menuItems),
            allSelected: true,
          },
        };
        let parObjRef: any = this.commonFunctionService.getReferenceObject(parent);
        menuData = {
          reference: parObjRef,
          favourite: true,
          submenus: {
            [menuItems.name]: refObj,
          },
        };
        if(moduleName!=null){
          menu[moduleName]={
            reference : this.getModuleRef(moduleName),
            favourite: true,
            [parent.name] : menuData
          }
          return menu;
        }
      } else {
        menuData = {
          reference: menuReference,
          favourite: true,
        };
        if(moduleName!== null){
          menu[moduleName]={
            reference : this.getModuleRef(moduleName),
            favourite: true,
            [item.name] : menuData
          }
          return menu;
        }
      }
    });
    return menu;
  }
  //Create UserPreference when not exist
  createUserPreference(fieldName:string){
    let uref: any = {};
    let userRef = this.commonFunctionService.getReferenceObject(
      this.storageService.GetUserInfo()
    );
    uref['userId'] = userRef;
    //set empty obj for required key
    uref[fieldName] = {}
    return uref;
  }
  //Get Module Reference by Module Name
  getModuleRef(moduleName:any){
    let Allmodules = this.storageService.GetModules();
    let module = Allmodules.filter((module:any)=>{
      return module.name == moduleName;
    })
    return this.commonFunctionService.getReferenceObject(module[0]);
  }

  // GetTemplateTabs in current Menu
  getTemplateTabs(){
    const tabsData = this.dataShareService.getTempData();
    const templateTabs = tabsData?.[0]?.templateTabs ?? null;
    return templateTabs;
  }
  // Gets all tab's reference Obj from the provided array of tabs
  getAllTabs(tabs: any) {
    if (!tabs) {
      return {};
    }
    const allTabs = tabs.reduce((acc: any, tab: any) => {
      const tabRef = this.getTabRef(tab);
      if (tabRef && Object.keys(tabRef).length > 0) {
        Object.assign(acc, tabRef);
      }
      return acc;
    }, {});

    return allTabs;
  }
   // Gets only the tab's reference Obj with favourite set to true from the provided array of tabs
   getFebTabs(tabs: any) {
    if (!tabs) {
      return {};
    }
    return tabs
    .filter((tab: any) => tab.favourite === true)
    .reduce((acc: any, tab: any) => {
      const tabRef = this.getTabRef(tab);
      if (tabRef && Object.keys(tabRef).length > 0) {
        Object.assign(acc, tabRef);
      }
      return acc;
    }, {});
  }
  // Creates a reference object for a tab
  getTabRef(tab: any,optKey?:string) {
    let res: any = {};
    if (tab && tab.tab_name != '' && tab.tab_name != null) {
      const tabReference:any = {
        reference: this.commonFunctionService.getReferenceObject(tab),
      };
      if(optKey!= '' && optKey!= undefined){
        tabReference[optKey] = true;
      }
      res[tab.tab_name] = tabReference;
    }
    return res;
  }
  // Merges existingMenus with newMenus
  mergeMenus(existingMenus: any, newMenus: any, parent: any) {
    const mergedMenus: any = { ...existingMenus };
    const checkFeb = this.checkFebMenuAddOrNot(newMenus, parent);
    const newMenukeys = Object.keys(newMenus);
    if (!checkFeb) {
      for (const key in newMenus) {
        if (newMenus.hasOwnProperty(key)) {
          if (
            mergedMenus.hasOwnProperty(key) &&
            mergedMenus[key].hasOwnProperty('submenus')
          ) {
            // If the key exists and has submenus, merge the submenus
            mergedMenus[key].submenus = {
              ...mergedMenus[key].submenus,
              ...newMenus[key].submenus,
            };
          } else {
            // If the key doesn't exist or doesn't have submenus, set submenus to newMenus
            mergedMenus[key] = newMenus[key];
          }
        }
      }
    } else {
      for (const key in mergedMenus) {
        if (
          mergedMenus.hasOwnProperty(key) &&
          mergedMenus[key].hasOwnProperty('submenus')
        ) {
          const existingSubmenus = mergedMenus[key].submenus;
          const newSubmenus = newMenus[key] && newMenus[key].submenus;

          if (existingSubmenus && newSubmenus) {
            for (const submenuKey in newSubmenus) {
              if (newSubmenus.hasOwnProperty(submenuKey)) {
                if (existingSubmenus.hasOwnProperty(submenuKey)) {
                  // Remove existing submenus
                  delete existingSubmenus[submenuKey];
                } else {
                  // Add new submenus
                  existingSubmenus[submenuKey] = newSubmenus[submenuKey];
                }
              }
            }
          } else {
            // If either existing or new submenus are missing, delete the menu
            if (key === newMenukeys[0]) {
              delete mergedMenus[key];
            }
          }
        } else {
          if (key === newMenukeys[0] && parent == '') {
            delete mergedMenus[key];
          }
        }
      }
    }
    return this.deleteEmptyMenus(mergedMenus);
  }
  // Deletes empty menus from the provided menus object
  deleteEmptyMenus(menus: any): any {
    const updatedMenus: any = { ...menus };
    for (const key in updatedMenus) {
      if (
        updatedMenus.hasOwnProperty(key) &&
        updatedMenus[key].submenus != null
      ) {
        if (Object.keys(updatedMenus[key].submenus).length === 0) {
          // Delete the menu if submenus is empty
          delete updatedMenus[key];
        } else {
          let subMenus = updatedMenus[key].submenus;
          for (const subMenuKey in subMenus) {
            // Check templateTabs condition
            const templateTabs =
              updatedMenus[key]?.submenus[subMenuKey]?.templateTabs;
            if (
              templateTabs != null &&
              Object.keys(templateTabs).length === 0
            ) {
              // Delete the menu if templateTabs is empty
              delete updatedMenus[key].submenus[subMenuKey];
            }
          }
        }
      } else {
        const templateTabs = updatedMenus[key].templateTabs;
        if (templateTabs != null && Object.keys(templateTabs).length === 0) {
          // Delete the menu if templateTabs is empty
          delete updatedMenus[key];
        }
      }
    }
    return updatedMenus;
  }
  // Checks if a menu should be added based on the febMenu condition
  checkFebMenuAddOrNot(menu: any, parent: any) {
    let userFebMenu = this.getUserPreferenceByFieldName('preferenceMap');
    if (!menu || typeof menu !== 'object' || Object.keys(menu).length === 0) {
      return false;
    }

    if (
      parent &&
      (typeof parent !== 'object' || Object.keys(parent).length === 0)
    ) {
      return false;
    }

    let menuId =
      Object.keys(menu).length > 0
        ? menu[Object.keys(menu)[0]].reference?._id
        : null;
    // Check if parent and parent.reference are defined before accessing _id
    if (parent && parent !== '' && typeof parent === 'object' && userFebMenu) {
      for (const key in menu) {
        if (menu.hasOwnProperty(key)) {
          if (
            userFebMenu.hasOwnProperty(key) &&
            userFebMenu[key].hasOwnProperty('submenus')
          ) {
            const menuSubmenus = menu[key].submenus;
            for (const submenuKey in menuSubmenus) {
              const submenuId = menuSubmenus[submenuKey].reference?._id;
              if (!this.isIdExist(userFebMenu[key].submenus, submenuId)) {
                return false;
              } else return true;
            }
          } else {
            return false; // Return false if the key is missing or doesn't have submenus in userFebMenu
          }
        }
      }
    }

    if (
      userFebMenu &&
      userFebMenu !== null &&
      typeof userFebMenu === 'object' &&
      Object.keys(userFebMenu).length > 0
    ) {
      return this.isIdExist(userFebMenu, menuId);
    } else {
      return false;
    }
  }
  // Checks if a given ID exists in the provided object
  isIdExist(obj: any, targetId: any) {
    for (const key in obj) {
      if (
        obj.hasOwnProperty(key) &&
        obj[key].reference &&
        obj[key].reference._id === targetId
      ) {
        return true;
      }
    }
    return false;
  }
  // Checks is Menu already present or not - For fabMenu icon
  isMenuAlreadyPresentOrNot(targetMenu: any, userFebMenu: any): boolean {
    for (const key in userFebMenu) {
      if (userFebMenu.hasOwnProperty(key)) {
        const menu = userFebMenu[key];
        if (menu.reference && menu.reference._id === targetMenu._id) {
          return true;
        }
        if (menu.submenus) {
          for (const submenuKey in menu.submenus) {
            if (menu.submenus.hasOwnProperty(submenuKey)) {
              const submenu = menu.submenus[submenuKey];
              if (
                submenu.reference &&
                submenu.reference._id === targetMenu._id
              ) {
                return true;
              }
            }
          }
        }
      }
    }
    return false;
  }
  getUserPreferenceByFieldName(fieldName: string) {
    let data = [];
    let userPreference = this.storageService.getUserPreference();
    if (userPreference && userPreference[fieldName]) {
      data = userPreference[fieldName];
    }
    return data;
  }
  // Extract the menu and submenu data for tab
  extractMenuDetails(
    tab: any,
    data: any[],
    indices: { menuIndex: number; submenuIndex: number; moduleIndex: number }
  ) {
    const { menuIndex, submenuIndex, moduleIndex } = indices;
    let newMenu: any = {};
    let tabRef = this.getTabRef(tab,'favourite');
    let moduleRef = this.commonFunctionService.getReferenceObject(data[moduleIndex]);

    if (submenuIndex != -1) {
      let submenu =
        data[moduleIndex]?.['menu_list'][menuIndex]?.['submenu']?.[
          submenuIndex
        ];
      let parent = data[moduleIndex]?.['menu_list'][menuIndex];
      newMenu[moduleRef.name] = {
        reference : moduleRef,
        favourite: true,
        [parent.name] : {
        reference: this.commonFunctionService.getReferenceObject(parent),
        favourite: true,
        submenus: {
          [submenu.name]: {
            favourite: true,
            reference: {
              ...this.commonFunctionService.getReferenceObject(submenu),
              allSelected: false,
            },
            templateTabs: tabRef,
          },
        },
      }
    };
    } else {
      let menu = data[moduleIndex]?.['menu_list'][menuIndex];
      newMenu[moduleRef.name]={
        reference : moduleRef,
        favourite:true,
        [menu.name] : {
        favourite: true,
        reference: { ...this.commonFunctionService.getReferenceObject(menu), allSelected: false },
        templateTabs: tabRef,
      }
    };
    }
    return newMenu;
  }
  //update tabs
  updateFavTabs(newMenus: any, tab: any) {
    let existingUserPreferences = this.storageService.getUserPreference();
    if(!existingUserPreferences){
      existingUserPreferences = this.createUserPreference('preferenceMap');
    }
    let existingMenus = existingUserPreferences['preferenceMap'];
    let updatedMenus = { ...existingMenus };
    let favExist = !tab.favourite

    if (!favExist) {
      for (let menuName in newMenus) {
        if (newMenus.hasOwnProperty(menuName)) {
          let newMenu = newMenus[menuName];

          if (existingMenus.hasOwnProperty(menuName)) {
            let existingMenu = existingMenus[menuName];

            existingMenu.reference = newMenu.reference;
            if (!existingMenu.submenus) {
              if (existingMenu.templateTabs && newMenu.templateTabs) {
                delete existingMenu.templateTabs[tab.tab_name];
                if (existingMenu.submenus && newMenu.submenus) {
                  existingMenu.templateTabs = {
                    ...existingMenu.templateTabs,
                    ...newMenu.templateTabs,
                  };
                } else {
                  existingMenu.templateTabs = {
                    ...existingMenu.templateTabs,
                    ...newMenu.templateTabs,
                  };
                }
              }
            } else {
              for (let subMenuKey in newMenu.submenus) {
                if (newMenu.submenus.hasOwnProperty(subMenuKey)) {
                  let newSubMenu = newMenu.submenus[subMenuKey];

                  if (existingMenu.submenus.hasOwnProperty(subMenuKey)) {
                    let existingSubMenu = existingMenu.submenus[subMenuKey];
                    existingSubMenu.reference = newSubMenu.reference;
                    if (
                      existingSubMenu.templateTabs &&
                      newSubMenu.templateTabs
                    ) {
                      existingSubMenu.templateTabs = {
                        ...existingSubMenu.templateTabs,
                        ...newSubMenu.templateTabs,
                      };
                    } else {
                      existingSubMenu.templateTabs = newSubMenu.templateTabs;
                    }
                  } else {
                    existingMenu.submenus[subMenuKey] = { ...newSubMenu };
                  }
                }
              }
            }
          } else {
            updatedMenus[menuName] = { ...newMenu };
          }
        }
      }
    } else {
      for (let menuName in existingMenus) {
        if (newMenus.hasOwnProperty(menuName)) {
          let newMenu = newMenus[menuName];
          let existingMenu = existingMenus[menuName];          
          if (!existingMenu.submenus) {
              existingMenu.reference = newMenu?.reference;
              const favTabs = this.getFebTabs(this.getTemplateTabs());
              existingMenu["templateTabs"] = favTabs;
            if (
              existingMenu.templateTabs &&
              existingMenu.templateTabs[tab.tab_name]
            ) {
              delete existingMenu.templateTabs[tab.tab_name];
            }
          } else {
            for (let subMenuKey in existingMenu.submenus) {
              if (newMenu.submenus.hasOwnProperty(subMenuKey)) {
                let existingSubMenu = existingMenu.submenus[subMenuKey];
                const favTabs = this.getFebTabs(this.getTemplateTabs());
                existingSubMenu["templateTabs"] = favTabs;
                existingSubMenu.reference = newMenu?.submenus[subMenuKey]?.reference
                if (
                  existingSubMenu.templateTabs &&
                  existingSubMenu.templateTabs[tab.tab_name]
                ) {
                  delete existingSubMenu.templateTabs[tab.tab_name];
                }
              }
            }
          }
        }
      }
    }
    updatedMenus = this.deleteEmptyMenus(updatedMenus);
    existingUserPreferences['preferenceMap'] = updatedMenus;

    return existingUserPreferences;
  }
  // Check the tab id in local USER_PREF
  checkFebTabAddOrNot(tab: any) {
    const menus = this.storageService.getUserPreference()?.['preferenceMap'] || {};
    return this.isIdExistInTemplateTabs(menus, tab._id);
  }
  isIdExistInTemplateTabs(obj: any, targetId: string): boolean {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const value = obj[key];

        if (value && typeof value === 'object') {
          // Recursively search in nested objects
          if (this.isIdExistInTemplateTabs(value, targetId)) {
            return true;
          }
        } else if (key === '_id' && value === targetId) {
          return true;
        }
      }
    }
    return false;
  }
  getUserPreferenceObj(data:any,fieldName:string,parent?:string){
    let refObj:any = this.commonFunctionService.getReferenceObject(data);
    if(parent != ''){
      refObj = parent;
    }
    if(fieldName == "favoriteMenus"){
      refObj = data;
    }
    let uRef:any = {};
    let userPreference = this.storageService.getUserPreference();
    if(userPreference && userPreference._id && userPreference._id != null && userPreference._id != ''){
      let fieldData = userPreference[fieldName];
      if(fieldData && fieldData.length > 0){
        let matchIndex = -1;
        for (let index = 0; index < fieldData.length; index++) {
          const element = fieldData[index];
          if(element._id == refObj._id){
            matchIndex = index;
            break;
          }
        }
        if(matchIndex  > -1){
          if(parent != ''){
            let submenu = fieldData[matchIndex].submenu;
            let submenuMatchIndex = -1;
            if(submenu && submenu.length > 0){
              for (let j = 0; j < submenu.length; j++) {
                const subMenu = submenu[j];
                if(subMenu._id == data._id){
                  submenuMatchIndex = j;
                  break;
                }
              }
            }
            if(submenuMatchIndex > -1){
              submenu.splice(submenuMatchIndex);
              if(fieldData[matchIndex].submenu.length == 0){
                fieldData.splice(matchIndex);
              }else{
                fieldData[matchIndex].submenu = submenu;
              }
            }else{
              if(submenu.length > 0){
                fieldData[matchIndex].submenu.push(data);
              }else{
                fieldData[matchIndex].submenu = []
                fieldData[matchIndex].submenu.push(data);
              }
            }
          }else{
            fieldData.splice(matchIndex, 1);
          }
        }else{
          if(parent != ''){
            refObj['submenu'] = [];
            refObj['submenu'].push(data);
            fieldData.push(refObj);
          }else{
            fieldData.push(refObj);
          }
        }
      }else{
        fieldData = [];
        fieldData.push(refObj);
      }
      userPreference[fieldName] = fieldData;
      uRef = userPreference;
    }else{
      let user = this.storageService.GetUserInfo();
      let userRef = this.commonFunctionService.getReferenceObject(user);
      let dataList = [];
      dataList.push(refObj);
      uRef['userId'] = userRef;
      uRef[fieldName] = dataList;
    }
    return uRef
  }


}
