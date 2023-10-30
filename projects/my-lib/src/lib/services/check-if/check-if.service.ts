import { StorageService } from './../storage/storage.service';
import { Injectable } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { CommonFunctionService } from '../common-utils/common-function.service';

@Injectable({
  providedIn: 'root'
})
export class CheckIfService {

  constructor(
    private commonFunctionService:CommonFunctionService,
    private storageService:StorageService
  ) { }
  checkIsDisable(parent:any,chield:any,updateMode:boolean,formValue:any,templateForm:FormGroup){
    let responce = {
      tobedesabled:'',
      templateForm:templateForm
    }
    if(parent == ''){
      responce.tobedesabled = this.isDisable(chield,updateMode,formValue)
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
      responce.tobedesabled = this.isDisable(chield,updateMode,formValue)
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
      responce.tobedesabled = this.isMendetory(chield,formValue)
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
      responce.tobedesabled = this.isMendetory(chield,formValue)
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
        if(this.showIf(field,formValue)){
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
            alreadyAdded = this.checkDataAlreadyAddedInListOrNot(element,primary_key_field_value,list,i);
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
  isGridFieldExist(tab:any,fieldName:any){
    if(tab.grid && tab.grid[fieldName] && tab.grid[fieldName] != undefined && tab.grid[fieldName] != null && tab.grid[fieldName] != ''){
    return true;
    }
    return false;
  }
  checkShowIf(field:any,selectedRow:any,formValue:any){
    const  objectc = selectedRow?selectedRow:{}
    const object = JSON.parse(JSON.stringify(objectc));
    if(formValue && typeof formValue == 'object' && Object.keys(formValue).length > 0){
      Object.keys(formValue).forEach(key => {
        object[key] = formValue[key];
      })
    }
    const display = this.showIf(field,object);
    const modifiedField = JSON.parse(JSON.stringify(field));
    modifiedField['display'] = display;
    field = modifiedField;
    return display;
  }
  showIf(field:any, formValue:any) {
    if (field.show_if && field.show_if != null && field.show_if != '') {
      const showIf = field.show_if.split(';')
      let checkIf = true;
      for (let index = 0; index < showIf.length; index++) {
        checkIf = this.checkIfConditionForArrayListValue(showIf[index], formValue);
        if (!checkIf) {
          return;
        }
      }
      if (checkIf) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }
  checkIfConditionForArrayListValue(data:any, formValue:any){
    let condition = []
    condition = data.split('#');
    if (condition.length == 4 && condition[3] != 'dynamic' && condition[3] != 'STATIC') {
      let check = "";
      let checkList = [];
      let setValue = formValue ? this.commonFunctionService.getObjectValue(condition[0], formValue) : "";
      if(setValue && setValue.length > 0){
        for (let index = 0; index < setValue.length; index++) {
          const element = setValue[index];
          let value = this.commonFunctionService.getObjectValue(condition[3],element);
          if(value && value != ''){
            check = check + value + "#";
            for (let index = 0; index < condition.length; index++) {
              const conditons = condition[index];
              if(index == 1){
                check = check + conditons + '#';
              }else if(index == 2){
                check = check + conditons + '#STATIC';
              }
            }
            checkList.push(check);
            check = "";
          }else{
            return false;
          }
        }
      }else{
        return false;
      }
      if(checkList && checkList.length > 0){
        for (let index = 0; index < checkList.length; index++) {
          const condition = checkList[index];
          let result = this.checkIfCondition(condition,formValue);
          if(result){
            return true;
          }
        }
        return false;
      }else{
        return false;
      }
    }else{
      return this.checkIfCondition(data,formValue);
    }

  }


  isDisable(tableField:any, updateMode:any, formValue:any) {
    if (tableField.is_disabled) {
      return true;
    } else {
      if (tableField.disable_if && tableField.disable_if != '') {
        return this.checkIfCondition(tableField.disable_if, formValue)
      }

      if (updateMode) {
        if (tableField.disable_on_update != undefined && tableField.disable_on_update) {
          return this.checkAddUpdateIf(tableField,'can_update_if');
        } else {
          return false;
        }
      } else {
        if (tableField.disable_on_add != undefined && tableField.disable_on_add) {
          return this.checkAddUpdateIf(tableField,'can_add_if');
        }else{
          return false;
        }
      }
    }
  }
  is_check_role(id: any) {
    const userInfo = this.storageService.GetUserInfo();
    let check = 0;
    if (userInfo.roles && userInfo.roles != null && userInfo.roles != "" && this.commonFunctionService.isArray(userInfo.roles) && userInfo.roles.length > 0) {
      for (let index = 0; index < userInfo.roles.length; index++) {
        const element = userInfo.roles[index];
        if (element._id == id) {
          check = 1;
          break;
        } else {
          check = 0;
        }
      }
    } else {
      check = 0;
    }
    if(check == 1){
      return true;
    }else{
      return false;
    }
  }
  isMendetory(tableField:any, formValue:any) {
    if (tableField.is_mandatory) {
      return true;
    } else {
      if (tableField.mandatory_if && tableField.mandatory_if != '') {
        return this.checkIfCondition(tableField.mandatory_if, formValue)
      }else {
        return false;
      }
    }
  }

  checkIfCondition(data:any, formValue:any,datatype?:any) {
    let condition = []
    condition = data.split('#')
    if (condition.length >= 2) {
      if(condition[3] != null && condition[3] != "" && condition[3] == 'dynamic'){
        condition[2] = this.commonFunctionService.getObjectValue(condition[2], formValue)+"";
      }
      let setValue:any = "";
      if(condition.length > 3 && condition[3] == 'STATIC'){
        setValue = condition[0];
      }else{
        setValue = formValue ? this.commonFunctionService.getObjectValue(condition[0], formValue) : "";
      }
      if (setValue === undefined || setValue === "") {
        setValue = "";
      } else {
        setValue = setValue + "";
      }
      if(datatype){
        switch (datatype) {
          case "date":
            setValue = this.commonFunctionService.dateFormat(setValue);
            condition[2] = this.commonFunctionService.dateFormat(condition[2]);
            break;
          default:
            break;
        }
      }
      switch (condition[1]) {
        case 'eq':
        case 'equal':
          if (condition.length > 2) {
            //console.log('setValue');
            return setValue === condition[2];
          } else {
            return JSON.parse(setValue);
          }
        case 'in':
          if ((condition[2].split(":")).includes(setValue)) {
            return true;
          } else {
            return false;
          }
          case 'nin':
            if (!(condition[2].split(":")).includes(setValue)) {
              return true;
            } else {
              return false;
            }


        case 'gte':
          return parseFloat(setValue) >= parseFloat(condition[2]);
        case 'lte':
          return parseFloat(setValue) <= parseFloat(condition[2]);
        case 'exists':
          if (setValue != null && setValue != undefined && setValue != '' && setValue != 'null') {
            return true;
          } else {
            return false;
          }
        case 'notexist':
          if (setValue == null || setValue == undefined || setValue == '' || setValue == 'null') {
            return true;
          } else {
            return false;
          }
        case "neq":
        case "notequal":
          if (condition.length > 2) {
            //console.log('setValue');
            return !(setValue === condition[2]);
          } else {
            return !JSON.parse(setValue);
          }
        default:
          return false;
      }
    } else {
      return true;
    }
  }

  checkAddUpdateIf(tableField:any,fieldName:any){
    let fieldValue = tableField[fieldName];
    if (fieldValue != undefined && fieldValue.has_role != null && fieldValue.has_role != undefined && this.commonFunctionService.isArray(fieldValue.has_role) && fieldValue.has_role.length > 0) {
      let check = 0;
      for (let index = 0; index < fieldValue.has_role.length; index++) {
        const element = fieldValue.has_role[index];
        if (this.is_check_role(element._id)) {
          check = 1;
          break;
        } else {
          check = 0;
        }
      }
      if(check == 1){
        return false;
      }else{
        return true;
      }
    } else {
      return true;
    }
  }
  checkDisableRowIf(field:string,formValue:string){
    let check = false;
    if(this.checkIfCondition(field,formValue)){
      check = true;
    }else{
      check = false;
    }
    return check;
  }
  checkRowIf(data:any,field:any){
    let check = false;
    if(data.selected || field.checkDisableRowIf){
      let condition = '';
      if(field.disableRowIf && field.disableRowIf != ''){
        condition = field.disableRowIf;
      }
      if(condition != ''){
        if(this.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  checkDisableInRow(editedColumns:any,row:any){
    for (let index = 0; index < editedColumns.length; index++) {
      const column = editedColumns[index];
      row[column.field_name+"_disabled"] = this.isDisableRow(column,row);
    }
  }

  isDisableRow(field:any, data:any) {
    const updateMode = false;
    if (field.is_disabled) {
      return true;
    }
    if(data.disabled){
      return data.disabled;
    }
    if (field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != '') {
      return this.isDisable(field.etc_fields, updateMode, data);
    }
    return false;
  }
  isDisableRuntime(column:any, data:any,i:number,gridData:any,field:any,filterData:any) {
    const updateMode = false;
    if (column.is_disabled) {
      return true;
    }
    if(data.disabled){
      return data.disabled;
    }
    if (column.etc_fields && column.etc_fields.disable_if && column.etc_fields.disable_if != '') {
      let indx:any = this.commonFunctionService.getCorrectIndex(data,i,field,gridData,filterData);
      data = gridData[indx];
      return this.isDisable(field.etc_fields, updateMode, data);
    }
    return false;
  }
  checkDataAlreadyAddedInListOrNot(field:any,incomingData:any,alreadyDataAddedlist:any,i?:any){
    if(field && field.type && field.type == "date"){
      incomingData = ""+incomingData;
    }
    let checkStatus = {
      status : false,
      msg : ""
    };
    if(field && field.allowDuplicacy){
      checkStatus.status = false;
      return checkStatus;
    }else{
      let primary_key = field.field_name
      let criteria = primary_key+"#eq#"+incomingData;
      let primaryCriteriaList=[];
      primaryCriteriaList.push(criteria);
      if(field && field.primaryKeyCriteria && Array.isArray(field.primaryKeyCriteria) && field.primaryKeyCriteria.length > 0){
        field.primaryKeyCriteria.forEach((criteria:any) => {
          const crList = criteria.split("#");
          const cr = crList[0]+"#"+crList[1]+"#"+incomingData;
          primaryCriteriaList.push(cr);
        });
      }
      if(alreadyDataAddedlist == undefined){
        alreadyDataAddedlist = [];
      }
      let alreadyExist = false;
      if(typeof incomingData == 'object'){
        alreadyDataAddedlist.forEach((element:any) => {
          if(element._id == incomingData._id){
            alreadyExist =  true;
          }
        });
      }
      else if(typeof incomingData == 'string'){
        for (let index = 0; index < alreadyDataAddedlist.length; index++) {
          const element = alreadyDataAddedlist[index];
          if(i == undefined || i == -1){
            if(typeof element == 'string'){
              if(element == incomingData){
                alreadyExist =  true;
              }
            }else{
              if(primaryCriteriaList && primaryCriteriaList.length > 0){
                for (let index = 0; index < primaryCriteriaList.length; index++) {
                  const cri = primaryCriteriaList[index];
                  alreadyExist = this.checkIfCondition(cri,element,field.type);
                  if(alreadyExist){
                    const crList = cri.split("#");
                    switch (crList[1]) {
                      case "lte":
                        checkStatus.msg = "Entered value for "+field.label?field.label:''+" is gretter then to "+crList[0]+". !!!";
                        break;
                      case "gte":
                        checkStatus.msg = "Entered value for "+field.label?field.label:''+" is less then to "+crList[0]+". !!!";
                        break;
                      default:
                        checkStatus.msg = "Entered value for "+field.label?field.label:''+" is already added. !!!";
                        break;
                    }
                    break;
                  }
                }
              }
            }
            if(alreadyExist){
              break;
            }
          }else{
            break;
          }
        };
      }else{
        alreadyExist =  false;
      }
      if(alreadyExist){
        checkStatus.status = true;
        return checkStatus;
      }else{
        checkStatus.status = false;
        return checkStatus;
      }
    }

  }
  checkCustmizedValuValidation(fields:any, value:any) {
    let validate:any = [];
    let response:any = {
      status : false,
      msg : ""
    }
    fields.forEach((element:any) => {
      switch (element.type) {
        case "grid_selection":
        case "list_of_string":
          if (element.is_mandatory) {
            if (value[element.field_name] === undefined || value[element.field_name] === '' || value[element.field_name] === null || !this.commonFunctionService.isArray(value[element.field_name])) {
              validate.push(element);
            } else if (this.commonFunctionService.isArray(value[element.field_name])) {
              if (value[element.field_name].length <= 0) {
                validate.push(element);
              }
            }
          }
        break;
        default:
          validate = validate;
      }
    });
    if (validate.length > 0) {
      let fieldName = '';
      validate.forEach((element:any) => {
        if (fieldName == '') {
          fieldName += element.label
        } else {
          fieldName += ', ' + element.label
        }

      });
      response.msg = fieldName + ' Required.';
      response.status = false;
      // this.notificationService.notify('bg-danger', fieldName + ' Required.')
    } else {
      response.status = true;
    }
    return response;
  }

}
