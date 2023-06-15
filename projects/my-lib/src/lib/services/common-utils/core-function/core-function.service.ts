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
}
