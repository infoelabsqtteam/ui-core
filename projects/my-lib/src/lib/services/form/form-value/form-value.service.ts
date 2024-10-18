import { CheckIfService } from './../../check-if/check-if.service';
import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FileHandlerService } from '../../fileHandler/file-handler.service';
import { PermissionService } from '../../permission/permission.service';
import { EnvService } from '../../env/env.service';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { StorageService } from '../../storage/storage.service';
import { GridCommonFunctionService } from '../../grid/grid-common-function/grid-common-function.service';
import { MenuOrModuleCommonService } from '../../menu-or-module-common/menu-or-module-common.service';
@Injectable({
  providedIn: 'root'
})
export class FormValueService {

  constructor(
    private datePipe: DatePipe,
    private fileHandlerService:FileHandlerService,
    private permissionService:PermissionService,
    private envService:EnvService,
    private commonFunctionService:CommonFunctionService,
    private gridCommonFunctionService:GridCommonFunctionService,
    private menuOrModuleCommonService:MenuOrModuleCommonService,
    private storageService:StorageService,
    private checkIfService:CheckIfService
  ) { }

  getFormValue(check:boolean,formValue:any,selectedRowData:any,updateMode:boolean,complete_object_payload_mode:boolean,tableFields:any,latitude:any,longitude:any,address:any,custmizedFormValue:any,checkBoxFieldListValue:any,staticData:any,dataListForUpload:any,selectContact:any,tabFilterData:any,params:any,getLocation:any,center:any){
    //let formValue = this.templateForm.getRawValue();
    let selectedRow = { ...selectedRowData };
    let modifyFormValue:any = {};
    let valueOfForm:any = {};
    if (updateMode || complete_object_payload_mode){
      tableFields.forEach((element:any) => {
        if(element.field_name && element.field_name != ''){
          switch (element.type) {
            case 'stepper':
              element.list_of_fields.forEach((step:any) => {
                if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                  step.list_of_fields.forEach((data:any) => {
                    selectedRow[data.field_name] = formValue[step.field_name][data.field_name]
                    if(data.tree_view_object && data.tree_view_object.field_name != ""){
                      const treeViewField = data.tree_view_object.field_name;
                      selectedRow[treeViewField] = formValue[step.field_name][treeViewField]
                    }
                  });
                }
              });
              break;
            case 'group_of_fields':
              element.list_of_fields.forEach((data:any) => {
                switch (data.type) {
                  case 'date':
                    if(data && data.date_format && data.date_format != ''){
                      if(typeof formValue[element.field_name][data.field_name] != 'string'){
                        selectedRow[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                      }else{
                        selectedRow[element.field_name] = formValue[element.field_name];
                      }
                    }else{
                      selectedRow[element.field_name] = formValue[element.field_name];
                    }
                    break;

                  default:
                    selectedRow[element.field_name] = formValue[element.field_name];
                    break;
                }
              });
              break;
            case 'gmap':
            case "gmapview":
              if(element && element.datatype == "object"){
                let locationData:any = {};
                locationData['latitude'] = latitude;
                locationData['longitude'] = longitude;
                locationData['address'] = address;
                locationData['date'] = JSON.parse(JSON.stringify(new Date()));
                locationData['time'] = this.datePipe.transform(new Date(),'shortTime');
                selectedRow[element.field_name] = locationData;
              }else{
                selectedRow['latitude'] = latitude;
                selectedRow['longitude'] = longitude;
                selectedRow[element.field_name] = address;
              }
              break;
            case 'date':
              if(element && element.date_format && element.date_format != ''){
                selectedRow[element.field_name] = this.datePipe.transform(selectedRow[element.field_name],'dd/MM/yyyy');
              } else {
                selectedRow[element.field_name] = formValue[element.field_name];
              }
              break;
            default:
              selectedRow[element.field_name] = formValue[element.field_name];
              break;
          }
        }
      });
    }else{
      tableFields.forEach((element:any) => {
        if(element.field_name && element.field_name != ''){
          switch (element.type) {
            case 'stepper':
              element.list_of_fields.forEach((step:any) => {
                if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                  step.list_of_fields.forEach((data:any) => {
                    modifyFormValue[data.field_name] = formValue[step.field_name][data.field_name]
                    if(data.tree_view_object && data.tree_view_object.field_name != ""){
                      const treeViewField = data.tree_view_object.field_name;
                      modifyFormValue[treeViewField] = formValue[step.field_name][treeViewField]
                    }
                  });
                }
              });
              break;
            case 'group_of_fields':
              modifyFormValue[element.field_name] = formValue[element.field_name];
              element.list_of_fields.forEach((data:any) => {
                switch (data.type) {
                  case 'date':
                    if(data && data.date_format && data.date_format != ''){
                      modifyFormValue[element.field_name][data.field_name] = this.datePipe.transform(formValue[element.field_name][data.field_name],'dd/MM/yyyy');
                    }  else {
                      modifyFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name];
                    }
                    break;

                  default:
                    modifyFormValue[element.field_name][data.field_name] = formValue[element.field_name][data.field_name];
                    break;
                }
              });
              break;
            case 'gmap':
            case "gmapview":
              if(element && element.datatype == "object"){
                let locationData:any = {};
                locationData['latitude'] = latitude;
                locationData['longitude'] = longitude;
                locationData['address'] = address;
                locationData['date'] = JSON.parse(JSON.stringify(new Date()));
                locationData['time'] = this.datePipe.transform(new Date(),'shortTime')
                modifyFormValue[element.field_name] = locationData;
              }else{
                modifyFormValue['latitude'] = latitude;
                modifyFormValue['longitude'] = longitude;
                modifyFormValue[element.field_name] = address;
              }
              break;
            case 'date':
              if(element && element.date_format && element.date_format != ''){
                modifyFormValue[element.field_name] = this.datePipe.transform(formValue[element.field_name],'dd/MM/yyyy');
              } else {
                modifyFormValue[element.field_name] = formValue[element.field_name];
              }
              break;
            default:
              modifyFormValue[element.field_name] = formValue[element.field_name];
              //modifyFormValue = formValue;
              break;
          }
        }
      });
    }
    if(check){
      if(custmizedFormValue && Object.keys(custmizedFormValue).length > 0){
        Object.keys(custmizedFormValue).forEach(key => {
          if (updateMode || complete_object_payload_mode) {
            if(custmizedFormValue[key] && custmizedFormValue[key] != null && !Array.isArray(custmizedFormValue[key]) && typeof custmizedFormValue[key] === "object"){
              tableFields.forEach((element:any) => {
                if(element.field_name == key){
                  if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
                    selectedRow[key] = custmizedFormValue[key];
                  }else{
                    Object.keys(custmizedFormValue[key]).forEach(child =>{
                      selectedRow[key][child] = custmizedFormValue[key][child];
                    })
                  }
                }
              });
            }else{
                selectedRow[key] = custmizedFormValue[key];
            }
          } else {
            if(custmizedFormValue[key] && custmizedFormValue[key] != null && !Array.isArray(custmizedFormValue[key]) && typeof custmizedFormValue[key] === "object"){
              tableFields.forEach((element:any) => {
                if(element.field_name == key){
                  if(element.datatype && element.datatype != null && element.datatype == 'key_value'){
                    modifyFormValue[key] = custmizedFormValue[key];
                  }else{
                    Object.keys(custmizedFormValue[key]).forEach(child =>{
                      modifyFormValue[key][child] = custmizedFormValue[key][child];
                    })
                  }
                }
              });
            }else{
              modifyFormValue[key] = custmizedFormValue[key];
            }

          }
        })
      }
      if (checkBoxFieldListValue.length > 0 && Object.keys(staticData).length > 0) {
        checkBoxFieldListValue.forEach((element:any) => {
          if (staticData[element.ddn_field]) {
            const listOfCheckboxData:any = [];
            let data = [];
            if(updateMode || complete_object_payload_mode){
              if(element.parent){
                data = selectedRow[element.parent][element.field_name];
              }else{
                data = selectedRow[element.field_name];
              }
            }else{
              if(element.parent){
                data = modifyFormValue[element.parent][element.field_name];
              }else{
                data = modifyFormValue[element.field_name];
              }
            }
            let currentData = staticData[element.ddn_field];
            if(data && data.length > 0){
              data.forEach((data:any, i:any) => {
                if (data) {
                  listOfCheckboxData.push(currentData[i]);
                }
              });
            }
            if (updateMode || complete_object_payload_mode) {
              if(element.parent){
                selectedRow[element.parent][element.field_name] = listOfCheckboxData;
              }else{
                selectedRow[element.field_name] = listOfCheckboxData;
              }
            } else {
              if(element.parent){
                modifyFormValue[element.parent][element.field_name] = listOfCheckboxData;
              }else{
                modifyFormValue[element.field_name] = listOfCheckboxData
              }
            }
          }
        });
      }
      if(dataListForUpload && Object.keys(dataListForUpload).length > 0){
        Object.keys(dataListForUpload).forEach(key => {
          if (updateMode || complete_object_payload_mode) {
            if(dataListForUpload[key] && dataListForUpload[key] != null && !Array.isArray(dataListForUpload[key]) && typeof dataListForUpload[key] === "object"){
              tableFields.forEach((element:any) => {
                if(element.field_name == key){
                  Object.keys(dataListForUpload[key]).forEach(child =>{
                    selectedRow[key][child] = this.fileHandlerService.modifyUploadFiles(dataListForUpload[key][child]);
                  })
                }
              });
            }else{
                selectedRow[key] = this.fileHandlerService.modifyUploadFiles(dataListForUpload[key]);
            }
          } else {
            if(dataListForUpload[key] && dataListForUpload[key] != null && !Array.isArray(dataListForUpload[key]) && typeof dataListForUpload[key] === "object"){
              tableFields.forEach((element:any) => {
                if(element.field_name == key){
                  Object.keys(dataListForUpload[key]).forEach(child =>{
                    modifyFormValue[key][child] = this.fileHandlerService.modifyUploadFiles(dataListForUpload[key][child]);
                  })
                }
              });
            }else{
              let uploadFileType = tableFields.filter((field:any)=> field.type == 'file_for_s3')
                  if(uploadFileType.length >0){
                    modifyFormValue[key] = dataListForUpload[key];
                  }else{
                    modifyFormValue[key] = this.fileHandlerService.modifyUploadFiles(dataListForUpload[key]);
                  }
            }

          }
        })
      }
    }
    if(selectContact != '' && selectContact != undefined){
      let selectContactObject:any = {}
      let account={};
      let contact={};
      tabFilterData.forEach((element:any) => {
        if(element._id == selectContact){
          selectContactObject = element;
        }
      });
      if(selectContactObject['_id']){
        contact = {
          "_id":selectContactObject['_id'],
          "name":selectContactObject['name'],
          "code":selectContactObject['serialId']
        }
        if(selectContactObject['lead']){
          account = selectContactObject['lead'];
        }
      }
      if(updateMode || complete_object_payload_mode){
        selectedRow['account'] = account;
        selectedRow['contact'] = contact;
      }else{
        modifyFormValue['account'] = account;
        modifyFormValue['contact'] = contact;
      }
    }

    valueOfForm = updateMode || complete_object_payload_mode ? selectedRow : modifyFormValue;
    if(params["key1"] && !complete_object_payload_mode){
      const index = JSON.stringify(params["key1"]);
      if(index != ''){
        valueOfForm['obj'] = params["action"];
        valueOfForm['key'] = params["key1"];
        valueOfForm['key1'] = params["key2"];
        valueOfForm['key2'] = params["key3"];

      }
    }
    if(getLocation){
      if(center !=null && center.lat !=null){
        valueOfForm['locationDetail'] = {
          'latitude' : center.lat,
          'longitude' : center.lng
        }
      }
    }
    return valueOfForm;
  }
  getSavePayloadData(currentMenu:any,updateMode:any,deleteGridRowData:any,tableFields:any,dataValue:any,formValueWithCustomData:any,gridSelectionMendetoryList:any,selectedRow:any,custmizedFormValue:any,dataSaveInProgress:any,showNotify:any,formName:any,formValid:boolean) {
    var responce:any={
      "getSavePayload":false,
      "showNotify":showNotify,
      "deleteGridRowData":deleteGridRowData,
      "dataSaveInProgress":dataSaveInProgress,
      "data":{},
      "message":{
        "msg":"",
        "class":""
      }
    }
    //this.submitted = true;
    let hasPermission;
    if(currentMenu && currentMenu.name){
      hasPermission = this.permissionService.checkPermissionWithParent(currentMenu,'add')
    }
    if(updateMode){
      hasPermission = this.permissionService.checkPermissionWithParent(currentMenu,'edit')
    }
    if(this.envService.getRequestType() == 'PUBLIC'){
      hasPermission = true;
    }
    let formValue;
    if(deleteGridRowData){
      formValue = dataValue;
    }else{
      formValue = this.commonFunctionService.sanitizeObject(tableFields,formValueWithCustomData,false);
    }
    responce.deleteGridRowData = false;

    if(hasPermission){
      let gridSelectionValidation:any = this.gridCommonFunctionService.checkGridSelectionMendetory(gridSelectionMendetoryList,selectedRow,dataValue,custmizedFormValue);
      if(formValid && gridSelectionValidation.status){
        let validationsresponse = this.checkIfService.checkCustmizedValuValidation(tableFields,formValue);
        if(validationsresponse && validationsresponse.status){
          if (dataSaveInProgress) {
            responce.showNotify = true;
            responce.dataSaveInProgress = false;
            this.addDefaultFieldInData(formValue);
            if (updateMode) {
              if(formName == 'cancel'){
                formValue['status'] = 'CANCELLED';
              }
            }
            responce.getSavePayload = true;
            responce.data=this.getSavePayload(currentMenu.name,formValue);
          }
        }else{
          responce.getSavePayload = false;
          responce.message.msg =validationsresponse.msg;
          responce.message.class = 'bg-danger';
          //this.notificationService.notify('bg-danger', validationsresponse.msg)
        }
      }else{
        responce.getSavePayload = false;
        if(gridSelectionValidation.msg && gridSelectionValidation.msg != ''){
          responce.message.msg = gridSelectionValidation.msg;
          responce.message.class = 'bg-info';
          //this.notificationService.notify("bg-info", gridSelectionValidation.msg);
        }else{
          responce.message.msg = "Some fields are mendatory";
          responce.message.class = 'bg-danger';
          //this.notificationService.notify("bg-danger", "Some fields are mendatory");
        }
      }
    }else{
      responce.getSavePayload = false;
      this.permissionService.checkTokenStatusForPermission();
    }
    return responce;
  }
  addDefaultFieldInData(data:any){
    data['log'] = this.storageService.getUserLog();
    if(!data['refCode']){
      data['refCode'] = this.commonFunctionService.getRefcode();
    }
    if(!data['appId']){
      data['appId'] = this.commonFunctionService.getAppId();
    }
  }
  getSavePayload(name:string,data:any){
    return {
      curTemp: name,
      data: data
    }
  }

  transformArrayToObject(allModuleList:any){
    let obj:any={}
    allModuleList.forEach((module:any)=>{
      if(module && module.name && module.notification && module.keyName){
        let name=module.keyName;
        let mod={
            reference:{
              name:module.name,
              _id:module._id
            },
            menus:this.menuOrModuleCommonService.getMenuDetails(module?.menu_list),
            notification:module.notification
        }
        obj[name]=mod
      }
    })
    return obj;
  }

}
