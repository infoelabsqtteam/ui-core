import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiCallResponceService {

  constructor() { }

  checkOnSuccessAction(currentActionButton:any,forms:any){
    let responce ={
      actionValue : '',
      index : -1
    }

    if(currentActionButton.onclick && currentActionButton.onclick != null && currentActionButton.onclick.action_name && currentActionButton.onclick.action_name != null){
      if(currentActionButton.onclick.action_name != ''){
        responce.actionValue = currentActionButton.onclick.action_name;
        if(responce.actionValue != ''){
          Object.keys(forms).forEach((key,i) => {
            if(key == responce.actionValue){
              responce.index = i;
            }
          });
        }
      }
    }
    return responce;
  };


}
