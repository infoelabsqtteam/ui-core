import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DataShareService } from '../../data-share/data-share.service';
import { EnvService } from '../../env/env.service';

@Injectable({
  providedIn: 'root'
})
export class CommonApiService {

  constructor(
    private dataShareService:DataShareService,
    private http:HttpClient,
    private envService:EnvService,
  ) { } 

  SaveNavigation(payload:object){
    let api = this.envService.getApi('SAVE_NAVIGATION');
    this.http.post(api, payload).subscribe(
      (respData) => {
          console.log(respData)
        },
      (error) => {
          console.log(error);
        }
    ) 
  }

  GetNavigation(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setNavigationData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }

  SavePermission(payload:object){
    let api = this.envService.getApi('SAVE_PERMISSION');
    this.http.post(api, payload).subscribe(
      (respData) => {
          //this.dataShareService.setNavigationData(respData);
          console.log(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  GetPermission(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setPermissionData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  SaveInformation(payload:object){
    let api = this.envService.getApi('SAVE_QUOTE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setQuoteData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  ResetSave(){
    this.dataShareService.setQuoteData(null);
  }
  GetDepartments(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setDepartmentData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  
  GetCategory(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setCategoryData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  GetProductsByCategory(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setProductData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  GetTestParameter(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.setTestParameter(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  
}
