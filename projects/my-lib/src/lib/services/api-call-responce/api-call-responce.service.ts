import { Injectable } from '@angular/core';
import { EnvService } from '../env/env.service';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCallResponceService {

  constructor(
    private envService:EnvService,
    private coreFunctionService:CoreFunctionService,
    private storageService:StorageService

  ) { }

  saveFormResponceHandling(saveFromDataRsponce:any,showNotify:boolean,updateMode:boolean,currentActionButton:any,nextIndex:any,dataListForUpload:any,saveResponceData:any,custmizedFormValue:any,modifyCustmizedFormValue:any,dataSaveInProgress:any,isStepper:any,complete_object_payload_mode:any,form:any){
    let result ={
      message : {
        msg : "",
        class : ""
      },
      showNotify:showNotify,
      updateMode:updateMode,
      next:false,
      resetForm:false,
      resetResponce:false,
      successAction:false,
      dataListForUpload:dataListForUpload,
      saveResponceData:saveResponceData,
      custmizedFormValue:custmizedFormValue,
      modifyCustmizedFormValue:modifyCustmizedFormValue,
      dataSaveInProgress:dataSaveInProgress,
      isStepper:isStepper,
      complete_object_payload_mode:complete_object_payload_mode,
      public:{
        check:false,
        getFormData:{},
        url:""
      }
    }
    if (saveFromDataRsponce) {
      if (saveFromDataRsponce.success && saveFromDataRsponce.success != '' && result.showNotify) {
        if (saveFromDataRsponce.success == 'success') {
          if(currentActionButton && currentActionButton.onclick && currentActionButton.onclick.success_msg && currentActionButton.onclick.success_msg != ''){
            result.message.msg = currentActionButton.onclick.success_msg;
            result.message.class = "bg-success";
          }else if(saveFromDataRsponce.success_msg && saveFromDataRsponce.success_msg != ''){
            result.message.msg = saveFromDataRsponce.success_msg;
            result.message.class = "bg-success";
          }else{
            if(result.updateMode){
              result.message.msg = " Form Data Update successfull !!!";
            }else{
              result.message.msg = " Form Data Save successfull !!!";
            }
            result.message.class = "bg-success";
          }
          if(result.updateMode){
            if(nextIndex){
              result.next = true;
            }else{
              result.resetForm = true;
              result.updateMode = false;
            }
            result.custmizedFormValue = {};
            result.modifyCustmizedFormValue = {};
          }else{
            result.resetForm = true;
          }
          result.dataListForUpload = {}
          result.saveResponceData = saveFromDataRsponce.data;
        }
        if(this.envService.getRequestType() == 'PUBLIC'){
          result.complete_object_payload_mode = false;
          result.public.check = true;
          let _id = result.saveResponceData["_id"];
          if(this.coreFunctionService.isNotBlank(form["details"]) && this.coreFunctionService.isNotBlank(form["details"]["on_success_url_key"] != "")){
            let public_key = form["details"]["on_success_url_key"]
            const data = {
              "obj":public_key,
              "key":_id,
              "key1": "key2",
              "key2" : "key3",
            }
            let payloaddata = {};
            this.storageService.removeDataFormStorage();
            const getFormData = {
              data: payloaddata,
              _id:_id
            }
            getFormData.data=data;
            result.public.getFormData = getFormData;
            //this.apiService.GetForm(getFormData);
            let navigation_url = "pbl/"+public_key+"/"+_id+"/ie09/cnf00v";
            result.public.url = navigation_url;
            //this.router.navigate([navigation_url]);
          }else{
            result.public.url = "home_page";
            //this.router.navigate(["home_page"]);
          }

        }
        result.showNotify = false;
        result.dataSaveInProgress = true;
        result.resetResponce = true;
        result.successAction = true;
      }else if (saveFromDataRsponce.error && saveFromDataRsponce.error != '' && result.showNotify) {
        result.message.msg = saveFromDataRsponce.error;
        result.message.class = "bg-danger";
        result.showNotify = false;
        result.dataSaveInProgress = true;
        result.resetResponce = true;
      }else{
        if(result.showNotify){
          result.showNotify = false;
          result.message.msg = "No data return";
          result.message.class = "bg-danger";
          result.dataSaveInProgress = true;
        }
      }
    }
    return result;
  }

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
  setGridFilterData(gridFilterData:any,tabFilterData:any){
    let result = {
      tabFilterData:tabFilterData
    }
    if (gridFilterData) {
      if (gridFilterData.data && gridFilterData.data.length > 0) {
        result.tabFilterData = JSON.parse(JSON.stringify(gridFilterData.data));
      } else {
        result.tabFilterData = [];
      }
    }
    return result.tabFilterData;
  }
  setTypeaheadData(data:any,typeAheadData:any){
    let result = {
      typeAheadData:typeAheadData
    }
    if (data && data.length > 0) {
      result.typeAheadData = data;
    } else {
      result.typeAheadData = [];
    }
    return result.typeAheadData;
  }
}
