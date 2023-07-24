import { Injectable,Inject } from '@angular/core';
import { from, of, Observable } from 'rxjs';//fromPromise
import { DOCUMENT } from '@angular/common';
import { Common } from '../../shared/enums/common.enum';
import { EndPoint } from '../../shared/enums/end-point.enum';
import { StorageTokenStatus } from '../../shared/enums/storage-token-status.enum';
import { serverHostList } from './serverHostList';
import { StorageService } from '../../services/storage/storage.service';
import { CoreFunctionService } from '../../services/common-utils/core-function/core-function.service';
import { PLATFORM_NAME } from '../../shared/platform';


@Injectable({
  providedIn: 'root'
})
export class EnvService {
  requestType: any = '';
  constructor(
    @Inject('env') private env:any,
    @Inject(DOCUMENT) private document: Document,
    private storageService: StorageService,
    private coreFunctionService:CoreFunctionService,
  ) { }
  

  load(): Observable<any>{
    return this.env;
  }

  getPlatform(){
    return this.env.isPlatform;
  }

  getBaseUrl(){
    let baseUrl:any;
    const host = this.storageService.getHostNameDinamically();
    if(this.coreFunctionService.isNotBlank(host)){
      baseUrl = this.storageService.getHostNameDinamically()
    }else{
      // baseUrl = environment.serverhost
      baseUrl = this.getHostKeyValue('serverEndpoint') +'/rest/';
      this.setDinamicallyHost();
    }
    return baseUrl;
  }
  getAppName(){
    if(this.coreFunctionService.isNotBlank(this.env.appName)){
      this.storageService.setAppName(this.env.appName);
      return this.env.appName;
    }
  }
  getAppId(){
    return this.env.appId;
  }
  baseUrl(applicationAction: string) {    
    return this.getBaseUrl() +  (<any>EndPoint)[applicationAction];
  }
  publicBaseUrl(applicationAction: string) {
      return this.getBaseUrl() + EndPoint.PUBLIC + (<any>EndPoint)[applicationAction];
  }
  otpApi(){
    return "https://2factor.in/API/V1/" + Common.API_KEY + "/SMS/"
  }
  verifyOtpApi(){
    return "https://2factor.in/API/V1/" + Common.API_KEY + "/SMS/VERIFY/"
  }
  getApi(apiName:string){
    let api;
    if(this.getRequestType() == 'PUBLIC'){
        api = this.publicBaseUrl(apiName)
    }else{
        api = this.baseUrl(apiName)
    }
    return api;
  }
  getAuthApi(apiName:string){
    let api;
    api = this.baseUrl(apiName)
    return api;
  }
  setRequestType(type:any) {
    this.requestType = type;
  }
  getRequestType() {
    if(this.requestType == ''){
      if(this.checkLogedIn()){
        this.requestType = "PRIVATE";
      }else{
        this.requestType = "PUBLIC";
      }
    }
    return this.requestType;
  }
  checkLogedIn(){
    if (this.storageService != null && this.storageService.GetIdToken() != null) {
      if(this.storageService.GetIdTokenStatus() == StorageTokenStatus.ID_TOKEN_ACTIVE){
        return true;
      }else{        
        return false;
      }      
    }
    return false;
  }

  setDinamicallyHost(){
    let setHostName = this.storageService.getHostNameDinamically();
    let serverHostName = this.getHostKeyValue('serverEndpoint');
    //let themedata = this.getHostKeyValue('theme_setting');    
    //this.setApplicationSetting();
    if(serverHostName != '' || serverHostName != setHostName) {      
      const hostName = serverHostName +'/rest/';
      this.storageService.setHostNameDinamically(hostName);
      //this.setThemeSetting(themedata);
    }
  }
  
  getHostKeyValue(keyName:string){
    let hostname:any ="";
    let key_Name:string = '';
    let platFormName = this.getPlatform();
    if(platFormName && platFormName != "" && PLATFORM_NAME.includes(platFormName)){
      hostname = this.storageService.getClientName();
      key_Name = 'clientCode';
    }else{
      hostname = this.getHostName('hostname');
      key_Name = 'clientEndpoint';
    }
    let value:any = '';   
    if(hostname == 'localhost'){
      value = this.env.serverhost;
    }else if(serverHostList && serverHostList.length > 0){
      for (let index = 0; index < serverHostList.length; index++) {
        const element:any = serverHostList[index];
        if(hostname == element.key_Name){
          if(keyName == "object"){
            value = element;
            break;
          }else{
            value = element[keyName];
            break;
          }
          
        }        
      }
    }
    return value;
  }
  getHostName(key:string){
    let mydocument:any = this.document;
    return mydocument.location[key];
  }

  setGoogleLocation(geolocation:any){
    (Common as any).GOOGLE_MAP_IN_FORM = geolocation;
  }

  setApplicationSetting(){
    let geolocation = this.storageService.getApplicationValueByKey('google_map');
    this.setGoogleLocation(geolocation);
  }

  themeSettingList = [
    {'propertyName':'--headerbg','key':'header_bg_color'},
    {'propertyName':'--navtxtcolor','key':'header_txt_color'},
    {'propertyName':'--navtxthovercolor','key':'header_txt_hover_color'},
    {'propertyName':'--headericon','key':'header_icon_color'},
    {'propertyName':'--headericonhover','key':'header_icon_hover_color'},
    {'propertyName':'--buttonColor','key':'btn_color'},
    {'propertyName':'--buttonHoverColor','key':'btn_hover_color'},
    {'propertyName':'--footerbg','key':'footer_bg'},
    {'propertyName':'--themecolor','key':'theme_color'},
    {'propertyName':'--activebg','key':'active_bg_color'},
    {'propertyName':'--popupHeaderBg','key':'popup_header_bg'},
    {'propertyName':'--formLabelBg','key':'form_label_bg'}
  ]
  setThemeSetting(settingObj:any) {
    this.themeSettingList.forEach(Object => {
      let propertyName = Object.propertyName;
      let key = Object.key;
      if(settingObj[key] && settingObj[key] != "" ) {
        document.documentElement.style.setProperty(propertyName, settingObj[key]);
      }
    });
  }
  checkRedirectionUrl(){
    let redirectURL = '';
    const url = this.storageService.getApplicationSetting();
    if(url && url['redirect_url']){
      redirectURL = url['redirect_url'];
    }
    return redirectURL;
  }

  

  
  
}
