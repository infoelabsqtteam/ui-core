import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StorageService } from '../../services/storage/storage.service';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';
import { ApiService } from '../api/api.service';
import { ModelService } from '../model/model.service';
import { EnvService } from '../env/env.service';


@Injectable({
  providedIn: 'root'
})
export class CommonFunctionService {
  userInfo: any;
  localTas:any;

  constructor(
    private storageService: StorageService,
    private modalService: ModelService,
    private datePipe: DatePipe,
    private apiService:ApiService,
    private coreFunctionService:CoreFunctionService,
    private envService:EnvService
    ) {
    this.userInfo = this.storageService.GetUserInfo();
  }

  getRefcode() {
    this.userInfo = this.storageService.GetUserInfo();
    if (this.userInfo != null && this.userInfo != undefined && this.userInfo.refCode) {
      return this.userInfo.refCode;
    } else {
      return null;
    }
  }
  getAppId() {
    this.userInfo = this.storageService.GetUserInfo();
    if (this.userInfo != null && this.userInfo != undefined && this.userInfo.appId) {
      return this.userInfo.appId;
    } else {
      return null;
    }
  }
  getObjectValue(field:any, object:any) {
    let result = object;
    if (field && field != null && field != '' && field != " ") {

      let list = field.split(".")
      for (let index = 0; index < list.length; index++) {
        result = result[list[index]]
        if (result === null || result === undefined) {
          return result;
        }
      }
      return result;
    }
    return "";
  }

  getddnDisplayVal(val:any) {
    if (val && val.name) {
      return val.name;
    } else if (val && val.label) {
      return val.label;
    } else if (val && val.field_name) {
      return val.field_name;
    } else {
      return val;
    }
  }
  openTreeModal(fieldLabel:any, ddnField:any, modalName:any) {
    const alertData = {
      "event": true,
      "fieldName": fieldLabel,
      "ddnFieldName": ddnField
    }
    this.modalService.open(modalName, alertData);
  }
  dateFormat(value:any) {
    return this.datePipe.transform(value, 'dd/MM/yyyy');
  }
  getDivClass(field:any,fieldsLangth:any){
    const fields = {...field}
    if (!fields.type) {
      fields.type = "text";
    }
    if(fields.field_class && field.field_class != ''){
      return fields.field_class;
    }
    switch (fields.type) {
      case "list_of_checkbox":
      case "list_of_fields":
      case "html":
      case "label":
      case "grid_selection":
      case "tabular_data_selector":
      case "group_of_fields":
        return "col-lg-12";
      default:
        if(fieldsLangth <= 5){
          return "col-lg-12";
        }else if(fieldsLangth <= 10){
          return "col-lg-6";
        }else{
          return "col-lg-3";
        }
    }
  }
  getFixedDivClass(field:any,fieldsLangth:any){
    const fields = {...field}
    if (!fields.type) {
      fields.type = "text";
    }
    if(fields.field_class && field.field_class != ''){
      return fields.field_class;
    }
  }
  getButtonDivClass(field:any){
    const fields = {...field}
    if(fields.field_class && field.field_class != ''){
      return fields.field_class;
    }
    return;

  }
  getConvertedString(ja:any, incomingTemplate:any){
    let template = "" + incomingTemplate;
    let reg = new RegExp("(\\[)(.*?)(\\])");

    let matcher:any = template.match(reg);
    let group = reg.exec(template);
    console.log(matcher.groups);

    let listMatches = [];
    // while(matcher.find){
      listMatches.push(matcher[2]);
    // }

    listMatches.forEach(element => {
      let valueObj = null;
      let details = matcher[2];
      let valueString = this.getStringValue(details, ja);
      template = template.replace("[" + matcher[2] + "]", valueString);
    });

    return template;
  }
  getStringValue(details:any,ja:any){
    //ja -> object
    //deatils -> pattern
    let valueConfig = details.split(",");
    return this.getObjectValue(valueConfig[0], ja)
  }


  sanitizeObject(tableFields:any, formValue:any, validatField:any,formValueWithCust?:any) {
    for (let index = 0; index < tableFields.length; index++) {
      const element = tableFields[index];
      if(element.type != 'list_of_fields' && element.type != 'group_of_fields'){
        switch (element.datatype) {
          case "list_of_object":
          case "list_of_object_with_popup":
          case "chips":
          case "chips_with_mask":
            if(validatField){
              if(formValue[element.field_name] != "" && formValue[element.field_name] != null &&  !this.isArray(formValue[element.field_name])){
                return {'msg':'Entered value for '+element.label+' is not valid. !!!'}
              }else if(this.applicableForValidation(element) && !this.isArray(formValueWithCust[element.field_name]) && formValueWithCust[element.field_name].length <= 0){
                return {'msg':'Please Enter '+ element.label + '. !!!'}
              }
            }else if (formValue[element.field_name] == "" && !this.isArray(formValue[element.field_name])) {
              formValue[element.field_name] = null;
            }
            break;
          case "object":
            if(validatField){
              if(formValue[element.field_name] != "" && formValue[element.field_name] != null && typeof formValue[element.field_name] != 'object'){
                return {'msg':'Entered value for '+element.label+' is not valid. !!!'}
              }else if(this.applicableForValidation(element) && typeof formValue[element.field_name] != 'object'){
                return {'msg':'Please Enter '+ element.label + '. !!!'}
              }
            }else if (formValue[element.field_name] == "" && typeof formValue[element.field_name] != 'object') {
              formValue[element.field_name] = null;
            }
            break;
          case "number":
            if (!Number(formValue[element.field_name])) {
              formValue[element.field_name] = 0;
            }
            if(this.applicableForValidation(element) && formValue[element.field_name]<=0){
              return {'msg':' ' +element.label + ' should be greater than 0. !!!'}
            }
            break
          default:
            break;
        }
      }
      switch (element.type) {
        case "list_of_string":
          if(validatField){
            if(formValue[element.field_name] != "" && formValue[element.field_name] != null){
              return {'msg':'Entered value for '+element.label+' is not valid. !!!'}
            }else if(this.applicableForValidation(element) && !this.isArray(formValueWithCust[element.field_name]) && formValueWithCust[element.field_name].length > 0){
              return {'msg':'Please Enter '+ element.label + '. !!!'}
            }
          }else if (formValue[element.field_name] == "" && !this.isArray(formValue[element.field_name])) {
            formValue[element.field_name] = null;
          }
          break;
        case "file":
          if (formValue[element.field_name] == "") {
            formValue[element.field_name] = null;
          }
          break;
        case "list_of_fields":
          if(validatField){
            if(this.applicableForValidation(element)){
              if(element.datatype != 'key_value'){
                if(formValueWithCust[element.field_name] == null || !this.isArray(formValueWithCust[element.field_name]) || formValueWithCust[element.field_name].length <= 0){
                  return {'msg': element.label + ' is required.'}
                }
              }else if(element.datatype == 'key_value'){
                if(typeof formValueWithCust[element.field_name] != 'object' || Object.keys(formValueWithCust[element.field_name]).length <= 0){
                  return {'msg': element.label + ' is required.'}
                }
              }
            }
          }else{
            if (!this.isArray(formValue[element.field_name]) || formValue[element.field_name].length <= 0) {
              if (formValue[element.field_name] != null) {
                if (element.datatype == 'key_value' && typeof formValue[element.field_name] == 'object') {
                  const object = formValue[element.field_name]
                  const len = Object.keys(object).length;
                  if (len == 0) {
                    formValue[element.field_name] = null;
                  } else if (object.key != undefined) {
                    if (object.key == '') {
                      formValue[element.field_name] = null;
                    }
                  }
                }
                if (element.datatype != 'key_value') {
                  formValue[element.field_name] = null;
                }
              }
            } else {
              if(element.list_of_fields && element.list_of_fields){
                for (let j = 0; j < element.list_of_fields.length; j++) {
                  const data = element.list_of_fields[j];
                  switch (data.datatype) {
                    case "list_of_object":
                    case "chips":
                    case "chips_with_mask":
                      if (formValue[element.field_name] && formValue[element.field_name].length > 0) {
                        formValue[element.field_name].forEach((fiedlList: any) => {
                          if (fiedlList[data.field_name] == "" && !this.isArray(fiedlList[data.field_name])) {
                            fiedlList[data.field_name] = null;
                          }
                        });
                      }
                      break;
                    case "object":
                      if (formValue[element.field_name] && formValue[element.field_name].length > 0) {
                        formValue[element.field_name].forEach((fiedlList: any) => {
                          if (fiedlList[data.field_name] == "" && typeof fiedlList[data.field_name] != 'object') {
                            fiedlList[data.field_name] = null;
                          }
                        });
                      }
                      break;
                    case "number":
                      if (formValue[element.field_name] && formValue[element.field_name].length > 0) {
                        formValue[element.field_name].forEach((fiedlList: any) => {
                          if (!Number(fiedlList[data.field_name])) {
                            fiedlList[data.field_name] = 0;
                          }

                        });
                      }
                      break;
                    default:
                      break;
                  }
                  switch (data.type) {
                    case "list_of_string":
                      if (formValue[element.field_name] && formValue[element.field_name].length > 0) {
                        formValue[element.field_name].forEach((fiedlList: any) => {
                          if (fiedlList[data.field_name] == "" && !this.isArray(fiedlList[data.field_name])) {
                            fiedlList[data.field_name] = null;
                          }
                        });
                      }
                      break;

                    default:
                      break;
                  }
                }
              }
            }
          }
          break;
        case "group_of_fields":
          for (let j = 0; j < element.list_of_fields.length; j++) {
          const data = element.list_of_fields[j];
            switch (data.datatype) {
              case "list_of_object":
              case "chips":
              case "chips_with_mask":
                if(validatField){
                  if(formValue[element.field_name][data.field_name] != "" && formValue[element.field_name][data.field_name] != null){
                    return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                  }else if(this.applicableForValidation(data) && !this.isArray(formValueWithCust[data.field_name]) && formValueWithCust[data.field_name].length > 0){
                    return {'msg':'Please Enter '+ data.label + '. !!!'}
                  }
                }else if (formValue[element.field_name][data.field_name] == "" && !this.isArray(formValue[element.field_name][data.field_name])) {
                    formValue[element.field_name][data.field_name] = null;
                  }
                break;
              case "object":
                if(validatField){
                  if(formValue[element.field_name][data.field_name] != "" && formValue[element.field_name][data.field_name] != null){
                    return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                  }else if(this.applicableForValidation(data) && typeof formValue[element.field_name][data.field_name] != 'object'){
                    return {'msg':'Please Enter '+ data.label + '. !!!'}
                  }
                }else if (formValue[element.field_name][data.field_name] == "" && typeof formValue[element.field_name][data.field_name] != 'object') {
                  formValue[element.field_name][data.field_name] = null;
                }
                break;
              case "number":
                if (!Number(formValue[element.field_name][data.field_name])) {
                  formValue[element.field_name][data.field_name] = 0;
                }
                break;
              default:
                break;
            }
            switch (data.type) {
              case "list_of_string":
                if(validatField){
                  if(formValue[element.field_name][data.field_name] != "" && formValue[element.field_name][data.field_name] != null){
                    return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                  }else if(this.applicableForValidation(data) && !this.isArray(formValueWithCust[data.field_name]) && formValueWithCust[data.field_name].length > 0){
                    return {'msg':'Please Enter '+ data.label + '. !!!'}
                  }
                }else if (formValue[element.field_name][data.field_name] == "" && !this.isArray(formValue[element.field_name][data.field_name])) {
                  formValue[element.field_name][data.field_name] = null;
                }
                break;

              default:
                break;
            }
          }
          break;
        case "stepper":
          for (let j = 0; j < element.list_of_fields.length; j++) {
            const step = element.list_of_fields[j];
            if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
              for (let k = 0; k < step.list_of_fields.length; k++) {
                const data = step.list_of_fields[k];
                switch (data.datatype) {
                  case "list_of_object":
                  case "chips":
                  case "chips_with_mask":
                    if(validatField){
                      if(formValue[data.field_name] != "" && formValue[data.field_name] != null){
                        return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                      }else if(this.applicableForValidation(data) && !this.isArray(formValueWithCust[data.field_name]) && formValueWithCust[data.field_name].length > 0){
                        return {'msg':'Please Enter '+ data.label + '. !!!'}
                      }
                    }else if (formValue[data.field_name] == "" && !this.isArray(formValue[data.field_name])) {
                      formValue[data.field_name] = null;
                    }
                    break;
                  case "object":
                    if(validatField){
                      if(formValue[data.field_name] != "" && formValue[data.field_name] != null){
                        return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                      }else if(this.applicableForValidation(data) && typeof formValue[data.field_name] != 'object'){
                        return {'msg':'Please Enter '+ data.label + '. !!!'}
                      }
                    }else if (formValue[data.field_name] == "" && typeof formValue[data.field_name] != 'object') {
                      formValue[data.field_name] = null;
                    }
                    break;
                  case "number":
                    if (!Number(formValue[data.field_name])) {
                      formValue[data.field_name] = 0;
                    }
                    break;
                  default:
                    break;
                }
                switch (data.type) {
                  case "list_of_string":
                    if(validatField){
                      if(formValue[data.field_name] != "" && formValue[data.field_name] != null){
                        return {'msg':'Entered value for '+data.label+' is not valid. !!!'}
                      }else if(this.applicableForValidation(data) && !this.isArray(formValueWithCust[data.field_name]) && formValueWithCust[data.field_name].length > 0){
                        return {'msg':'Please Enter '+ data.label + '. !!!'}
                      }
                    }else if (formValue[data.field_name] == "" && !this.isArray(formValue[data.field_name])) {
                      formValue[data.field_name] = null;
                    }
                    break;

                  default:
                    break;
                }
              }
            }
          }
          break;
        default:
          break;
      }
    }
    if(validatField){
      return true;
    }else{
      return formValue;
    }
  }

  applicableForValidation(field:any){
    if(field.is_mandatory){
      if(field.show_if != '' && field.show_if != null){
        if(field['display']){
          return true;
        }else{
          return false;
        }
      }else{
        return true;
      }
    }else{
      return false;
    }
  }


   getDateInStringFunction(templateValue:any){
  //var froD = templateValue.getFromDate;
  const fromDate = templateValue['fromDate'];
  const  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  var monthNumber = templateValue.fromDate.toDate().getMonth()
  var monthName = months[monthNumber];
  let year = templateValue.fromDate.toDate().getFullYear();
  let result = {
    "labelName": monthName+'-'+year
  }

  return result;

}


  populatefields(value:any, populate_fields:any,field:any,multipleFormCollection?:any) {
    let obj:any = {}
    let check = false;
    if(field && field.field_name){
      let fieldName = "";
      if(field.parent  && field.parent != ''){
        fieldName = field.parent+'.'+field.field_name;
      }else{
        fieldName = field.field_name;
      }
      if(field.type == "checkbox" && this.getObjectValue(fieldName,value)){
        check = true;
      }
    }
    if(populate_fields && populate_fields.length > 0){
      populate_fields.forEach((el:any) =>{
            value = this.getFormDataInMultiformCollection(multipleFormCollection, value);
        let toList = el.to.split(".");
        if(toList && toList.length > 1){
          const parent = toList[0];
          if (!obj[parent]) obj[parent] = {};
          const child = toList[1];
          if(check){
            obj[parent][child] =this.mergeMultiFieldsValues(el.from, value);
          }else{
            obj[parent][child] = "";
          }
        }else{
          const field = toList[0];
          if(check){
            obj[field] =this.mergeMultiFieldsValues(el.from, value);
          }else{
            obj[field] = "";
          }
        }
      });
    }
    return obj;
  }

  mergeMultiFieldsValues(field:any, object:any){
    let result = "";
    if(field && field != null && field != '' && field != " "){
      let list = field.split("+")
      for (let index = 0; index < list.length; index++) {
        if(result != ""){
          let lastIndex = list.length - 1;
          result = result + list[lastIndex] + this.getObjectValue(list[index], object);
        }else{
          result = this.getObjectValue(list[index], object);
        }
      }
    }
    return result;
  }

  populate_fields_for_report(templateForm: FormGroup) {
    // templateForm.controls['reporting_fax'].setValue(templateForm.value['fax']);
    templateForm.controls['reporting_mobile'].setValue(templateForm.value['mobile']);
    templateForm.controls['reporting_tel'].setValue(templateForm.value['phone']);

    templateForm.controls['reporting_city'].setValue(templateForm.value['city']);
    templateForm.controls['reporting_state'].setValue(templateForm.value['state']);
    templateForm.controls['reporting_country'].setValue(templateForm.value['country']);

    // templateForm.controls['reporting_address_line2'].setValue(templateForm.value['address_line2']);
    templateForm.controls['reporting_gst'].setValue(templateForm.value['gst_no']);
    templateForm.controls['reporting_contact_person_email'].setValue(templateForm.value['email']);
    templateForm.controls['reporting_address'].setValue(templateForm.value['address_line1']);
    templateForm.controls['reporting_pincode'].setValue(templateForm.value['pincode']);
    templateForm.controls['reporting_contact_person'].setValue(templateForm.value['first_name']+" "+templateForm.value['last_name']);
    templateForm.controls['reporting_company'].setValue(templateForm.value.account.name);

  }


  // getNetAmountWithPercent(total:number, percent:number) {
  //   let percentAmount = 0;
  //   let netAmount = 0;
  //   percentAmount = total * percent / 100;
  //   netAmount = total - percentAmount;
  //   return { p_amount: percentAmount, net_amount: netAmount }
  // }

  // claimAmountCalculation(field1:any, field2:any, field3:any) {
  //   let total = 0;
  //   if (field1 && field1 != "") {
  //     total = total + field1
  //   }
  //   if (field2 && field2 != "") {
  //     total = total + field2;
  //   }
  //   if (field3 && field3 != "") {
  //     total = total + field3;
  //   }
  //   return total;
  // }

  // array_move(arr:any, old_index:number, new_index:number) {
  //   if (new_index >= arr.length) {
  //     var k = new_index - arr.length + 1;
  //     while (k--) {
  //       arr.push(undefined);
  //     }
  //   }
  //   arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  //   return arr; // for testing
  // };

  openFileUpload(fieldName:any, modalName:any, formValue:any, fileData:any) {
    const alertData = {
      "field" :fieldName,
      "event": true,
      "fieldName": fieldName.field_name,
      "ddnFieldName": fieldName.ddn_field,
      "files" : fileData,
      "tableFields":null,
      "defaultBucket":null ,
      "defaultS3Key": null
    }
    if (fieldName.tableFields) {
      alertData['tableFields'] = fieldName.tableFields;
    }
    if (fieldName.defaultBucket) {
      alertData['defaultBucket'] = fieldName.defaultBucket;
    }
    if (fieldName.defaultS3Key) {
      alertData['defaultS3Key'] = fieldName.defaultS3Key;
    }
    this.modalService.open(modalName, alertData);
  }
  openAlertModal(id:string, type:any, headerMessage:any, bodyMessage:any) {
    const alertData = {
      "type": type,
      "bodyMessage": bodyMessage,
      "headerMessage": headerMessage
    }
    this.modalService.open(id, alertData);
  }

  getForm(forms:any, formName:any,gridButtons:any) {
    if (forms[formName] && forms[formName] != undefined && forms[formName] != null && forms[formName] != '') {
      return JSON.parse(JSON.stringify(forms[formName]));
    } else {
      if (forms['default'] && forms['default'] != undefined && forms['default'] != null) {
        if(formName == 'UPDATE'){
          if(gridButtons && gridButtons.length > 0){
            let check = false;
            gridButtons.forEach((button:any) => {
              if(button && button.onclick && button.onclick.action_name && button.onclick.action_name.toUpperCase() == 'UPDATE'){
                check = true;
              }
            });
            if(check){
              return JSON.parse(JSON.stringify(forms['default']));
            }else{
              return {};
            }
          }else {
            return {};
          }
        }else{
          return JSON.parse(JSON.stringify(forms['default']));
        }
      } else {
        return {}
      }
    }
  }
  // getTitlecase(value) {
  //   return this.titlecasePipe.transform(value);
  // }



  gotoHomePage() {
    const payload = {
      appName: this.envService.getAppName(),
      data: {
        accessToken: this.storageService.GetAccessToken()
      }
    }
    return payload;
  }
  download_file(payload:object){
    this.apiService.GetFileData(payload);
  }
  getQRCode(data:object){
    this.apiService.GetQr(data);
  }
  getAuditHistory(data:object){
    this.apiService.getAuditHistory(data);
  }
  downloadFile(file:string) {
    const payload = {
      path: 'download',
      data: file
    }
    this.apiService.DownloadFile(payload);
  }
  numberOnly(event:any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  viewModal(id:any, object:any, field:any, currentMenu:any, editemode:any) {
    const alertData = {
      "field": field,
      "data": object,
      "menu_name": currentMenu.name,
      'editemode': editemode
    }
    this.modalService.open(id, alertData);
  }
  custmizedKey(parentfield:any){
    let custmizedKey = parentfield.field_name;
    switch (parentfield.type) {
      case "list_of_fields":
      case "group_of_fields":
        custmizedKey = parentfield.field_name+'_'+parentfield.type
        break;
      default:
        custmizedKey = parentfield.field_name;
        break;
    }
    return custmizedKey;
  }
  checkStorageValue(object:any,parent:any,chield:any){
    let check = false;
    if(parent != '' && parent != undefined && parent != null){
      const parentKey = this.custmizedKey(parent);
      if(object[parentKey] && object[parentKey][chield.field_name] && object[parentKey][chield.field_name].length > 0){
        check = true;
      }
    }else{
      if(object[chield.field_name]){
        check = true;
      }
    }
    return check;
  }
  getVariableStorageValue(object:any,parent:any,chield:any): Array<any>{
    let data:any = [];
    if(parent != '' && parent != undefined && parent != null){
      const parentKey = this.custmizedKey(parent);
      if(this.checkStorageValue(object,parent,chield)){
        data = object[parentKey][chield.field_name]
      }
    }else {
      if(this.checkStorageValue(object,'',chield)){
        data = object[chield.field_name]
      }
    }
     return data;
  }
  formSize(evt:any,fieldLangth:number){
    if(evt && evt.class && evt.class!= ''){
      return evt.class;
    }else if(fieldLangth <= 5){
      return '';
    }else if(fieldLangth <= 10){
      return 'modal-lg';
    }
    else{
      return 'modal-dialog-full-width';
    }
  }

  // price_after_disc_health_test(templateForm:any){
  //   let templateValue = templateForm.getRawValue();
  //   let discount = 0;
  //   discount = templateValue.discount;
  // }

  // setPageNumverAndSize(payload:any,page:number,){
  //   payload['pageNo'] = page - 1;
  //   payload['pageSize'] = this.itemNumOfGrid;
  //   return payload;
  // }
  getMatchingInList(list:any,IncomingData:any,existData:any){
    var validity = true;
    list.forEach((matchcriteria: any) => {
      if (this.getObjectValue(matchcriteria, IncomingData) == this.getObjectValue(matchcriteria, existData)) {
        validity = validity && true;
      }
      else {
        validity = validity && false;
      }
    });
    return validity;
  }
  getCorrectIndex(data:any, indx:number,field:any,gridData:any,filterValue:any){
    let index;
    if (field.matching_fields_for_grid_selection && field.matching_fields_for_grid_selection.length > 0) {
      gridData.forEach((row:any, i:number) => {
        var validity = true;
        field.matching_fields_for_grid_selection.forEach((matchcriteria:any) => {
          if (this.getObjectValue(matchcriteria, data) == this.getObjectValue(matchcriteria, row)) {
            validity = validity && true;
          }
          else {
            validity = validity && false;
          }
        });
        if (validity == true) {
          index = i;
        }
      });
    }else if (data._id != undefined) {
      index = this.getIndexInArrayById(gridData, data._id);
    } else {
      index = indx;
    }
    if(index && index != indx && filterValue == ''){
      index = indx;
    }
    return index;
  }
  getIndexInArrayById(array:any,id:any,key?:any){
    let index = -1;
    if(array && array.length > 0){
      for (let i = 0; i < array.length; i++) {
        const element = array[i];
        if(key != undefined && key != null){
          if(this.isArray(key) && key.length > 0 && Object.keys(id).length > 0){
            if (this.getMatchingInList(key,id,element)) {
              index = i;
            }
          }else{
            const idValue = this.getObjectValue(key,element);
            if(id && id == idValue){
              index = i;
              break;
            }
          }
        }else if(element._id && element._id == id){
          index = i;
          break;
        }
      };
    }
    return index;
  }
  openModal(id:any, data:any){
    this.modalService.open(id, data);
  }
  getOperatorSymbol(operator:any){
    switch (operator) {
      case 'eq':
        return '=';
      default:
        return '=';
    }
  }

  // getRouthQueryToRedirectUrl(){
  //   const redirectUrl:any = this.storageService.getRedirectUrl();
  //     let searchKey = '';
  //     if(redirectUrl.indexOf('?') != -1 ){
  //       searchKey = '?';
  //     }
  //     if(redirectUrl.indexOf('%') != -1){
  //       searchKey = '%';
  //     }

  //     let newUrlWithQuery = '';
  //     if(searchKey != ''){
  //       const index = redirectUrl.indexOf(searchKey);
  //       const stringLength = redirectUrl.length;
  //       const queryPrams = redirectUrl.substring(index,stringLength);
  //       const newParam = queryPrams.replace('%3F','');
  //       newUrlWithQuery = newParam.replace('%3D',':');
  //     }
  //     return {newUrlWithQuery};
  // }

  getFormDataInMultiformCollection(multiformCollection:any,formValue:any,index?:any){
    let data:any = {};
      if(index>=0 && multiformCollection && multiformCollection.length >= 1 && multiformCollection[index] && multiformCollection[index]['data']){
         data = multiformCollection[index]['data'];
      }else{
        let dummyData:any = {};
        if(multiformCollection && multiformCollection.length > 0){
            multiformCollection.forEach((element:any,index:any) => {
              let currentData:any ={};
              if(element.data){
                currentData = element.data;
              }
              if(index == 0){
                dummyData = currentData;
              }else{
                Object.keys(currentData).forEach(key => {
                  dummyData[key] = currentData[key];
                });
              }

            });
        }
        if(Object.keys(formValue).length > 0){
          Object.keys(formValue).forEach(key => {
            dummyData[key] = formValue[key];
          });
        }
        data = dummyData;
      }
      return data;
  }

  convertListOfStringToListObject(list_of_populated_fields:any,keysList:any,seprator:any){
    let listOfObjects:any = [];
    list_of_populated_fields.forEach((element: string) => {
    let object:any = {}
    let source_targetList:any = element.split(seprator);
    keysList.forEach((key: string,i: string) => {
      object[key] = source_targetList[i];
    });

    listOfObjects.push(object);
  });
   return listOfObjects;
  }


  updateUserPreference(data:object,fieldName:string,parent?:string){
    let payloadData = this.getUserPreferenceObj(data,fieldName,parent);
    let payload = {
      "curTemp" : "user_preference",
      "data" : payloadData
    }
    this.apiService.SaveFormData(payload);
  }
  getUserPreferenceByFieldName(fieldName:string){
    let data = [];
    let userPreference = this.storageService.getUserPreference();
    if(userPreference && userPreference[fieldName]){
      data = userPreference[fieldName];
    }
    return data;
  }

  getUserPreferenceObj(data:any,fieldName:string,parent?:string){
    let refObj:any = this.getReferenceObject(data);
    if(parent != ''){
      refObj = parent;
    }
    if(fieldName == "favoriteMenus"){
      refObj = data;
    }
    let uRef:any = {};
    let userPreference = this.storageService.getUserPreference();
    if(userPreference && userPreference._id && userPreference._id != null && userPreference._id != ''){
      let fieldData = userPreference[fieldName];
      if(fieldData && fieldData.length > 0){
        let matchIndex = -1;
        for (let index = 0; index < fieldData.length; index++) {
          const element = fieldData[index];
          if(element._id == refObj._id){
            matchIndex = index;
            break;
          }
        }
        if(matchIndex  > -1){
          if(parent != ''){
            let submenu = fieldData[matchIndex].submenu;
            let submenuMatchIndex = -1;
            if(submenu && submenu.length > 0){
              for (let j = 0; j < submenu.length; j++) {
                const subMenu = submenu[j];
                if(subMenu._id == data._id){
                  submenuMatchIndex = j;
                  break;
                }
              }
            }
            if(submenuMatchIndex > -1){
              submenu.splice(submenuMatchIndex);
              if(fieldData[matchIndex].submenu.length == 0){
                fieldData.splice(matchIndex);
              }else{
                fieldData[matchIndex].submenu = submenu;
              }
            }else{
              if(submenu.length > 0){
                fieldData[matchIndex].submenu.push(data);
              }else{
                fieldData[matchIndex].submenu = []
                fieldData[matchIndex].submenu.push(data);
              }
            }
          }else{
            fieldData.splice(matchIndex);
          }
        }else{
          if(parent != ''){
            refObj['submenu'] = [];
            refObj['submenu'].push(data);
            fieldData.push(refObj);
          }else{
            fieldData.push(refObj);
          }
        }
      }else{
        fieldData = [];
        fieldData.push(refObj);
      }
      userPreference[fieldName] = fieldData;
      uRef = userPreference;
    }else{
      let user = this.storageService.GetUserInfo();
      let userRef = this.getReferenceObject(user);
      let dataList = [];
      dataList.push(refObj);
      uRef['userId'] = userRef;
      uRef[fieldName] = dataList;
    }
    return uRef
  }
  getReferenceObject(obj:any){
    let ref:any = {}
    ref["_id"]=obj._id;
    ref["code"] = obj.code;
    ref["name"] = obj.name;
    if(obj.version != null){
      ref["version"] = obj.version
    }
    return ref;
  }
  dateDiff(dateSent:any){
    let obj:any={};
    let currentDate = new Date();
    dateSent = new Date(dateSent);
    // let diff = Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate());
    let diff = currentDate.getTime() - dateSent.getTime();
    let days = Math.floor(diff / (60 * 60 * 24 * 1000));
    let hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    let minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    let seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    obj['days'] = days;
    obj['hours'] = hours;
    obj['minutes'] = minutes;
    obj['seconds'] = seconds;

     return obj;
   }
  updateFieldInList(fieldName:any,list:any){
    let modifyList:any = [];
    if(list && list.length > 0){
      list.forEach((element: any) => {
        let value = JSON.parse(JSON.stringify(element));
        value[fieldName] = true;
        modifyList.push(value);
      });
    }
    return modifyList;
  }
  // manufactured_as_customer(templateForm: FormGroup) {
  //   (<FormGroup>templateForm.controls["sample_details"]).controls["mfg_by"].patchValue(templateForm.value.account.name);
  // }

  // supplied_as_customer(templateForm: FormGroup) {
  //   (<FormGroup>templateForm.controls["sample_details"]).controls["supplied_by"].patchValue(templateForm.value.account.name);
  // }

  funModeTravelChange(value:any){

    let obj1 = {
      distanceInKm:'',
      localTa:''
    }
    let obj = {
      claimSheet:obj1
    }
    return obj;
  }
  print(data:any): void {
    let popupWin;
    popupWin = window.open('', '_blank', 'top=0,left=0,height=100%,width=auto');
    popupWin!.document.write('<div class="noprint" style="text-align:right;"><a onClick="window.print()" style="text-align: right;display: inline-block;cursor: pointer;border: 2px solid #4285f4!important;background-color: transparent!important;color: #4285f4!important;box-shadow: 0 2px 5px 0 rgba(0,0,0,.16), 0 2px 10px 0 rgba(0,0,0,.12);padding: 7px 25px;font-size: .81rem;transition: .2s ease-in-out;margin: .375rem;text-transform: uppercase;">Print</a></div><style>@media print{.noprint{display:none;}}</style>'+data);
    popupWin!.document.close();
    popupWin!.print()
  }
  isArray(obj : any ) {
    return Array.isArray(obj)
  }

  donotResetField(tableFields:any,FormValue:any){
    let donotResetFieldLists:any={};
    tableFields.forEach((tablefield:any) => {
      if(tablefield.do_not_refresh_on_add && tablefield.type != "list_of_fields" && tablefield.type != "group_of_fields" && tablefield.type != "stepper"){
        donotResetFieldLists[tablefield.field_name] = FormValue[tablefield.field_name];
      }else if(tablefield.type == "group_of_fields"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach((field:any) => {
            if(field.do_not_refresh_on_add){
              donotResetFieldLists[tablefield.field_name][field.field_name] = FormValue[tablefield.field_name][field.field_name];
            }
          });
        }
      }else if(tablefield.type == "stepper"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach((step:any) => {
            if(step.list_of_fields && step.list_of_fields.length > 0){
              step.list_of_fields.forEach((field:any) => {
                if(field.do_not_refresh_on_add){
                  donotResetFieldLists[step.field_name][field.field_name] = FormValue[step.field_name][field.field_name];
                }
              });
            }
          });
        }
      }
    });
    return donotResetFieldLists;
  }

  // modifyFileSetValue(files:any){
  //   let fileName = '';
  //   let fileLength = files.length;
  //   let file = files[0];
  //   if(fileLength == 1 && (file.fileName || file.rollName)){
  //     fileName = file.fileName || file.rollName;
  //   }else if(fileLength > 1){
  //     fileName = fileLength + " Files";
  //   }
  //   return fileName;
  // }
  // modifyUploadFiles(files:any){
  //   const fileList:any = [];
  //   if(files && files.length > 0){
  //     files.forEach((element:any) => {
  //       if(element._id){
  //         fileList.push(element)
  //       }else{
  //         if(!element.uploadData){
  //           fileList.push({uploadData:[element]});
  //         }else{
  //           fileList.push(element);
  //         }
  //       }
  //     });
  //   }
  //   return fileList;
  // }
  getFirstCharOfString(char:any){
    if(this.coreFunctionService.isNotBlank(char)){
      return char.charAt(0)
    }else{
      return '';
    }
  }
  removeItem(data:any,column:any,i:number){
    data[column.field_name].splice(i,1);
    return data[column.field_name];
  }
  checkObjecOrString(data:any){
    if(data._id){
      return data._id;
    }else{
      return data;
    }
  }

}
