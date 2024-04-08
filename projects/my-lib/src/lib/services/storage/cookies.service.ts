import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CookiesService {

  constructor() { }

  // Create (or) Update value of cookie by Name
  setCookieByName(cname:string, cvalue:string, exdays=30) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    let expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
  }
  
  // Get value of cookie by Name
  getCookieByName(cname:string) {
    let name = cname + "=";
    let ca = document.cookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  
  //Delete the value of a cookie
  deleteCookieByName(name: string): void {
    this.setCookieByName(name, "", -1);
  }

  //Delete all cookies
  deleteAllCookies() {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        this.setCookieByName(cookie, "", -1);        
    }
  }

  
  //Check the cookie present or not
  isCookieExpired(cName: string): boolean {
    const cookieValue = this.getCookieByName(cName);
    if (cookieValue && cookieValue!='' ) {
        return false;
    }
    return true;
  } 


}