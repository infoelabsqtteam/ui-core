import { Inject, Injectable } from "@angular/core";
import { Location,DOCUMENT } from '@angular/common';

@Injectable({
  providedIn:"root"
})


export class RouterService {

  constructor(
    private _location:Location,
    @Inject(DOCUMENT) private document: Document
  ){

  }
  updateRouteUrl(selectedRowIndex:number,elements:any,currentBrowseUrl:any){
    let responce = {
      "currentBrowseUrl":currentBrowseUrl
    }
    let record = "";
    if(selectedRowIndex != -1){
      record = elements[selectedRowIndex];
    }
    let routeQuery = '';
    let routeQueryCriteri = ['serialId'];
    responce.currentBrowseUrl = this.getCurrentBrowseUrl();
    if(record != ""){
      let queryList:any = [];
      routeQueryCriteri.forEach((criteria:any) => {
        if(record && record[criteria]){
          const query = criteria+"="+record[criteria];
          queryList.push(query);
        }
      });
      if(queryList && queryList.length > 0){
        queryList.forEach((query:any,i:any) =>{
          if(i == 0){
            routeQuery = routeQuery + query;
          }else {
            routeQuery = routeQuery +"&"+ query;
          }
        })
      }
      if(routeQuery && routeQuery != ''){
        this._location.go(responce.currentBrowseUrl+"?"+routeQuery);
      }else {
        this._location.go(responce.currentBrowseUrl);
      }
    }else{
      let routUrl = responce.currentBrowseUrl;
      if(responce.currentBrowseUrl != ''){
        let url = responce.currentBrowseUrl.split('?');
        if(url && url.length > 0){
          routUrl = url[0];
        }
      }
      this._location.go(routUrl);
      responce.currentBrowseUrl = "";
    }
    return responce;
  }

  getCurrentBrowseUrl(){
    //return this.document.location.hash.substring(1);
    return this.document.location.pathname;
  }
}
