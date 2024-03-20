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
import { AwsSecretManagerService } from '../api/aws-secret-manager/aws-secret-manager.service';
import { DataShareService } from '../data-share/data-share.service';
import { ApiCallService } from '../api/api-call/api-call.service';


@Injectable({
  providedIn: 'root'
})
export class EnvService {
  requestType: any = '';
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private storageService: StorageService,
    private coreFunctionService:CoreFunctionService,
    private awsSecretManagerService : AwsSecretManagerService,
    private dataShareService : DataShareService,
    private apiCallService : ApiCallService
  ) { }
  

  getBaseUrl(){
    let baseUrl:any;
    const host = this.storageService.getHostNameDinamically();
    if(this.coreFunctionService.isNotBlank(host)){
      baseUrl = this.storageService.getHostNameDinamically()
    }else{
      // baseUrl = environment.serverhost
      // baseUrl = this.getHostKeyValue('serverEndpoint') +'/rest/';
      // this.setDinamicallyHost();
      baseUrl = this.dataShareService.getServerHostName() +'/rest/';
    }
    return baseUrl;
  }
  getAppName(){
    if(this.coreFunctionService.isNotBlank(this.storageService.getClientCodeEnviorment().appName)){
      this.storageService.setAppName(this.storageService.getClientCodeEnviorment().appName);
      return this.storageService.getClientCodeEnviorment().appName;
    }
  }
  getAppId(){
    return this.storageService.getClientCodeEnviorment().appId;
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
    // if(serverHostName != '' || serverHostName != setHostName) {      
    //   const hostName = serverHostName +'/rest/';
    //   this.storageService.setHostNameDinamically(hostName);
    //   //this.setThemeSetting(themedata);
    // }
  }
  
  getHostKeyValue(keyName:string){
    let hostname:any ="";
    let key_Name:string = '';
    if(this.storageService.checkPlatForm() == 'mobile'){
      hostname = this.storageService.getClientName();
      key_Name = 'clientCode';
    }else{
      hostname = this.getHostName('hostname');
      key_Name = 'clientEndpoint';
    }
    let value:any = '';  
    if(hostname == 'localhost'){
      value = this.storageService.getClientCodeEnviorment().serverhost;
    }else{
      value = this.dataShareService.getServerHostName();
    }
    if(serverHostList && serverHostList.length > 0 && key_Name == 'clientCode'){
      for (let index = 0; index < serverHostList.length; index++) {
        const element:any = serverHostList[index];
        if(hostname == element[key_Name]){
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
    // if(serverHostList && serverHostList.length > 0){
    //   for (let index = 0; index < serverHostList.length; index++) {
    //     const element:any = serverHostList[index];
    //     if(hostname == element[key_Name]){
    //       if(keyName == "object"){
    //         value = element;
    //         break;
    //       }else{
    //         value = element[keyName];
    //         break;
    //       }
          
    //     }        
    //   }
    // }

    return value;
  }

  async getAppSettingAsync (){

    let hostname:any ="";
    if(this.storageService.checkPlatForm() == 'mobile'){
      hostname = this.storageService.getClientName();
    }else{
      hostname = this.getHostName('hostname');
    }
    if(hostname == 'localhost'){
      hostname = this.storageService.getClientCodeEnviorment().serverhost;
      this.storageService.setHostNameDinamically(hostname+"/rest/");
    }else{
      await this.awsSecretManagerService.getSecret(hostname);
    }
    this.apiCallService.getApplicationAllSettings();
    
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
    {'propertyName':'--headerbg','key':'header_bg_color','default':'#fcfcfc'},
    {'propertyName':'--navtxtcolor','key':'header_txt_color','default':'#222'},
    {'propertyName':'--navtxthovercolor','key':'header_txt_hover_color','default':'#77bce8'},
    {'propertyName':'--headericon','key':'header_icon_color','default':'#555'},
    {'propertyName':'--headericonhover','key':'header_icon_hover_color','default':'#777'},
    {'propertyName':'--buttonColor','key':'btn_color','default':'#2597de'},
    {'propertyName':'--buttonHoverColor','key':'btn_hover_color','default':'#0b71b0'},
    {'propertyName':'--footerbg','key':'footer_bg','default':'#77bce8'},
    {'propertyName':'--themecolor','key':'theme_color','default':'#e8f5fd'},
    {'propertyName':'--activebg','key':'active_bg_color','default':'#77bce8'},
    {'propertyName':'--popupHeaderBg','key':'popup_header_bg','default':'#CEE7F7'},
    {'propertyName':'--formLabelBg','key':'form_label_bg','default':'#E4F2FA'},
    {'propertyName':'--fontColor','key':'txtColor','default':'#000'},
  ]
  setThemeSetting(settingObj:any) {
    this.themeSettingList.forEach(object => {
      let propertyName = object.propertyName;
      let key = object.key;
      let defaultValue = object.default;
      if(settingObj[key] && settingObj[key] != "" ) {
        document.documentElement.style.setProperty(propertyName, settingObj[key]);
      }else{
        document.documentElement.style.setProperty(propertyName, defaultValue);
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

  checkClientExistOrNot(data:any){
    let value : boolean = false;
    if(serverHostList && serverHostList.length > 0){
      for (let index = 0; index < serverHostList.length; index++) {
        const element:any = serverHostList[index];
        if(element && element.clientCode){
          if(data === element.clientCode){
            value = true
          }
        }
      }
    }
    return value;
  }
  getVerifyType(){
    return this.storageService.getClientCodeEnviorment().verify_type;
  }

}
