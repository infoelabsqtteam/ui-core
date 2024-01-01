import { CoreFunctionService } from './../common-utils/core-function/core-function.service';
import { EncryptionService } from './../encryption/encryption.service';
import { Inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { StorageTokenStatus } from '../../shared/enums/storage-token-status.enum';
import { PLATFORM_NAME } from '../../shared/platform';
import { Common } from '../../shared/enums/common.enum';



@Injectable({
  providedIn: 'root'
})
export class StorageService {
  ID_TOKEN: string = 'ID_TOKEN';
  ACCESS_TOKEN: string = 'ACCESS_TOKEN';
  REFRESH_TOKEN: string = 'REFRESH_TOKEN';
  RESET_PASS_SESSION:string = 'RESET_PASS_SESSION';
  EXPIRY_IN:any= 'EXPIRY_IN';
  USER_KEY: string = 'USER';
  ACTIVE_MENU: string = 'MENU';
  MENU_TYPE: string = 'MENU_TYPE';
  ID_TOKEN_EXPIRY_TIME: string = 'ID_TOKEN_EXPIRY_TIME';
  REFRESH_TOKEN_EXPIRY_TIME:string='REFRESH_TOKEN_EXPIRY_TIME';
  userInfo: any;
  log: any;
  age:any=3540000; //59 minuts
  refreshTokenAge:any=2505600000 //refresh token age 29 days
  packDetails: any = {};

  HOST_NAME : string = 'HOST_NAME';
  PROJECT_FOLDER_NAME: string = 'PROJECT_FOLDER_NAME';
  TEMP_NAME:string = "TEMP_NAME";
  TEMP_THEME:string = "TEMP_THEME";
  PAGE_TITLE:string = "PAGE_TITLE";
  VERIFY_TYPE:string = "VERIFY_TYPE";
  MODULE:string = "MODULE";
  TEAM_NAME:string = "TEAM_NAME";
  USER_PREFERENCE:any;
  REDIRECT_URL:string = "REDIRECT_URL";
  CHILD_WINDOW_URL:string = "CHILD_WINDOW_URL";
  MODIFY_MODULES:any = 'MODIFY_MODULES';
  appName:any;
  CLIENT_NAME:any = 'CLIENT_NAME';
  ALL_TEMPLATE:any = 'ALL_TEMPLATE';
  TEMPLATE_INDEX:any = "TEMPLATE_INDEX";


  constructor(
    private http: HttpClient,
    @Inject('env') private env:any,
    private encryptionService:EncryptionService,
    private coreFunctionService:CoreFunctionService
    ) { }

  load(): Observable<any>{
    return this.env;
  }
  setAppName(appname:string){
    this.appName = appname;
    localStorage.setItem("AppName", JSON.stringify(appname));
}
  setModule(module:string){
    sessionStorage.setItem("MODULE",module);
  }
  getModule(){
    return sessionStorage.getItem('MODULE');
  }
  setChildWindowUrl(url:string){
    localStorage.setItem("CHILD_WINDOW_URL",url);
  }
  getChildWindowUrl(){
    return localStorage.getItem('CHILD_WINDOW_URL');
  }
  setRedirectUrl(url:string){
    sessionStorage.setItem("REDIRECT_URL",url);
  }
  getRedirectUrl(){
    return sessionStorage.getItem('REDIRECT_URL');
  }
  setUserPreference(user_preference:any){
    localStorage.setItem("USER_PREFERENCE",JSON.stringify(user_preference));
  }
  getUserPreference(){
    return JSON.parse(<any>localStorage.getItem('USER_PREFERENCE'));
  }

  setThemeSetting(settingObj:any){
    localStorage.setItem("THEME_SETTING",JSON.stringify(settingObj));
  }
  getThemeSetting(){
    return JSON.parse(<any>localStorage.getItem('THEME_SETTING'));
  }

  setApplicationSetting(applicationSetting:any){
    localStorage.setItem("APPLICATION_SETTING",JSON.stringify(applicationSetting));
  }
  getApplicationSetting(){
    return JSON.parse(<any>localStorage.getItem('APPLICATION_SETTING'));
  }

  setAppId(appId:string){
    localStorage.setItem('appId', appId);
  }

  getAppId(){
    const user = this.GetUserInfo();
    if(user && user.appId && user.appId != null){
      return user.appId;
    }else{
      return localStorage.getItem('appId')
    }
  }

  setExpiresIn(expiry: any){
    let expiryTime = (expiry - 300)*1000
    localStorage.setItem(this.EXPIRY_IN, JSON.stringify(expiryTime));
    this.setIdTokenExpiry();
  }
  getExpiresIn(){
    return localStorage.getItem(this.EXPIRY_IN);
  }
  SetIdToken(token: any) {
    localStorage.setItem(this.ID_TOKEN, JSON.stringify(token));
  }
  GetIdToken() {
    let obj = JSON.parse(<any>localStorage.getItem(this.ID_TOKEN));
    if(obj && obj != null ){
      return obj;
    }else{
      return null;
    }
  }
  IsJsonString(str:any) {
      try {
          JSON.parse(str);
      } catch (e) {
          return false;
      }
      return true;
  }
  SetAccessToken(token: any) {
    localStorage.setItem(this.ACCESS_TOKEN, JSON.stringify(token));
  }
  GetAccessToken() {
    let obj = JSON.parse(<any>localStorage.getItem(this.ACCESS_TOKEN));
    if(obj && obj != null){
        return obj;
    }
  }
  SetRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_TOKEN, token);
    this.setRefreshTokenExpiry();
  }
  GetRefreshToken() {
    return localStorage.getItem(this.REFRESH_TOKEN);
  }
  SetFavTabs(data:any){
    sessionStorage.setItem("FAVTABS",JSON.stringify(data))
  }
  GetFavTabs(){
    return JSON.parse(sessionStorage.getItem("FAVTABS") ?? 'null');
  }
  ClearFavTabs(){
    sessionStorage.removeItem("FAVTABS")
  }
  GetIdTokenStatus(){
    let expired = 0;
    let expireTime = Number(localStorage.getItem(this.ID_TOKEN_EXPIRY_TIME));
    let currentTime = Date.now();
    let expiresIn24Hours = 0;

	if(expireTime > currentTime)
      expiresIn24Hours =  (((expireTime-currentTime)/1000)/3600) ;

	if(currentTime > expireTime){
      if(expireTime > 0){
        return StorageTokenStatus.ID_TOKEN_EXPIRED;  // appConstant.TOKEN_STATUS.ID_TOKEN_EXPIRED; // notify, due to expired
      }
      return  StorageTokenStatus.ID_TOKEN_NOT_CREATED; //appConstant.TOKEN_STATUS.ID_TOKEN_NOT_CREATED;  // first time loading so no notify
    } else if(expiresIn24Hours > 24){
		return StorageTokenStatus.ID_TOKEN_EXPIRED //appConstant.TOKEN_STATUS.ID_TOKEN_EXPIRED; // notify, due to expired
	}

    return StorageTokenStatus.ID_TOKEN_ACTIVE; //appConstant.TOKEN_STATUS.ID_TOKEN_ACTIVE; // not expired
  }



  GetRefreshTokenStatus(){
    let expired = 0;
    let expireTime = Number(localStorage.getItem(this.REFRESH_TOKEN_EXPIRY_TIME));
    let currentTime = Date.now();
    if(currentTime > expireTime){
      if(expireTime > 0){
        return StorageTokenStatus.REFRESH_TOKEN_EXPIRED; // appConstant.TOKEN_STATUS.REFRESH_TOKEN_EXPIRED; // notify, due to expired
      }
      return StorageTokenStatus.REFRESH_TOKEN_NOT_CREATED; // appConstant.TOKEN_STATUS.REFRESH_TOKEN_NOT_CREATED;  // first time loading so no notify
    }
    return StorageTokenStatus.REFRESH_TOKEN_ACTIVE; // appConstant.TOKEN_STATUS.REFRESH_TOKEN_ACTIVE; // not expired
  }

  SetUserInfo(user: any) {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }
  GetUserInfo() {
    const obj:any = JSON.parse(<any>localStorage.getItem(this.USER_KEY));
    if(obj && obj.user){
      return obj.user
    }else{
      return {};
    }
  }
  GetUserReference() {
    let user = this.GetUserInfo();
    let userRef:any = {};
    userRef['_id'] = user['_id'];
    userRef['name'] = user['name'];
    return userRef;
  }
  GetPermission() {
    const obj = JSON.parse(<any>localStorage.getItem(this.USER_KEY));
    if(obj && obj.permission){
      return obj.permission
    }
    else{
      return [];
    }
  }

  GetModules(){
    const obj = JSON.parse(<any>localStorage.getItem(this.USER_KEY));
    if(obj && obj.modules){
      return obj.modules
    }
    else{
      return [];
    }
  }
  // SetModifyModules(modules:any){
  //   localStorage.setItem(this.MODIFY_MODULES,JSON.stringify(modules));
  // }
  // GetModifyModules(){
  //   return JSON.parse(<any>localStorage.getItem(this.MODIFY_MODULES));
  // }
  GetMenuType(){
    const menu_Type = this.getApplicationValueByKey('menu_type');
    if(menu_Type){
        return menu_Type;
      }
      else{
        return null;
    }
  }
  getUserLog() {
    const user = JSON.parse(<any>localStorage.getItem(this.USER_KEY));
    if(user && user != null && user != undefined && user.user){
      this.userInfo = user.user;
      this.log = { userId: this.userInfo.email, appId: this.getAppId(), refCode: this.userInfo.refCode };
      return this.log;
    }else{
      return null;
    }
  }
  SetActiveMenu(menu: any) {
    sessionStorage.setItem(this.ACTIVE_MENU, JSON.stringify(menu));
  }
  GetActiveMenu() {
    return JSON.parse(<any>sessionStorage.getItem(this.ACTIVE_MENU));
  }
  getRefCode() {
    const userinfo = this.GetUserInfo();
    if(userinfo && userinfo.refCode){
      return userinfo.refCode;
    }
    return null;
  }
  getUserAppId(){
    return this.userInfo.appId;
  }
  removeDataFormStorage(all?:string) {
    let doNotClearCache:any = [];
    if(all != "all"){
      if(this.checkPlatForm() == 'mobile'){
        let clientCode = this.getClientName();
        if(clientCode && clientCode != ''){
          let object:any = {};
          object['key'] = this.CLIENT_NAME;
          object["value"] = clientCode;
          object['type'] = 'localstorage'
          doNotClearCache.push(object);
        }
      }
    }
    localStorage.clear();
    sessionStorage.clear();
    if(doNotClearCache && doNotClearCache.length > 0){
      doNotClearCache.forEach((obj:any) => {
        if(obj && obj.type == 'localstorage'){
          let key = obj['key'];
          let value = obj['value'];
          localStorage.setItem(key,value);
        }
      })
    }
  }

  setIdTokenExpiry(){
    const startTime = Date.now();
    const expiry = Number(this.getExpiresIn());
    //const expiry = this.getExpiresIn();
    localStorage.setItem(this.ID_TOKEN_EXPIRY_TIME, ""+(startTime + expiry));
  }

  setRefreshTokenExpiry(){
    const startTime = Date.now();
    localStorage.setItem(this.REFRESH_TOKEN_EXPIRY_TIME, startTime + this.refreshTokenAge);
  }
  search(url: string, term: string) {
    if (term === '') {
      return of([]);
    }
    return this.http
      .get(url + term).pipe(
        map((response) => {
          return response;
          //console.log(response);
        })
      );
  }
  setResetNewPasswordSession(session:any){
    localStorage.setItem('RESET_PASS_SESSION',session);
  }
  getResetNewPasswordSession(){
    const session = localStorage.getItem('RESET_PASS_SESSION');
    return session;
  }
  searchPostMethod(url: string, payload: any) {
    if (payload === '') {
      return of([]);
    }
    return this.http
      .post(url, payload).pipe(
        map((response) => {
          return response;
          //console.log(response);
        })
      );
  }
  // setPackaging(cartData:any) {
  //   switch (cartData.type) {
  //     case 'TAB': this.packDetails.packing = 'Packing : 1 strip (' + cartData.packing + ' Tablets Each)';
  //       this.packDetails.unit = 'Strip(s)';
  //       break;
  //     case 'SYP': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Syrup Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'LOT': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Lotion Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'INJ': this.packDetails.packing = 'Packing : 1 Vial (' + cartData.packing + ' Injection Each)';
  //       this.packDetails.unit = 'Vial(s)';
  //       break;
  //     case 'POWD': this.packDetails.packing = 'Packing : 1 Box (' + cartData.packing + ' Powder Each)';
  //       this.packDetails.unit = 'Box(es)';
  //       break;
  //     case 'CAP': this.packDetails.packing = 'Packing : 1 strip (' + cartData.packing + ' Capsule Each)';
  //       this.packDetails.unit = 'Strip(s)';
  //       break;
  //     case 'SACH': this.packDetails.packing = 'Packing : 1 Packet (' + cartData.packing + ' Sachet Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'INH': this.packDetails.packing = 'Packing : 1 Box (' + cartData.packing + ' Inhaler Each)';
  //       this.packDetails.unit = 'Box(es)';
  //       break;
  //     case 'ROTO': this.packDetails.packing = 'Packing : 1 Box (' + cartData.packing + ' Redicaps Each)';
  //       this.packDetails.unit = 'Box(es)';
  //       break;
  //     case 'E/DR': this.packDetails.packing = 'Packing : 1 Packet (' + cartData.packing + ' Eye Drop Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'EDRP': this.packDetails.packing = 'Packing : 1 Packet (' + cartData.packing + ' Eye Drop Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'OINT': this.packDetails.packing = 'Packing : 1 Tube (' + cartData.packing + ' Ointment Each)';
  //       this.packDetails.unit = 'Tube(s)';
  //       break;
  //     case 'OIL': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'SOAP': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Pack(s)';
  //       break;
  //     case 'FWSH': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Pack(s)';
  //       break;
  //     case 'DRP': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Pack(s)';
  //       break;
  //     case 'JELY': this.packDetails.packing = 'Packing : 1 Packet (' + cartData.packing + ' Jelly Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'CREM': this.packDetails.packing = 'Packing : 1 Tube (' + cartData.packing + ' Cream Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'CRTG': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'CONER': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'CHRN': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'FLOS': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'DIAP': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'DRES': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'DRNK': this.packDetails.packing = 'Packing :1 Bottle (' + cartData.packing + ' Bottle each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'DSYP': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'DPO': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'ENM': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'EXP': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'EOINT': this.packDetails.packing = 'Packing : 1 Tube (' + cartData.packing + ' Ointment Each)';
  //       this.packDetails.unit = 'Tube(s)';
  //       break;
  //     case 'GEL': this.packDetails.packing = 'Packing : 1 Tube (' + cartData.packing + ' Gel Each)';
  //       this.packDetails.unit = 'Gel(s)';
  //       break;
  //     case 'GRGL': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'GMTR': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'HAISER': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'HWSH': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'INFN': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'VWASH': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'JAR': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'JUIC': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'KIT': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Kit Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'LBALM': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'LQD': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'MPNT': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'MWSH': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'NDRP': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'NIPLE': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'ODRPS': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'PKT': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'PFS': this.packDetails.packing = 'Packing : 1 Syringe (' + cartData.packing + ' Syringe Each)';
  //       this.packDetails.unit = 'Syringe(s)';
  //       break;
  //     case 'RPSLS': this.packDetails.packing = 'Packing : 1 Respule (' + cartData.packing + ' Respule Each)';
  //       this.packDetails.unit = 'Respule(s)';
  //       break;
  //     case 'ROLL': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'SACH': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'SCRUB': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'SHAMP': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'SLTN': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'SPRY': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'TPAST': this.packDetails.packing = 'Packing : 1 Paste (' + cartData.packing + ' Paste Each)';
  //       this.packDetails.unit = 'Paste(s)';
  //       break;
  //     case 'VACC': this.packDetails.packing = 'Packing : 1 Vaccine (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Paste(s)';
  //       break;
  //     case 'VTAB': this.packDetails.packing = 'Packing : 1 Tablet (' + cartData.packing + ' Tablet Each)';
  //       this.packDetails.unit = 'Tablet(s)';
  //       break;
  //     case 'WIPS': this.packDetails.packing = 'Packing : 1 Wipes (' + cartData.packing + ' Wipes Each)';
  //       this.packDetails.unit = 'Wipe(s)';
  //       break;
  //     case 'TULL': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'TBAG': this.packDetails.packing = 'Packing : 1 Pack (' + cartData.packing + ' Pack Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'SYRNEE': this.packDetails.packing = 'Packing : 1 Pack Syringe (' + cartData.packing + ' Pack Syringe Each)';
  //       this.packDetails.unit = 'Packet(s)';
  //       break;
  //     case 'NSPRY': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;
  //     case 'RMSRP': this.packDetails.packing = 'Packing : 1 Bottle (' + cartData.packing + ' Bottle Each)';
  //       this.packDetails.unit = 'Bottle(s)';
  //       break;

  //     default: this.packDetails.packing = 'Packing : 1 strip (' + cartData.packing + ' Tablets Each)';
  //       this.packDetails.unit = 'Strip(s)';
  //   }
  //   return this.packDetails;
  // }

  setHostNameDinamically(host:string){
    localStorage.setItem(this.HOST_NAME, host);
  }

  getHostNameDinamically(){
    return localStorage.getItem(this.HOST_NAME);
  }
  getLogoPath(){
    let projectFolderName = this.getApplicationValueByKey('folder')
    return 'assets/img/logo/' + projectFolderName + '/';
  }
  getPageTitle(){
    return this.getApplicationValueByKey('title');
  }
  getVerifyType(){
    return this.getApplicationValueByKey('varify_mode');
  }
  getPageThmem(){
    return this.getApplicationValueByKey('theme');
  }
  getTemplateName(){
    return this.getApplicationValueByKey('temp_name');
  }
  getTeamName(){
    return this.getApplicationValueByKey('teamname');
  }

  getBucketName(){
    return this.getApplicationValueByKey('bucket');
  }
  getAuthenticationSetting(){
    return this.getApplicationValueByKey('authenticationSettings');
  }
  getAdminEmail(){
    let authenticationSettings:any = this.getAuthenticationSetting();
    let adminEmail = "";
    if(authenticationSettings && authenticationSettings['adminEmailId'] && authenticationSettings['adminEmailId'] != ""){
      adminEmail = authenticationSettings['adminEmailId'];
    }
    return adminEmail;
  }
  getApplicationValueByKey(key:any){
    let value = "";
    let applicationSetting = this.getApplicationSetting();
    if(applicationSetting && applicationSetting[key] != undefined && applicationSetting[key] != null && applicationSetting[key] != ""){
      value = applicationSetting[key];
    }
    return value;
  }
  // for App
  setClientNAme(name:string){
    localStorage.setItem(this.CLIENT_NAME,name);
  }
  getClientName(){
    return localStorage.getItem(this.CLIENT_NAME);
  }
  removeKeyFromStorage(key:string){
    localStorage.removeItem(key);
  }
  getPlatform(){
    return this.env.plateformName;
  }
  getClientCodeEnviorment(){
    return this.env;
  }
  checkPlatForm(){
    let platForm = 'web';
    let platFormName = this.getPlatform();
    if(platFormName && platFormName != "" && PLATFORM_NAME.includes(platFormName)){
      platForm = 'mobile';
    }
    return platForm;
  }

  getDefaultNumOfItem() {
    let itemNumOfGrid = Common.ITEM_NUM_OF_GRID;
    let defaultSettings = this.getApplicationDefaultSettings();
    if(defaultSettings && defaultSettings.defaultItemNoOfGrid && defaultSettings.defaultItemNoOfGrid != "" && defaultSettings.defaultItemNoOfGrid > 0) {
      itemNumOfGrid = defaultSettings.defaultItemNoOfGrid;
    }
    return itemNumOfGrid
  }

  getApplicationDefaultSettings(){
    let applicationSetting = this.getApplicationSetting();
    return applicationSetting.defaultApplicationSettings;
  }
  getApplicationAuthenticationSettings(){
    let applicationSetting = this.getApplicationSetting();
    if(applicationSetting && applicationSetting.authenticationSettings){
      return applicationSetting.authenticationSettings;
    }else{
      return null;
    }

  }
  getTwoFactorAuthenticationType(){
    let authenticationSetting = this.getApplicationAuthenticationSettings();
    if(authenticationSetting && authenticationSetting.twoFactorAuthentication && authenticationSetting.twoFactorAuthenticationType){
      return authenticationSetting.twoFactorAuthenticationType;
    }else{
      return null;
    }
  }


  getDefaultSearchOperator() {
    let defaultSearchOperator = Common.DEFAULT_OPERATOR;
    let defaultSettings = this.getApplicationDefaultSettings();
    if(defaultSettings && defaultSettings.defaultSearchOperatorInGrid && defaultSettings.defaultSearchOperatorInGrid != "") {
      defaultSearchOperator = defaultSettings.defaultSearchOperatorInGrid;
    }
    return defaultSearchOperator;
  }
  storeAllTemplate(data:any){
    // let encryptData = this.encryptionService.encryptRequest(data);
    // console.log(encryptData);
    let modifiedList = this.modifyTemplateList(data);
    if(modifiedList){
      localStorage.setItem(this.ALL_TEMPLATE,JSON.stringify(modifiedList.templatList));
      localStorage.setItem(this.TEMPLATE_INDEX,JSON.stringify(modifiedList.templateIndexList));
    }
  }
  modifyTemplateList(obj:any){
    let list:any = {};
    let indexList:any = [];
    let oldList = this.getAllTemplateList();
    let allIndexList = JSON.parse(<any>localStorage.getItem(this.TEMPLATE_INDEX));
    if(allIndexList && allIndexList.length > 0){
      indexList = allIndexList;
    }
    if(oldList && Object.keys(oldList).length > 0){
      let size:number = this.coreFunctionService.getJsonSizeInKilobyte(oldList);
      // console.log(size);
      if(size >= 1024){
        let keyName = indexList[0];
        delete (oldList[keyName]);
        indexList.splice(0,1);
      }
      list = oldList;
    }else{
      list = {};
    }
    if(obj && obj){
      Object.keys(obj).forEach(key => {
        list[key] = obj[key];
        indexList.push(key);
      })
    }
    let responce = {
      templatList : list,
      templateIndexList:indexList
    }
    return responce;
  }
  getAllTemplateList(){
    //let allTemplate = localStorage.getItem(this.ALL_TEMPLATE);
    const obj:any = JSON.parse(<any>localStorage.getItem(this.ALL_TEMPLATE));
    //return this.encryptionService.decryptRequest(allTemplate);
    return obj;
  }
  getTemplate(tempName:string,moduleName:string){
    let templateList:any = this.getAllTemplateList();
    //console.log(templateList);
    if(templateList && templateList[tempName]){
      let name = moduleName+"_"+tempName;
      return templateList[name];
    }else{
      return null;
    }
  }

}
