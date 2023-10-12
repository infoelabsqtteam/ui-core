import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../common-utils/common-function.service';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {

  constructor(
    private commonFunctionService:CommonFunctionService
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

              const payload = this.commonFunctionService.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, formValueWithCustomData)
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

                          const payload = this.commonFunctionService.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, formValueWithCustomData)
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
                          staticModal.push(this.commonFunctionService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, formValueWithCustomData));
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
              staticModal.push(this.commonFunctionService.getPaylodWithCriteria(editeTreeModifyData.onchange_api_params, editeTreeModifyData.onchange_call_back_field, editeTreeModifyData.onchange_api_params_criteria, formValueWithCustomData));
            }
          }
        }
        if(element.type && element.type == 'pdf_view'){
          staticModal.push(this.commonFunctionService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,formValueWithCustomData))
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
    let staticModalG = this.commonFunctionService.commanApiPayload([],tableFields,formFieldButtons,formValue);
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
      staticModal.push(this.commonFunctionService.getPaylodWithCriteria(tab.api_params,tab.call_back_field,criteria,{}))

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
      staticModal.push(this.commonFunctionService.getPaylodWithCriteria(form.api_params,form.call_back_field,criteria,formDataObject))
    }
    return staticModal;
  }

}
