import { Injectable,EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PublicDataShareService {

  saveContactUsData:Subject<any> = new Subject();
  saveCarrerWithUsData: Subject<any> = new Subject();
  staticData: Subject<any> = new BehaviorSubject<any>(null);

  constructor() { }

  setContactUsData(responce: Object){
    this.saveContactUsData.next(responce);
  }
  setCarrerwithUs(responce: Object){
    this.saveCarrerWithUsData.next(responce);
  }



}
