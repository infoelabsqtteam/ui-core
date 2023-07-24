import { EventEmitter, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CommonDataShareService {

  moduleList : any = [];
  moduleIndex:any = -1;
  tabIndex:any=-1;
  parentRouting:any = '';
  formId:any = '';
  
  shareCardList:EventEmitter<any> = new EventEmitter<any>();
  cardList:any = [];
  nestedCardId:any = '';
  nestedCard:EventEmitter<any> = new EventEmitter<any>();
  multipleCardCollection:any=[];

  constructor() { }


  setModuleList(modules:any){
    this.moduleList = modules;
  }
  getModuleList(){
    return this.moduleList;
  }
  resetModuleList(){
    this.moduleList = [];
  }
  setModuleIndex(index:any){
    this.moduleIndex = index;
  }
  getModuleIndex(){
    return this.moduleIndex;
  }
  setSelectedTabIndex(index:any){
    this.tabIndex = index;
  }
  getSelectdTabIndex(){
    return this.tabIndex;
  }
  setParentRouting(routeLink:any){
    this.parentRouting = routeLink
  }
  getParentRouting(){
    return this.parentRouting;
  }
  setFormId(id:any){
    this.formId = id;
  }
  getFormId(){
    return this.formId;
  }
  sharecardlist(cardList:any){
    this.shareCardList.emit(cardList);
  }
  setCardList(value:any){
    this.cardList=value;
  }
  getCardList(){
    return this.cardList;
  }
  setNestedCardId(id:any){
    this.nestedCardId=id;
  }
  getNestedCardId(){
    return this.nestedCardId;
  }
  setNestedCard(responce:any){
    this.nestedCard.emit(responce);
  }
  setMultipleCardCollection(response:any){
    this.multipleCardCollection=response;
  }
  getMultipleCardCollection(){
    return this.multipleCardCollection;
  }
}
