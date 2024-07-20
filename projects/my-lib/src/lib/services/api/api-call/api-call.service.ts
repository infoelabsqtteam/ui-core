import { CheckIfService } from './../../check-if/check-if.service';
import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { StorageService } from '../../storage/storage.service';
import { CoreFunctionService } from '../../common-utils/core-function/core-function.service';
import { ApiService } from '../../api/api.service';
import { Common } from '../../../shared/enums/common.enum';
import { ModelService } from '../../model/model.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {
  pageNumber: number = Common.PAGE_NO;
  itemNumOfGrid: any = Common.ITEM_NUM_OF_GRID;

  constructor(
    private commonFunctionService:CommonFunctionService,
    private storageService:StorageService,
    private coreFunctionService:CoreFunctionService,
    private apiService:ApiService,
    private checkIfService:CheckIfService,
    private modalService: ModelService,
  ) { }

  getOnchangePayload(tableFields:any,formValue:any,formValueWithCustomData:any){
    let staticModal:any = []
    if(tableFields && tableFields.length > 0){
      tableFields.forEach((element:any) => {
        if(element.field_name && element.field_name != ''){
          if (element.onchange_api_params && element.onchange_call_back_field && !element.do_not_auto_trigger_on_edit) {
            const checkFormGroup = element.onchange_call_back_field.indexOf("FORM_GROUP");
            const checkCLTFN = element.onchange_api_params.indexOf('CLTFN')
            if(checkFormGroup == -1 && checkCLTFN == -1){

              const payload = this.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, formValueWithCustomData)
              if(element.onchange_api_params.indexOf('QTMP') >= 0){
                if(element && element.formValueAsObjectForQtmp){
                  payload["data"]=formValue;
                }else{
                  payload["data"]=formValueWithCustomData;
                }
              }
              staticModal.push(payload);
            }
          }
          switch (element.type) {
            case "stepper":
              if (element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((step:any) => {
                  if (step.list_of_fields.length > 0) {
                    step.list_of_fields.forEach((data:any) => {
                      if (data.onchange_api_params && data.onchange_call_back_field && !data.do_not_auto_trigger_on_edit) {
                        const checkFormGroup = data.onchange_call_back_field.indexOf("FORM_GROUP");
                        if(checkFormGroup == -1){

                          const payload = this.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, formValueWithCustomData)
                          if(data.onchange_api_params.indexOf('QTMP') >= 0){
                            if(element && element.formValueAsObjectForQtmp){
                              payload["data"]=formValue;
                            }else{
                              payload["data"]=formValueWithCustomData;
                            }
                          }
                          staticModal.push(payload);
                        }
                      }
                      if(data.tree_view_object && data.tree_view_object.field_name != ""){
                        let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                        if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
                          staticModal.push(this.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, formValueWithCustomData));
                        }
                      }
                    });
                  }
                });
              }
              break;
          }
          if(element.tree_view_object && element.tree_view_object.field_name != ""){
            let editeTreeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
            if (editeTreeModifyData.onchange_api_params && editeTreeModifyData.onchange_call_back_field) {
              staticModal.push(this.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, formValueWithCustomData));
            }
          }
        }
        if(element.type && element.type == 'pdf_view'){
          staticModal.push(this.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,formValueWithCustomData))
        }
      });
    }
    return staticModal;
  }
  getStaticDataPayload(staticModal:any,object:any,formDataObject:any,multipleFormCollection:any,tableFields:any,formFieldButtons:any,tab:any,form:any,saveResponceData:any,editedRowIndex:any){
    let formValue = object;
    if(multipleFormCollection && multipleFormCollection.length > 0){
      let multiCollection = JSON.parse(JSON.stringify(multipleFormCollection));
      formValue = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,object);
    }
    let staticModalG = this.commanApiPayload([],tableFields,formFieldButtons,formValue);
    if(staticModalG && staticModalG.length > 0){
      staticModalG.forEach((element:any) => {
        staticModal.push(element);
      });
    }
    if(tab && tab.api_params && tab.api_params != null && tab.api_params != "" && tab.api_params != undefined){
      let criteria = [];
      if(tab.api_params_criteria && tab.api_params_criteria != null){
        criteria=tab.api_params_criteria
      }
      staticModal.push(this.getPaylodWithCriteria(tab.api_params,tab.call_back_field,criteria,{}))

    }
    if(form && form.api_params && form.api_params != null && form.api_params != "" && form.api_params != undefined){
      if(form.api_params == 'QTMP:EMAIL_WITH_TEMP:QUOTATION_LETTER'){
        object = saveResponceData;
      }
      let criteria = [];
      if(form.api_params_criteria && form.api_params_criteria != null){
        criteria=form.api_params_criteria
      }
      if(editedRowIndex > -1){
        formDataObject = formValue;
      }
      staticModal.push(this.getPaylodWithCriteria(form.api_params,form.call_back_field,criteria,formDataObject))
    }
    return staticModal;
  }
  getOnClickLoadDataPayloads(field:any,multipleFormCollection:any,formValue:any,formValueWithCustomData:any){
    let api_params = field.onClickApiParams;
    let callBackfield = field.onClickCallBackField;
    let criteria = field.onClickApiParamsCriteria
    const payload = this.getPaylodWithCriteria(api_params,callBackfield,criteria,formValue);
    let payloads = [];
    payloads.push(this.checkQtmpApi(api_params,field,payload,multipleFormCollection,formValue,formValueWithCustomData));
    return payloads;
  }
  getPaylodWithCriteria(params:any, callback:any, criteria:any, object:any,data_template?:any) {
    const tabName =  this.storageService.GetActiveMenu();
    let activeRole = this.storageService.getActiveRole();
    let tab = '';
    let roleName = "";
    if(tabName && tabName.name && tabName.name != ''){
      tab = tabName.name;
    }
    if(activeRole && activeRole.name != ''){
      roleName = activeRole.name;
    }
    let staticModal:any = {
      "key": this.commonFunctionService.getRefcode(),
      "key2": this.storageService.getAppId(),
      "value": params,
      "log": this.storageService.getUserLog(),
      "crList": [],
      "module": this.storageService.getModule(),
      "tab": tab
    }
    if(roleName != ''){
      staticModal['role'] = roleName;
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
  getCriteriaList(criteria:any,object:any){
    const crList:any = [];
    criteria.forEach((element: string) => {
      const criteria = element.split(";");
      const fValue = criteria[2]
      let fvalue ='';
      if(criteria[3] && criteria[3] == 'STATIC'){
        fvalue = fValue;
      }else{
        fvalue = this.commonFunctionService.getObjectValue(fValue, object)
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
  getTabsPayloadForCountList(tabs:any){
    let payloads:any = [];
    if(tabs && tabs.length >= 1){
      tabs.forEach((tab: any) => {
        if(tab.grid){
          let grid_api_params_criteria = [];
          if(this.checkIfService.isGridFieldExist(tab,"api_params_criteria")){
            grid_api_params_criteria = tab.grid.api_params_criteria;
          }
          const payload = this.getPaylodWithCriteria(tab.tab_name,tab.tab_name+"_"+tab.name,grid_api_params_criteria,{});
          payload['countOnly'] = true;
          payloads.push(payload);
        }
      });
    }
    return payloads;
  }
  getTabsCountPyload(tabs:any){
    let payloads = this.getTabsPayloadForCountList(tabs);
    if(payloads && payloads.length > 0){
      this.apiService.getGridCountData(payloads);
    }
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
  getfilterCrlist(headElements:any,formValue:any) {
    const filterList:any = []
    if(formValue != undefined && headElements && headElements.length > 0){
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
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0 && element.type != 'dropdown'){
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
                      "operator": this.storageService.getDefaultSearchOperator()
                    }
                  )
                }
              }
              break;
            case "number":
                if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                  if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                    element.api_params_criteria.forEach((cri: any) => {
                      criteria.push(cri)
                    });
                  }else{
                    filterList.push(
                      {
                        "fName": fieldName,
                        "fValue": this.commonFunctionService.getddnDisplayVal(value),
                        "operator": "eq"
                      }
                    )
                  }
                }
                break;
            case "typeahead":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.commonFunctionService.isArray(element.dataFilterCriteria) && element.dataFilterCriteria.length > 0){
                  element.dataFilterCriteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.getValueForDotFieldName(value,fieldName),
                      "operator": this.storageService.getDefaultSearchOperator()
                    }
                  )
                }
              }
              break;
            case "info":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.commonFunctionService.getddnDisplayVal(value),
                      "operator": this.storageService.getDefaultSearchOperator()
                    }
                  )
                }
              }
              break;
              case "reference_names":
              case "chips":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName+".name",
                      "fValue": this.commonFunctionService.getddnDisplayVal(value),
                      "operator": this.storageService.getDefaultSearchOperator()
                    }
                  )
                }
              }
              break;
            case "date":
            case "datetime":
              if(formValue && formValue[fieldName] && formValue[fieldName] != ''){
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.commonFunctionService.dateFormat(value),
                      "operator": "eq"
                    }
                  )
                }
              }
              break;
            case "daterange":
              if(formValue && formValue[fieldName] && formValue[fieldName].start != '' && formValue[fieldName].end != null){
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.commonFunctionService.dateFormat(value.start),
                      "operator": "gte"
                    }
                  )
                }
              }
              if(formValue && formValue[fieldName] && formValue[fieldName].end != '' && formValue[fieldName].end != null){
                if(this.commonFunctionService.isArray(element.api_params_criteria) && element.api_params_criteria.length > 0){
                  element.api_params_criteria.forEach((cri: any) => {
                    criteria.push(cri)
                  });
                }else{
                  filterList.push(
                    {
                      "fName": fieldName,
                      "fValue": this.commonFunctionService.dateFormat(value.end),
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
  getValueForDotFieldName(value:any,fieldName:any){
    let crValue = "";
    if(typeof value == "string"){
      crValue = value;
    }else if(typeof value == "object"){
      let fName = fieldName.indexOf('.') != -1 ? (fieldName).split('.')[0]:fieldName;
      let objectValue:any = {};
      objectValue[fName] =  value
      crValue = fieldName.indexOf('.') != -1 ?this.commonFunctionService.getObjectValue(fieldName,objectValue): this.commonFunctionService.getddnDisplayVal(value);
    }
    return crValue;
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
  getUserNotification(pageNo:any){
    let user = this.storageService.GetUserInfo();
    const userId = user._id;
    if(userId && userId != null && userId != ''){
      let criteraiList:any=[];
      criteraiList.push("userId._id;eq;"+userId+";STATIC");
      criteraiList.push("notificationStatus;eq;UNREAD;STATIC");
      const payload = this.setPageNoAndSize(this.getPaylodWithCriteria('user_notification_master','',criteraiList,{}),pageNo);
      const callPayload = {
        "path" : null,
        "data": payload
      }
      this.apiService.getUserNotification(callPayload);
    }
  }
    getUserNotificationSetting(){
    this.apiService.getUserNotificationSetting();
  }

  getApplicationAllSettings() {
    const payload1 = this.setPageNoAndSize(this.getPaylodWithCriteria("application_setting", "", [], {}), 1);
    this.apiService.getAplicationsSetting(payload1);
    const payload = this.setPageNoAndSize(this.getPaylodWithCriteria("application_theme_setting", "", [], {}), 1);
    this.apiService.getAplicationsThemeSetting(payload);
  }
  getDataForGrid(page:any,tab:any,currentMenu:any,headElements:any,filterForm:any,selectContact:any){
    // let grid_api_params_criteria = [];
    // if(tab.grid && tab.grid.grid_page_size && tab.grid.grid_page_size != null && tab.grid.grid_page_size != ''){
    //   this.itemNumOfGrid = tab.grid.grid_page_size;
    // }
    // if(this.checkIfService.isGridFieldExist(tab,"api_params_criteria")){
    //   grid_api_params_criteria = tab.grid.api_params_criteria;
    // }
    //const data = this.setPageNoAndSize(this.getPaylodWithCriteria(currentMenu.name,'',grid_api_params_criteria,''),page);
    let  crList=[];
    this.getfilterCrlist(headElements,filterForm).forEach((element: any) => {
      crList.push(element);
    });
    if(selectContact != ''){
      const tabFilterCrlist = {
        "fName": 'account._id',
        "fValue": selectContact,
        "operator": 'eq'
      }
      crList.push(tabFilterCrlist);
    }
    return this.getDataForGridFilter(page,tab,currentMenu,crList);
    // const getFilterData = {
    //   data: data,
    //   path: null
    // }
    // return getFilterData;
  }


  getDataForGridFilter(page:any,tab:any,currentMenu:any,crList:any){
    let grid_api_params_criteria = [];
    if(tab && tab?.grid && tab?.grid?.grid_page_size){
      this.itemNumOfGrid = tab.grid.grid_page_size;
    }
    if(this.checkIfService.isGridFieldExist(tab,"api_params_criteria")){
      grid_api_params_criteria = tab.grid.api_params_criteria;
    }
    const data = this.setPageNoAndSize(this.getPaylodWithCriteria(currentMenu.name,'',grid_api_params_criteria,''),page);

    if(crList && crList.length>0){
      if(data && data?.crList && data.crList.length > 0){
        crList.forEach((cr:any) => {
          data.crList.push(cr);
        });
      }else{
        data.crList = crList;
      }
    }
    const getFilterData = {
      data: data,
      path: null
    }
    return getFilterData;
  }
  getPage(page: number,tab:any,currentMenu:string,headElements:object,filterForm:object,selectContact:any) {
    return this.getDataForGrid(page,tab,currentMenu,headElements,filterForm,selectContact);
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
  getTemData(tempName:any) {
    //const params = "form_template";
    //const criteria = ["name;eq;"+tempName+";STATIC"];
    //const payload = this.getPaylodWithCriteria(params,'',criteria,{});
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
    const payload = this.getTempPayload(tempName,'eq');
    return payload;
  }
  getTempPayload(value:any,operator:string){
    const params = "form_template";
    const criteria = ["name;"+operator+";"+value+";STATIC"];
    const payload = this.getPaylodWithCriteria(params,'',criteria,{});
    return payload;
  }
  setPageNoAndSize(payload:any,page:number){
    payload['pageNo'] = page - 1;
    payload['pageSize'] = this.itemNumOfGrid;
    return payload;
  }
  checkQtmpApi(params:any,field:any,payload:any,multipleFormCollection:any,object:any,objectWithCustom:any){
    if(params.indexOf("FORM_GROUP") >= 0 || params.indexOf("QTMP") >= 0){
      let multiCollection = JSON.parse(JSON.stringify(multipleFormCollection));
      if(field && field.formValueAsObjectForQtmp){
        let formValue = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,object);
        payload["data"]=formValue;
      }else{
        let formValue = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,objectWithCustom);
        payload["data"]=formValue;
      }
    }
    return payload;
  }
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
}
