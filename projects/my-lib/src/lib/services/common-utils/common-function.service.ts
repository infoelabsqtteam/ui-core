import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { StorageService } from '../../services/storage/storage.service';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';
import { CustomvalidationService } from '../customvalidation/customvalidation.service';
import { NotificationService } from '../notify/notification.service';
import { ApiService } from '../api/api.service';
import { ModelService } from '../model/model.service';
import { EnvService } from '../env/env.service';
import { Common } from '../../shared/enums/common.enum';


@Injectable({
  providedIn: 'root'
})
export class CommonFunctionService {
  userInfo: any;
  localTas:any;
  pageNumber: number = Common.PAGE_NO;
  itemNumOfGrid: any = Common.ITEM_NUM_OF_GRID;

  constructor(
    private formBuilder: FormBuilder,
    private storageService: StorageService,
    private modalService: ModelService,
    private datePipe: DatePipe,
    private CurrencyPipe: CurrencyPipe,
    private customvalidationService:CustomvalidationService,
    private notificationService:NotificationService,
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
  createFormControl(forControl:any, field:any, object:any, type:string) {
    let disabled = field.is_disabled ? true : ((field.disable_if != undefined && field.disable_if != '') ? true : false);
    switch (type) {
      case "list":
        forControl[field.field_name] = this.formBuilder.array(object, this.validator(field))
        break;
        case 'checkbox':
          forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
          break;
      case "text":
        switch (field.type) {
          case "gst_number":
            forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
            break;
          case "api":
            switch (field.api_call_name) {
              case "gst_number":
                forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
                break;
              default:
                forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
                break;
            }
              forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
              break;
          case "typeahead":
            switch (field.datatype) {
              case 'object':
                forControl[field.field_name] = new FormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidData.bind(this.customvalidationService))
                break;
              default:
                forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
                break;
            }
            break;
          default:
            forControl[field.field_name] = new FormControl({ value: object, disabled: disabled }, this.validator(field))
            break;
        }
        break;
      case "group":
        forControl[field.field_name] = this.formBuilder.group(object)
        break;
      default:
        break;
    }
  }
  validator(field:any) {
    const validator = []
    if (field.is_mandatory != undefined && field.is_mandatory) {
      switch (field.type) {
        case "grid_selection":
        case "list_of_string":
          break;
        case "typeahead":
          if (field.datatype != 'list_of_object' && field.datatype != 'chips') {
            validator.push(Validators.required)
          }
          break;
        case 'checkbox':
          validator.push(Validators.requiredTrue)
          break;
        case "email":
          validator.push(Validators.required)
          validator.push(Validators.email);
          break;
        default:
          validator.push(Validators.required)
          break;
      }
    }else{
      switch (field.type){
        case "email":
          validator.push(Validators.email);
          break;
        default:
          break;
      }
    }
    if (field.min_length != undefined && field.min_length != null && field.min_length != '' && Number(field.min_length) && field.min_length > 0) {
      validator.push(Validators.minLength(field.min_length))
    }
    if(field.max_length != undefined && field.max_length != null && field.max_length != '' && Number(field.max_length) && field.max_length > 0){
      validator.push(Validators.maxLength(field.max_length))
    }
    return validator;
  }

  getPaylodWithCriteria(params:any, callback:any, criteria:any, object:any,data_template?:any) {
    const tabName =  this.storageService.GetActiveMenu();
    let tab = '';
    if(tabName && tabName.name && tabName.name != ''){
      tab = tabName.name;
    }
    let staticModal:any = {
      "key": this.getRefcode(),
      "key2": this.storageService.getAppId(),
      "value": params,
      "log": this.storageService.getUserLog(),
      "crList": [],
      "module": this.storageService.getModule(),
      "tab": tab
    }
    if(data_template){
      staticModal['data_template'] = data_template;
    }
    if(callback && callback != ''){
      staticModal['key3'] = callback;
    }
    if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
      staticModal["data"]=object;
    }
    if (criteria && criteria.length > 0) {
      const crList = this.getCriteriaList(criteria,object);
      if(crList && crList.length > 0){
        crList.forEach((element: any) => {
          staticModal.crList.push(element);
        });
      }
    }
    return staticModal;
  }
  checkQtmpApi(params:any,field:any,payload:any,multipleFormCollection:any,object:any,objectWithCustom:any){
    if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
      let multiCollection = JSON.parse(JSON.stringify(multipleFormCollection));
      if(field && field.formValueAsObjectForQtmp){
        let formValue = this.getFormDataInMultiformCollection(multiCollection,object);
        payload["data"]=formValue;
      }else{
        let formValue = this.getFormDataInMultiformCollection(multiCollection,objectWithCustom);
        payload["data"]=formValue;
      }
    }
    return payload;
  }
  getTabsCountPyload(tabs:any){
    let payloads:any = [];
    if(tabs && tabs.length >= 1 ){
      tabs.forEach((element: any) => {
        let grid_api_params_criteria = [];
        if(this.isGridFieldExist(element,"api_params_criteria")){
          grid_api_params_criteria = element.grid.api_params_criteria;
        }
        const payload = this.getPaylodWithCriteria(element.tab_name,element.tab_name+"_"+element.name,grid_api_params_criteria,{});
        payload['countOnly'] = true;
        payloads.push(payload);
      });
    }
    if(payloads && payloads.length > 0){
      this.apiService.getGridCountData(payloads);
    }
  }
  getCriteriaList(criteria:any,object:any){
    const crList:any = [];
    criteria.forEach((element: string) => {
      const criteria = element.split(";");
      const fValue = criteria[2]
      let fvalue ='';
      if(criteria[3] && criteria[3] == 'STATIC'){
        fvalue = fValue;
      }else{
        fvalue = this.getObjectValue(fValue, object)
      }
      const list = {
        "fName": criteria[0],
        "fValue": fvalue,
        "operator": criteria[1]
      }
      if(this.coreFunctionService.isNotBlank(fvalue)){
        crList.push(list);
      }
    });
    return crList;
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
      let setValue = formValue ? this.getObjectValue(condition[0], formValue) : "";
      if(setValue && setValue.length > 0){
        for (let index = 0; index < setValue.length; index++) {
          const element = setValue[index];
          let value = this.getObjectValue(condition[3],element);
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
    if (userInfo.roles && userInfo.roles != null && userInfo.roles != "" && this.isArray(userInfo.roles) && userInfo.roles.length > 0) {
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
        condition[2] = this.getObjectValue(condition[2], formValue)+"";
      }
      let setValue:any = "";
      if(condition.length > 3 && condition[3] == 'STATIC'){
        setValue = condition[0];
      }else{
        setValue = formValue ? this.getObjectValue(condition[0], formValue) : "";
      }
      if (setValue === undefined || setValue === "") {
        setValue = "";
      } else {
        setValue = setValue + "";
      }
      if(datatype){
        switch (datatype) {
          case "date":
            setValue = this.dateFormat(setValue);
            condition[2] = this.dateFormat(condition[2]);
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
    if (fieldValue != undefined && fieldValue.has_role != null && fieldValue.has_role != undefined && this.isArray(fieldValue.has_role) && fieldValue.has_role.length > 0) {
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

  openTreeModal(fieldLabel:any, ddnField:any, modalName:any) {
    const alertData = {
      "event": true,
      "fieldName": fieldLabel,
      "ddnFieldName": ddnField
    }
    this.modalService.open(modalName, alertData);
  }
  getValueForDotFieldName(value:any,fieldName:any){
    let crValue = "";
    if(typeof value == "string"){
      crValue = value;
    }else if(typeof value == "object"){
      let fName = fieldName.indexOf('.') != -1 ? (fieldName).split('.')[0]:fieldName;
      let objectValue:any = {};
      objectValue[fName] =  value
      crValue = fieldName.indexOf('.') != -1 ?this.getObjectValue(fieldName,objectValue): this.getddnDisplayVal(value);
    }
    return crValue;
  }

  getfilterCrlist(headElements:any,formValue:any) {
    const filterList:any = []
    if(formValue != undefined){
      const criteria:any = [];
      headElements.forEach((element: any) => {
        if(element != null && element.type != null){
          let fieldName = element.field_name;
          let value = formValue[element.field_name];
          switch (element.type.toLowerCase()) {
            case "button":
            case "text":
            case "tree_view_selection":
            case "dropdown":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0 && element.type != 'dropdown'){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else if (element.multi_select && element.datatype == "object"){
                  let fvalue = '';
                  if(value && value.length > 0){
                    value.forEach((vl: string, i: number) => {
                      if((value.length - 1) == i){
                          fvalue = fvalue + vl;
                      }else{
                          fvalue = fvalue + vl + ":";
                      }
                    });
                  }
                  filterList.push(
                    {
                        "fName": fieldName,
                        "fValue": fvalue,
                        "operator": "in"
                      }
                    )
                }
                else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.getValueForDotFieldName(value,fieldName),
                      "operator": this.getOperator()
                    }
                  )
                }
              }
              break;
            case "number":
                if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                  if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                    element.api_params_criteria.forEach((cri: any) => {
                      criteria.push(cri)
                    });
                  }else{
                    filterList.push(
                      {
                        "fName": fieldName,
                        "fValue": this.getddnDisplayVal(value),
                        "operator": "eq"
                      }
                    )
                  }
                }
                break;
            case "typeahead":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.isArray(element.dataFilterCriteria) && element.dataFilterCriteria.length > 0){
                  element.dataFilterCriteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.getValueForDotFieldName(value,fieldName),
                      "operator": this.getOperator()
                    }
                  )
                }
              }
              break;
            case "info":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.getddnDisplayVal(value),
                      "operator": this.getOperator()
                    }
                  )
                }
              }
              break;
              case "reference_names":
              case "chips":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName+".name",
                      "fValue": this.getddnDisplayVal(value),
                      "operator": this.getOperator()
                    }
                  )
                }
              }
              break;
            case "date":
            case "datetime":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.dateFormat(value),
                      "operator": "eq"
                    }
                  )
                }
              }
              break;
            case "daterange":
              if(formValue && formValue[fieldName] && formValue[fieldName].start != '' && formValue[fieldName].end != null){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.dateFormat(value.start),
                      "operator": "gte"
                    }
                  )
                }
              }
              if(formValue && formValue[fieldName] && formValue[fieldName].end != '' && formValue[fieldName].end != null){
                if(this.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.dateFormat(value.end),
                      "operator": "lte"
                    }
                  )
                }
              }
              break;
            default:
              break;
          }
        }
      });
      if(criteria && criteria.length > 0){
        const crList = this.getCriteriaList(criteria,formValue);
        if(crList && crList.length > 0){
          crList.forEach((element: any) => {
            filterList.push(element);
          });
        }
      }
    }
    return filterList;
  }
  dateFormat(value:any) {
    return this.datePipe.transform(value, 'dd/MM/yyyy');
  }
  getOperator() {
     let defaultOperator = this.storageService.getApplicationSetting().defaultSearchOperatorInGrid;
     let operator = "";
     if(defaultOperator && defaultOperator != null && defaultOperator != "") {
      operator = defaultOperator
     }else {
      operator = "stwic";
     }
     return operator;
  }

  commanApiPayload(headElement:any,tableField:any,actionButton:any,object?:any){
    const staticModalGroup:any = [];
    let staticModal:any = {};
    if(headElement.length > 0){
      headElement.forEach((element: any) => {
        if (element.api_params && element.api_params != '') {
          let call_back_field =  '';
          let criteria = [];
          if(element.call_back_field && element.call_back_field != ''){
            call_back_field =  element.call_back_field;
          }
          if(element.api_params_criteria && element.api_params_criteria != ''){
            criteria =  element.api_params_criteria;
          }
          staticModal = this.getPaylodWithCriteria(element.api_params,call_back_field,criteria,object?object:{});
          if(element.adkey && element.adkey != '' && element.adkey != null){
            staticModal['adkeys'] = element.adkey;
            staticModalGroup.push(staticModal);
          }else{
            staticModalGroup.push(staticModal);
          }

        }

      });
    }

    if(actionButton.length > 0){
      actionButton.forEach((element: any) => {
        if (element.api_params && element.api_params != '') {
          let call_back_field =  '';
          let criteria = [];
          if(element.call_back_field && element.call_back_field != ''){
            call_back_field =  element.call_back_field;
          }
          if(element.api_params_criteria && element.api_params_criteria != ''){
            criteria =  element.api_params_criteria;
          }
          const staticModal = this.getPaylodWithCriteria(element.api_params,call_back_field,criteria,object?object:{});

          staticModalGroup.push(staticModal);
        }
      });
    }

    if(tableField.length > 0){

      tableField.forEach((element:any) => {
        let call_back_field =  '';
        let criteria = [];
        if (element.api_params && element.api_params != '' && element.type != "typeahead") {
          if(element.call_back_field && element.call_back_field != ''){
            call_back_field =  element.call_back_field;
          }
          if(element.api_params_criteria && element.api_params_criteria != ''){
            criteria =  element.api_params_criteria;
          }
          const staticModal = this.getPaylodWithCriteria(element.api_params,call_back_field,criteria,object?object:{},element.data_template);
          if(element.api_params.indexOf("html_view") >= 0){
            staticModal["data"]=object;
          }
          staticModalGroup.push(staticModal);
        }
        switch (element.type) {
          case "list_of_fields":
          case "group_of_fields":
            if (element.list_of_fields && element.list_of_fields.length > 0) {
              element.list_of_fields.forEach((data:any) => {
                if(data && data != null){
                  let call_back_field =  '';
                  let criteria = [];
                  if (data.api_params && data.api_params != '' && data.type != "typeahead") {

                    if(data.call_back_field && data.call_back_field != ''){
                      call_back_field =  data.call_back_field;
                    }
                    if(data.api_params_criteria && data.api_params_criteria != ''){
                      criteria =  data.api_params_criteria;
                    }
                    const staticModalListOfFields = this.getPaylodWithCriteria(data.api_params,call_back_field,criteria,object?object:{},element.data_template);
                    if(data.api_params.indexOf("html_view") >= 0){
                      staticModalListOfFields["data"]=object;
                    }
                    staticModalGroup.push(staticModalListOfFields);
                  }
                }
              });
            }
            break;
            case "stepper":
            if (element.list_of_fields && element.list_of_fields.length > 0) {
              element.list_of_fields.forEach((step:any) => {
                step.list_of_fields.forEach((data:any) => {
                  let call_back_field =  '';
                  let criteria = [];
                  if (data.api_params && data.api_params != '' && data.type != "typeahead") {

                    if(data.call_back_field && data.call_back_field != ''){
                      call_back_field =  data.call_back_field;
                    }
                    if(data.api_params_criteria && data.api_params_criteria != ''){
                      criteria =  data.api_params_criteria;
                    }
                    const staticModalListOfFields = this.getPaylodWithCriteria(data.api_params,call_back_field,criteria,object?object:{},element.data_template);
                    if(data.api_params.indexOf("html_view") >= 0){
                      staticModalListOfFields["data"]=object;
                    }
                    staticModalGroup.push(staticModalListOfFields);
                  }
                });
              });
            }
            break;
          default:
            break;
        }
      });
    }
    return staticModalGroup;
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


  getValueForGrid(field:any, object:any) {
    let value:any = '';
    let fieldName: any= '';
    if (field) {
      if(this.coreFunctionService.isNotBlank(field.display_name)){
        fieldName= field.display_name;
      }
      else if(this.coreFunctionService.isNotBlank(field.field_name)){
        fieldName= field.field_name;
      }
    }
    if(fieldName !=''){
      value= this.getObjectValue(fieldName, object)
    }
    if (!field.type) field.type = "Text";
    let returnValue:any = '';
    switch (field.type.toLowerCase()) {
      case 'datetime':
        if(value && value != ''){
          if(this.storageService.checkPlatForm() == 'mobile'){
            returnValue =  this.datePipe.transform(value, 'medium');
          }else{
            returnValue = this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
          }
        }
        return returnValue
      case 'date':
        if(value && value != ''){
          if(this.storageService.checkPlatForm() == 'mobile'){
            returnValue =  this.datePipe.transform(value, 'mediumDate');
          }else{
            returnValue = this.datePipe.transform(value, 'dd/MM/yyyy');
          }
        }
        return returnValue;
      case 'time': return this.datePipe.transform(value, 'h:mm a');
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.CurrencyPipe.transform(value, 'INR');
  	  case "dropdown": return value && value.name ? value.name : value;
      case "typeahead": return value && value.name ? value.name : value;
      case "info":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">visibility</span>';
          }else{
            return '<i class="fa fa-eye cursor-pointer"></i>';
          }
        } else {
          return '-';
        }

      case "html" :
        if (value && value != '') {
          return '<span class="material-icons cursor-pointer">preview</span>';
        } else {
          return '-';
        }
      case "file":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">text_snippet</span>';
          }else{
            return '<span class="material-icons cursor-pointer">text_snippet</span>';
          }
        } else {
          return '-';
        }
      case "template":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined">description</span>';
          }else{
            return '<i class="fa fa-file cursor-pointer" aria-hidden="true"></i>';
          }
        } else {
          return '-';
        }
      case "image":
        return '<img src="data:image/jpg;base64,' + value + '" />';
      case "icon":
        if(this.storageService.checkPlatForm() == 'mobile'){
          return '<span class="material-symbols-outlined cursor-pointer">' + field.field_class + '</span>';
        }else{
          return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
        }
      case "download_file":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">' + field.field_class + '</span>';
          }else{
            return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
          }
        }else{
          return '-';
        }
      case "trim_of_string":
        if(value != undefined && value != null && value != ''){
          if(typeof value == 'string'){
            let stringObject = value.split('/');
            if(stringObject.length > 0){
              return stringObject[0]
            }else{
              return value;
            }
          }else{
            return value;
          }
        }else{
          return value;
        }

      case "color":
        break;

      case "pattern":
        if(object != null){
          return this.getConvertedString(object,field.field_name);
        }
      break;
      case "chips":
        if(this.coreFunctionService.isNotBlank(value) && this.isArray(value)){
          let name = "";
          for(let i=0 ;i<value.length; i++){
            if(this.coreFunctionService.isNotBlank(value[i]['name'])){
              name = name+', '+value[i]['name'];
            }else{
              name = name+', '+value[i];
            }
          }
          return name.substring(2);;
        }
        return "-";
      case "reference_names":
        if(this.coreFunctionService.isNotBlank(value) && this.isArray(value)){
          let name = '';
          for(let i=0 ;i<value.length; i++){
            if(this.coreFunctionService.isNotBlank(value[i]['name'])){
              name = name+', '+value[i]['name'];
            }
          }
          if(name.length > 1){
            name = name.substring(2);
          }
          return name;
        }else{
          return "-";
        }
      default: return value;
    }
  }
  getValueForGridTooltip(field:any, object:any) {
    let value = '';
    if (field.field_name != undefined && field.field_name != null && field.field_name != '') {
      value = this.getObjectValue(field.field_name, object)
    }
    if (!field.type) field.type = "Text";
    switch (field.type.toLowerCase()) {
      case 'datetime': return this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
      case 'date': return this.datePipe.transform(value, 'dd/MM/yyyy');
      case 'time': return this.datePipe.transform(value, 'h:mm a');
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.CurrencyPipe.transform(value, 'INR');
      case "info":
      case "file":
      case "template":
      case "image":
      case "icon":
      case "html":
          return '';
      default: return value;
    }
  }
  getTemData(tempName:any) {
    const params = "form_template";
    const criteria = ["name;eq;"+tempName+";STATIC"];
    const payload = this.getPaylodWithCriteria(params,'',criteria,{});
    // const getTemplates = {
    //   crList: [{
    //     "fName": "name",
    //     "fValue": tempName,
    //     "operator": "eq"
    //   }],
    //   key2: this.storageService.getAppId(),
    //   refCode: this.getRefcode(),
    //   log: this.storageService.getUserLog(),
    //   value: "form_template"
    // }
    return payload;
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


  getNetAmountWithPercent(total:number, percent:number) {
    let percentAmount = 0;
    let netAmount = 0;
    percentAmount = total * percent / 100;
    netAmount = total - percentAmount;
    return { p_amount: percentAmount, net_amount: netAmount }
  }

  claimAmountCalculation(field1:any, field2:any, field3:any) {
    let total = 0;
    if (field1 && field1 != "") {
      total = total + field1
    }
    if (field2 && field2 != "") {
      total = total + field2;
    }
    if (field3 && field3 != "") {
      total = total + field3;
    }
    return total;
  }

  array_move(arr:any, old_index:number, new_index:number) {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  };

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
  previewModal(gridData:any, currentMenu:any, modalId:any) {
    const getpreviewHtml = {
      _id: gridData._id,
      data: this.getPaylodWithCriteria(currentMenu.name, '', [], '')
    }
    this.apiService.GetPreviewHtml(getpreviewHtml);
    const alertData = {
      gridData: gridData,
      currentPage: currentMenu.name
    }
    this.modalService.open(modalId, alertData);
  }
  preview(gridData:any, currentMenu:any, modalId:any) {
    const getpreviewHtml = {
      _id: gridData._id,
      data: this.getPaylodWithCriteria(currentMenu.name, '', [], '')
    }
    getpreviewHtml.data['data'] = gridData;
    this.apiService.GetPreviewHtml(getpreviewHtml);
  }

  gotoHomePage() {
    const payload = {
      appName: this.envService.getAppName(),
      data: {
        accessToken: this.storageService.GetAccessToken()
      }
    }
    return payload;
  }
  downloadPdf(data:any, currentMenu:any) {
    let payloadData = {};
    if (currentMenu != '') {
      payloadData = this.getPaylodWithCriteria(currentMenu, '', [], '')
    }
    const getPdfData:any = {
      _id: data._id,
      data: payloadData,
      responce: { responseType: "arraybuffer" }
    }
    let fileName = currentMenu;
    fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1)
    const downloadPdfCheck = fileName + '-' + new Date().toLocaleDateString();
    if (getPdfData._id && getPdfData._id != undefined && getPdfData._id != null && getPdfData._id != '') {
      getPdfData.data['data'] = data;
      this.apiService.GetPdfData(getPdfData);
    }
    return downloadPdfCheck;
  }

  getPdf(data:any,currentMenu:any) {
    let payloadData = {};
    if(currentMenu != ''){
      payloadData = this.getPaylodWithCriteria(currentMenu, '', [], '')
    }
    const getFileData:any = {
      _id: data._id,
      data: payloadData,
      responce: { responseType: "arraybuffer" }
    }
    let fileName = currentMenu;
    fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1)
    const downloadPdfCheck = fileName + '-' + new Date().toLocaleDateString();
    if(getFileData._id && getFileData._id != undefined && getFileData._id != null && getFileData._id != ''){
      getFileData.data['data']=data;
      this.apiService.GetFileData(getFileData);
    }
    return  downloadPdfCheck;
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

  getFormForTds(data:any,currentMenu:any, object:any){
    let payloadData:any = {};
    if(currentMenu != ''){
      payloadData = this.getPaylodWithCriteria(currentMenu, '', [], '')
      payloadData['data']=object
    }
    const getFormData = {
      _id : data._id,
      data: payloadData
    }
    return getFormData;
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
            if (value[element.field_name] === undefined || value[element.field_name] === '' || value[element.field_name] === null || !this.isArray(value[element.field_name])) {
              validate.push(element);
            } else if (this.isArray(value[element.field_name])) {
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

  price_after_disc_health_test(templateForm:any){
    let templateValue = templateForm.getRawValue();
    let discount = 0;
    discount = templateValue.discount;
  }


  getDataForGrid(page:any,tab:any,currentMenu:any,headElements:any,filterForm:any,selectContact:any){
    let grid_api_params_criteria = [];
    if(tab.grid && tab.grid.grid_page_size && tab.grid.grid_page_size != null && tab.grid.grid_page_size != ''){
      this.itemNumOfGrid = tab.grid.grid_page_size;
    }
    if(this.isGridFieldExist(tab,"api_params_criteria")){
      grid_api_params_criteria = tab.grid.api_params_criteria;
    }
    const data = this.setPageNoAndSize(this.getPaylodWithCriteria(currentMenu.name,'',grid_api_params_criteria,''),page);
    this.getfilterCrlist(headElements,filterForm).forEach((element: any) => {
      data.crList.push(element);
    });
    if(selectContact != ''){
      const tabFilterCrlist = {
        "fName": 'account._id',
        "fValue": selectContact,
        "operator": 'eq'
      }
      data.crList.push(tabFilterCrlist);
    }
    const getFilterData = {
      data: data,
      path: null
    }
    return getFilterData;
  }
  setPageNoAndSize(payload:any,page:number){
    payload['pageNo'] = page - 1;
    payload['pageSize'] = this.itemNumOfGrid;
    return payload;
  }
  getRealTimeGridData(currentMenu:any, object:any) {
    let grid_api_params_criteria = [];
    let page = 1;
    let criteria = "_id;eq;" + object._id + ";STATIC";
    grid_api_params_criteria.push(criteria);
    const data = this.setPageNoAndSize(this.getPaylodWithCriteria(currentMenu.name,'',grid_api_params_criteria,''),page);
    const getFilterData = {
      data: data,
      path: null
    }
    this.apiService.getGridRunningData(getFilterData);
  }
  setPageNumverAndSize(payload:any,page:number,){
    payload['pageNo'] = page - 1;
    payload['pageSize'] = this.itemNumOfGrid;
    return payload;
  }
  getPage(page: number,tab:any,currentMenu:string,headElements:object,filterForm:object,selectContact:any) {
  return this.getDataForGrid(page,tab,currentMenu,headElements,filterForm,selectContact);
  }
  isGridFieldExist(tab:any,fieldName:any){
    if(tab.grid && tab.grid[fieldName] && tab.grid[fieldName] != undefined && tab.grid[fieldName] != null && tab.grid[fieldName] != ''){
    return true;
    }
    return false;
  }
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

  getOperatorSymbol(operator:any){
    switch (operator) {
      case 'eq':
        return '=';
      default:
        return '=';
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

  getRouthQueryToRedirectUrl(){
    const redirectUrl:any = this.storageService.getRedirectUrl();
      let searchKey = '';
      if(redirectUrl.indexOf('?') != -1 ){
        searchKey = '?';
      }
      if(redirectUrl.indexOf('%') != -1){
        searchKey = '%';
      }

      let newUrlWithQuery = '';
      if(searchKey != ''){
        const index = redirectUrl.indexOf(searchKey);
        const stringLength = redirectUrl.length;
        const queryPrams = redirectUrl.substring(index,stringLength);
        const newParam = queryPrams.replace('%3F','');
        newUrlWithQuery = newParam.replace('%3D',':');
      }
      return {newUrlWithQuery};
  }

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

  getUserPrefrerence(user:any) {
    let criteria = "userId._id;eq;"+user._id+";STATIC";
    let myData = this.setPageNoAndSize(this.getPaylodWithCriteria("user_preference", "", [criteria], {}),1);
    const payloadData = {
      path: null,
      data : myData
    }
    this.apiService.getFavouriteData(payloadData);
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
  getUserNotification(pageNo:any){
    let user = this.storageService.GetUserInfo();
    const userId = user._id;
    if(userId && userId != null && userId != ''){
      const criteria:any = "userId._id;eq;"+userId+";STATIC";
      const payload = this.setPageNoAndSize(this.getPaylodWithCriteria('user_notification','',[criteria],{}),pageNo);
      const callPayload = {
        "path" : null,
        "data": payload
      }
      this.apiService.getUserNotification(callPayload);
    }
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
  modifiedGridColumns(gridColumns:any,object:any){
    if(gridColumns.length > 0){
      gridColumns.forEach((field:any) => {
        if(this.coreFunctionService.isNotBlank(field.show_if)){
          if(!this.showIf(field,object)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }
        }else{
          field['display'] = true;
        }
      });
    }
    return gridColumns;
  }

  getApplicationAllSettings() {
    const payload1 = this.setPageNoAndSize(this.getPaylodWithCriteria("application_setting", "", [], {}), 1);
    this.apiService.getAplicationsSetting(payload1);
    const payload = this.setPageNoAndSize(this.getPaylodWithCriteria("application_theme_setting", "", [], {}), 1);
    this.apiService.getAplicationsThemeSetting(payload);
  }


  manufactured_as_customer(templateForm: FormGroup) {
    (<FormGroup>templateForm.controls["sample_details"]).controls["mfg_by"].patchValue(templateForm.value.account.name);
  }

  supplied_as_customer(templateForm: FormGroup) {
    (<FormGroup>templateForm.controls["sample_details"]).controls["supplied_by"].patchValue(templateForm.value.account.name);
  }
  setValueInVieldsForChild(templateForm: FormGroup, field: any) {
    (<FormGroup>templateForm.controls['total_amount']).addControl('discount_amount', new FormControl(''))
    field.value.forEach((element:any) => {
      (<FormGroup>templateForm.controls[field.field]).controls[element.field].patchValue(element.value);
    });
    return templateForm;
  }



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

  modifyFileSetValue(files:any){
    let fileName = '';
    let fileLength = files.length;
    let file = files[0];
    if(fileLength == 1 && (file.fileName || file.rollName)){
      fileName = file.fileName || file.rollName;
    }else if(fileLength > 1){
      fileName = fileLength + " Files";
    }
    return fileName;
  }
  modifyUploadFiles(files:any){
    const fileList:any = [];
    if(files && files.length > 0){
      files.forEach((element:any) => {
        if(element._id){
          fileList.push(element)
        }else{
          if(!element.uploadData){
            fileList.push({uploadData:[element]});
          }else{
            fileList.push(element);
          }
        }
      });
    }
    return fileList;
  }
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
