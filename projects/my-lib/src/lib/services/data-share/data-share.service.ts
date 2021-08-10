import { Injectable,EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {

  
  sharedData:any;
  onGetData: EventEmitter<any> = new EventEmitter();

  constructor() { }

  sendData(responce:any) {    
    this.onGetData.emit(responce);
  }
  getData(){
    return this.onGetData;
  }
}
