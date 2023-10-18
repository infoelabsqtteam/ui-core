import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonFunctionService } from '../common-utils/common-function.service';

@Injectable({
  providedIn: 'root'
})
export class CheckIfService {

  constructor(
    private commonFunctionService:CommonFunctionService
  ) { }
  checkIsDisable(parent:any,chield:any,updateMode:boolean,formValue:any,templateForm:FormGroup){
    let responce = {
      tobedesabled:'',
      templateForm:templateForm
    }
    if(parent == ''){
      responce.tobedesabled = this.commonFunctionService.isDisable(chield,updateMode,formValue)
      if(responce.tobedesabled){
        if(!responce.templateForm.controls[chield.field_name].disabled){
          responce.templateForm.controls[chield.field_name].disable()
        }
      }else{
        if(responce.templateForm.controls[chield.field_name].disabled){
          responce.templateForm.controls[chield.field_name].enable()
        }
      }
    }else{
      responce.tobedesabled = this.commonFunctionService.isDisable(chield,updateMode,formValue)
      if(responce.tobedesabled){
        (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].disable()
      }else{
        (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].enable()
      }
    }
    return responce;
  }
  checkIsMendetory(parent:any,chield:any,formValue:any,templateForm:FormGroup){
    let responce = {
      tobedesabled:'',
      templateForm:templateForm
    }
    if(parent == ''){
      responce.tobedesabled = this.commonFunctionService.isMendetory(chield,formValue)
      if(responce.tobedesabled){
        if(responce.templateForm.controls[chield.field_name].status == 'VALID'){
          responce.templateForm.controls[chield.field_name].setValidators([Validators.required]);
          responce.templateForm.controls[chield.field_name].updateValueAndValidity();
        }
      }else{
        if(responce.templateForm.controls[chield.field_name].status == 'INVALID'){
          responce.templateForm.controls[chield.field_name].clearValidators();
          responce.templateForm.controls[chield.field_name].updateValueAndValidity();
        }
      }
    }else{
      responce.tobedesabled = this.commonFunctionService.isMendetory(chield,formValue)
      if(responce.tobedesabled){
        if((<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].status == 'VALID'){
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].setValidators([Validators.required]);
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].updateValueAndValidity();
        }
      }else{
        if((<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].status == 'INVALID'){
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].clearValidators();
          (<FormGroup>responce.templateForm.controls[parent]).controls[chield.field_name].updateValueAndValidity();
        }
      }
    }
    return responce;
  }
  checkShowIfListOfFiedlds(parent:any,field:any,formValue:any){
    //let formValue = this.getFormValue(true);
    let fieldValue = formValue[parent];
    if(fieldValue && fieldValue.length > 0 && field && field.show_if && field.show_if != null && field.show_if != ''){
      let check = 0;
      for (let index = 0; index < fieldValue.length; index++) {
        const value = fieldValue[index];
        formValue[parent] = value;
        if(this.commonFunctionService.showIf(field,formValue)){
          check = 1;
          break;
        }
      }
      if(check == 1){
        return false;
      }else{
        return true;
      }
    }else{
      return false;
    }
  }
  checkAddNewButtonOnGridSelection(buttons:any){
    let check = false;
    if(buttons && buttons.length >0){
        for (let i = 0; i < buttons.length; i++) {
          const btn = buttons[i];
          if(btn && btn.onclick && btn.onclick.api && btn.onclick.api == "save"){
            check = true;
            break;
          }
        }
    }
    return check;
  }
  checkFieldShowOrHide(field:any,showIfFieldList:any){
    let check = false;
    for (let index = 0; index < showIfFieldList.length; index++) {
      const element = showIfFieldList[index];
      if(element.field_name == field.field_name){
        if(element.show){
          check = true;
          break;
        }else{
          check=false;
          break;
        }
      }

    }
    return check;
  }
  checkDublicateOnForm(fields:any,value:any,list:any,i:any,showIfFieldList:any,custmizedFormValue:any,templateForm:FormGroup,parent?:any){
    let checkDublic = {
      status : false,
      msg : ""
    }
    if(fields && fields.length > 0){
      let checkValue = 0;
      let field_control:any = "";
      let list_of_field_data = value;
      for (let index = 0; index < fields.length; index++) {
        const element = fields[index];
        let custmizedKey = '';
        let custmizedData = '';
        if(parent && parent != ''){
          custmizedKey = this.commonFunctionService.custmizedKey(parent);
          field_control = templateForm.controls[parent.field_name];
        }
        if(custmizedKey && custmizedKey != '' && custmizedFormValue[custmizedKey] && custmizedFormValue[custmizedKey][element.field_name]){
          custmizedData = custmizedFormValue[custmizedKey][element.field_name]
        }else{
          if(custmizedFormValue[element.field_name] && custmizedFormValue[element.field_name].length > 0){
            custmizedData = custmizedFormValue[element.field_name]
          }
        }
        let mendatory = false;
        if(element.is_mandatory){
          if(element && element.show_if && element.show_if != ''){
            if(this.checkFieldShowOrHide(element,showIfFieldList)){
              mendatory = true;
            }else{
              mendatory = false;
            }
          }else{
            mendatory = true;
          }
        }
        switch (element.datatype) {
          case 'list_of_object':
            if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
              if(mendatory && custmizedData == ''){
                if(custmizedData.length == 0){
                  checkValue = 1;
                  checkDublic.status = true
                  checkDublic.msg = "Please Enter " + element.label;
                  //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                  return checkDublic;
                }
              }
            }else{
              checkDublic.status = true
              checkDublic.msg = 'Entered value for '+element.label+' is not valid. !!!';
              //this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
              return checkDublic;
            }
            break;
          case 'object':
            if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
              if(mendatory){
                checkValue = 1;
                checkDublic.status = true
                checkDublic.msg = "Please Enter " + element.label;
                //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                return checkDublic;
              }
            }else if(typeof list_of_field_data[element.field_name] != 'object'){
              checkDublic.status = true
              checkDublic.msg = 'Entered value for '+element.label+' is not valid. !!!';
              //this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
              return checkDublic;
            }
            break;
          default:
            break;
        }
        switch (element.type) {
          case 'list_of_string':
            if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
              if(mendatory && custmizedData == ''){
                if(custmizedData.length == 0){
                  checkValue = 1;
                  checkDublic.status = true
                  checkDublic.msg = "Please Enter " + element.label;
                  //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                  return checkDublic;
                }
              }
            }else{
              checkDublic.status = true
              checkDublic.msg = 'Entered value for '+element.label+' is not valid. !!!';
              //this.notificationService.notify('bg-danger','Entered value for '+element.label+' is not valid. !!!');
              return checkDublic;
            }
            break;
          case 'typeahead':
            if(element.datatype == "text"){
              if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
                if(mendatory){
                  if(custmizedData.length == 0){
                    checkValue = 1;
                    checkDublic.status = true
                    checkDublic.msg = "Please Enter " + element.label;
                    //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
                    return checkDublic;
                  }
                }
              }else if(field_control && field_control != "" ){
                if( field_control.get(element.field_name).errors?.required || field_control.get(element.field_name).errors?.validDataText){
                  checkDublic.status = true
                  checkDublic.msg = 'Entered value for '+element.label+' is invalidData. !!!';
                  //this.notificationService.notify('bg-danger','Entered value for '+element.label+' is invalidData. !!!');
                  return checkDublic;
                }
              }

            }
            break;
          default:
            if (list_of_field_data[element.field_name] == '' || list_of_field_data[element.field_name] == null) {
              if(mendatory ){
                checkValue = 1;
                checkDublic.msg = "Please Enter " + element.label;
                //this.notificationService.notify("bg-danger", "Please Enter " + element.label);
              }
            }
            break;
        }
        if(element.primary_key_for_list){
          let primary_key_field_value = value[element.field_name];
          let alreadyAdded = {
            status : false,
            msg : ""
          };
          if(list && list.length > 0){
            alreadyAdded = this.commonFunctionService.checkDataAlreadyAddedInListOrNot(element,primary_key_field_value,list,i);
          }
          if(alreadyAdded && alreadyAdded.status){
            checkDublic.status = true;
            if(alreadyAdded.msg && alreadyAdded.msg != ""){
              checkDublic.msg = alreadyAdded.msg;
            }else{
              checkDublic.msg = "Entered value for "+element.label+" is already added. !!!";
            }
            break;
          }
        }
      };
      if (checkValue == 1) {
        checkDublic.status = true;
      }
    }
    return checkDublic;
  }

}
