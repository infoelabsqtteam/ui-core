import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, tap, switchMap } from 'rxjs/operators';
import { StorageTokenStatus } from '../../shared/enums/storage-token-status.enum';
import { EnvService } from '../env/env.service';



@Injectable({
  providedIn: 'root'
})
export class StorageService {
  ID_TOKEN: string = 'ID_TOKEN';
  ACCESS_TOKEN: string = 'ACCESS_TOKEN';
  REFRESH_TOKEN: string = 'REFRESH_TOKEN';
  RESET_PASS_SESSION:string = 'RESET_PASS_SESSION';
  // EXPIRY_IN:any=86400;
  EXPIRY_IN:any= 'EXPIRY_IN';
  USER_KEY: string = 'USER';
  ACTIVE_MENU: string = 'MENU';
  ID_TOKEN_EXPIRY_TIME: string = 'ID_TOKEN_EXPIRY_TIME';
  REFRESH_TOKEN_EXPIRY_TIME:string='REFRESH_TOKEN_EXPIRY_TIME';
  userInfo: any;
  log: any;
  age:any=3540000; //59 minuts 
  refreshTokenAge:any=2505600000 //refresh token age 29 days
  appName:any;
  
  constructor(private http: HttpClient,private envService:EnvService) { 
    this.appName = this.envService.getAppName();
  }

  setAppId(appId:string){
    localStorage.setItem('appId', appId);
  }

  getAppId(){
    return localStorage.getItem('appId');
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
    const setTokenObj:{ [key: string]: any[] } = {};
    setTokenObj[this.appName] = token
    localStorage.setItem(this.ID_TOKEN, JSON.stringify(setTokenObj))
    //this.setIdTokenExpiry();
  }
  GetIdToken() {  
    let id_token = localStorage.getItem(this.ID_TOKEN);
    if(this.IsJsonString(id_token)){
      let obj = localStorage.getItem(this.ID_TOKEN);      
      if(obj && obj != null && JSON.parse(obj)[this.appName]){
        return JSON.parse(obj)[this.appName];
      }else{
        return null;
      }
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
    const setAccessTokenObj:{ [key: string]: any[] } = {};
    setAccessTokenObj[this.appName] = token
    localStorage.setItem(this.ACCESS_TOKEN, JSON.stringify(setAccessTokenObj));
  }
  GetAccessToken() {  
    if(this.IsJsonString(localStorage.getItem(this.ACCESS_TOKEN))){ 
      let obj:any = localStorage.getItem(this.ACCESS_TOKEN);
      if(obj && JSON.parse(obj)[this.appName]){
          return (JSON.parse(obj)[this.appName]);
      }
    }else{
      return null;
    }  
  }
  SetRefreshToken(token: string) {
    localStorage.setItem(this.REFRESH_TOKEN, token);
    this.setRefreshTokenExpiry();
  }
  GetRefreshToken() {    
    return localStorage.getItem(this.REFRESH_TOKEN);
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
        return StorageTokenStatus.ID_TOKEN_EXPIRED; // notify, due to expired
      }
      return StorageTokenStatus.ID_TOKEN_NOT_CREATED;  // first time loading so no notify   
    } else if(expiresIn24Hours > 24){
		return StorageTokenStatus.ID_TOKEN_EXPIRED; // notify, due to expired
	}
	
    return StorageTokenStatus.ID_TOKEN_ACTIVE; // not expired
  }

  
  
  GetRefreshTokenStatus(){
    let expired = 0;
    let expireTime = Number(localStorage.getItem(this.REFRESH_TOKEN_EXPIRY_TIME));
    let currentTime = Date.now();
    if(currentTime > expireTime){     
      if(expireTime > 0){        
        return StorageTokenStatus.REFRESH_TOKEN_EXPIRED; // notify, due to expired
      } 
      return StorageTokenStatus.REFRESH_TOKEN_NOT_CREATED;  // first time loading so no notify   
    }
    return StorageTokenStatus.REFRESH_TOKEN_ACTIVE; // not expired
  }

  SetUserInfo(user: any) {
    const userObj:{ [key: string]: any[] } = {};
    userObj[this.appName] = user;
    localStorage.setItem(this.USER_KEY, JSON.stringify(userObj));
  }
  GetUserInfo() {
    const obj:any = localStorage.getItem(this.USER_KEY);
    if(obj && JSON.parse(obj)[this.appName]){
      if(JSON.parse(obj)[this.appName]['user']){
        return JSON.parse(obj)[this.appName]['user']
      }
      else{
        return null;
      }
    }
  }
  GetPermission() {
    const obj:any = localStorage.getItem(this.USER_KEY);
    if(obj && JSON.parse(obj)[this.appName]){
      if(JSON.parse(obj)[this.appName]['permission']){
        return JSON.parse(obj)[this.appName]['permission']
      }
      else{
        return null;
      }
    }
  }
  GetModules(){
    const obj:any = localStorage.getItem(this.USER_KEY);
    if(obj && JSON.parse(obj)[this.appName]){
      if(JSON.parse(obj)[this.appName]['modules']){
        return JSON.parse(obj)[this.appName]['modules']
      }
      else{
        return null;
      }
    }    
  }
  GetMenuType(){
    const obj:any = localStorage.getItem(this.USER_KEY);
    if(obj && JSON.parse(obj)[this.appName]){
      if(JSON.parse(obj)[this.appName].menu_type){
        return JSON.parse(obj)[this.appName].menu_type
      }
      else{
        return null;
      }
    }    
  }
  getUserLog() {
    const userObj:any = localStorage.getItem(this.USER_KEY);
    if(userObj && JSON.parse(userObj)[this.appName]){
      const user = JSON.parse(userObj)[this.appName];
      if(user && user != null && user != undefined && user.user){
        this.userInfo = user.user;
        this.log = { userId: this.userInfo.email, appId: this.getAppId(), refCode: this.userInfo.refCode };
        return this.log;
      }else{
        return null;
      } 
    }
      

  }
  SetActiveMenu(menu: any) {
    const menuObj:{ [key: string]: any[] } = {};
    menuObj[this.appName] = menu;
    localStorage.setItem(this.ACTIVE_MENU, JSON.stringify(menuObj));
  }
  GetActiveMenu() {
    let obj:any = localStorage.getItem(this.ACTIVE_MENU);
    if(obj && JSON.parse(obj)[this.appName]){
      const menu = (JSON.parse(obj)[this.appName]);
      return menu;
    } 
    // const menu = JSON.parse(localStorage.getItem(this.ACTIVE_MENU));
    // return menu;
  }
  getRefCode() {
    return this.GetUserInfo().refCode;
  }
  removeDataFormStorage() {
    localStorage.clear();
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
}
