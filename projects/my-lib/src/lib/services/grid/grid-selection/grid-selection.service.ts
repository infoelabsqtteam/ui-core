import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GridSelectionService {

  constructor() { }
  toggle(index:any,checked:any,field:any,staticData:any,custmizedFormValue:any) {
    let responce = {
      staticData:staticData,
      custmizedFormValue:custmizedFormValue
    }
    if (checked) {
      responce.staticData[field.ddn_field][index].selected=true;
    } else {
      responce.staticData[field.ddn_field][index].selected=false;
    }
    responce.custmizedFormValue[field.field_name] = [];
    responce.staticData[field.ddn_field].forEach((element:any) => {
      if(element.selected){
        responce.custmizedFormValue[field.field_name].push(element);
      }
    });
    return responce;
  }
  isIndeterminate(ddn_field:any,staticData:any) {
    let check = 0;
    if(staticData[ddn_field].length > 0){
      staticData[ddn_field].forEach((row:any) => {
        if(row.selected){
          check = check + 1;
        }
      });
    }
    return (check > 0 && !this.isChecked(ddn_field,staticData));
  };
  isChecked(ddn_field:any,staticData:any) {
    let check = 0;
    if(staticData[ddn_field].length > 0){
      staticData[ddn_field].forEach((row:any) => {
        if(row.selected){
          check = check + 1;
        }
      });
    }
    return staticData[ddn_field].length === check;
  };
  toggleAll(checked:any,field:any,staticData:any,custmizedFormValue:any) {
    let responce = {
      staticData:staticData,
      custmizedFormValue:custmizedFormValue
    }
    if (checked ) {
      if(responce.staticData[field.ddn_field].length > 0){
        responce.staticData[field.ddn_field].forEach((row:any) => {
          row.selected=true;
        });
      }
    }else{
      if(responce.staticData[field.ddn_field].length > 0){
        responce.staticData[field.ddn_field].forEach((row:any) => {
          row.selected=false;
        });
      }
    }
    responce.custmizedFormValue[field.field_name] = [];
    responce.staticData[field.ddn_field].forEach((element:any) => {
      if(element.selected){
        responce.custmizedFormValue[field.field_name].push(element);
      }
    });
    return responce;
  }

}
