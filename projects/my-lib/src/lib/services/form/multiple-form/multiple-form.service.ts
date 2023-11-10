import { ApiCallService } from './../../api/api-call/api-call.service';
import { GridCommonFunctionService } from './../../grid/grid-common-function/grid-common-function.service';
import { ApiService } from './../../api/api.service';
import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { CoreFunctionService } from '../../common-utils/core-function/core-function.service';
import { CheckIfService } from '../../check-if/check-if.service';

@Injectable({
  providedIn: 'root'
})
export class MultipleFormService {

  constructor(
    private commonFunctionService:CommonFunctionService,
    private coreFunctionService:CoreFunctionService,
    private apiService:ApiService,
    private checkIfService:CheckIfService,
    private gridCommonFunctionService:GridCommonFunctionService,
    private apiCallService:ApiCallService
  ) { }


  setPreviousFormTargetFieldData(multipleFormCollection:any,formValueWithCust:any){
    let result = {
      multipleFormCollection:multipleFormCollection
    }
    if(result.multipleFormCollection.length > 0){
      const previousFormIndex = result.multipleFormCollection.length - 1;
      const previousFormData = result.multipleFormCollection[previousFormIndex];
      const previousFormField = previousFormData.current_field;
      const formData = previousFormData.next_form_data;
      if(previousFormField && previousFormField.add_new_target_field){
        const targateFieldName = previousFormField.add_new_target_field;
        const currentFormValue = formValueWithCust;
        const currentTargetFieldValue = currentFormValue[targateFieldName]
        formData[targateFieldName] = currentTargetFieldValue;
      }
      result.multipleFormCollection[previousFormIndex]['next_form_data'] = formData;
    }
    return result.multipleFormCollection;
  }
  getNextFormObject(nextFormData:any,next:any){
    const form = nextFormData.formName;
    const field_name = nextFormData.field_name;
    const form_field_name = nextFormData.form_field_name;
    const field = {
      'add_new_form': form,
      'add_next_form_button': next,
      'field_name': field_name,
      'type': 'hidden',
      'form_field_name': form_field_name,
      'form_value_index' : 0,
      'moveFieldsToNewForm' : ['employee_name#add_assignments.resource_name']
    };
    return field;
  }
  getNextFormData(formData:any,listOfFieldsUpdateIndex:any){
    let result ={
      updateAddNew:false,
      payload:{}
    }
    if(formData){
      let parent:any = '';
      let child:any = '';
      if(formData['parent_field']){
        parent = formData['parent_field'];
      }
      if(formData['current_field']){
        child = formData['current_field'];
      }
      let formValue = formData['data'];
      let fieldValue:any = '';
      if(parent != ''){
        if(parent.type == 'list_of_fields'){
          fieldValue = formValue[parent.field_name][listOfFieldsUpdateIndex][child.field_name];
        }else{
          fieldValue = formValue[parent.field_name][child.field_name];
        }
      }else{
        fieldValue = formValue[child.field_name];
      }
      if(fieldValue && fieldValue._id && fieldValue._id != ''){
        //console.log(fieldValue._id);
        const params = child.api_params;
        if(params && params != ''){
          const criteria = ["_id;eq;"+fieldValue._id+";STATIC"]
          const crList = this.apiCallService.getCriteriaList(criteria,{});
          const payload = this.apiCallService.getDataForGrid(1,{},{'name':params},[],{},'');
          payload.data.crList = crList;
          //this.apiService.getGridData(payload);
          result.updateAddNew = true;
          result.payload = payload;
        }
      }
    }
    return result;
  }
  storeFormDetails(parent_field:any,field:any,formValue:any,formValueWithCustomData:any,updateMode:boolean,nextFormData:any,lastTypeaheadTypeValue:any,multipleFormCollection:any,currentMenu:any,pForm:any,listOfFieldUpdateMode:any,listOfFieldsUpdateIndex:any,addNewRecord:any,enableNextButton:any,index?:number){
    let result = {
      multipleFormCollection:multipleFormCollection,
      form:{},
      id:"",
      addNewRecord:addNewRecord,
      criteria:[''],
      params:''
    }
    let targetFieldName:any ={}
    targetFieldName['form'] = {}
    targetFieldName['custom'] = [];
    let formData = JSON.parse(JSON.stringify(formValueWithCustomData));
    if(field && field.form_field_name){
      const nextFormReference = {
        '_id':nextFormData._id,
        'name':nextFormData.name
      }
      formData[field.form_field_name] = nextFormReference;
      updateMode = true;
    }
    if(this.coreFunctionService.isNotBlank(field.add_new_target_field)){
      targetFieldName['form'][field.add_new_target_field] = lastTypeaheadTypeValue
    }else if(field){
      switch (field.type) {
        case "list_of_fields":
        case "grid_selection":
          let currentFieldData = formData[field.field_name];
          if(currentFieldData && Array.isArray(currentFieldData)){
              if(index != undefined && index >= 0){
                targetFieldName['form'] = currentFieldData[index];
                targetFieldName['updataModeInPopupType'] = true;
              }else {
                targetFieldName['custom'] = currentFieldData;
              }
          }
          break;
        default:
          break;
      }
    }
    if(this.coreFunctionService.isNotBlank(field.moveFieldsToNewForm)){
      if(field.moveFieldsToNewForm && field.moveFieldsToNewForm.length > 0){
        field.moveFieldsToNewForm.forEach((keyValue:any) => {
          const sourceTarget = keyValue.split("#");
          let key = sourceTarget[0];
          let valueField = sourceTarget[1];
          let multiCollection = JSON.parse(JSON.stringify(result.multipleFormCollection));
          let formValueWithMulticollection = this.commonFunctionService.getFormDataInMultiformCollection(multiCollection,formValue);
          let value = this.commonFunctionService.getObjectValue(valueField,formValueWithMulticollection);
          targetFieldName['form'][key] = value;
        });
      }
    }
    let data = {
      "collection_name":currentMenu.name,
      "data":formData,
      "form":pForm,
      "parent_field":parent_field,
      "current_field":field,
      "next_form_data":targetFieldName,
      "updateMode" : updateMode,
      "form_value" : JSON.parse(JSON.stringify(formValue)),
      "index": -1,
      "listOfFieldUpdateMode":listOfFieldUpdateMode,
      "listOfFieldsUpdateIndex":listOfFieldsUpdateIndex
    }
    if(field){
        const type = field.type;
        switch (type) {
          case "list_of_fields":
          case "grid_selection":
            if(index != undefined){
              data['index'] = index;
            }
            break;
          default:
            break;
        }

    }
    result.multipleFormCollection.push(data);
    if(field && field.type == "list_of_fields"){
      let buttonLabel = "";
      if(index != undefined && index >= 0){
        buttonLabel = 'Update';
      }else{
        buttonLabel = 'Add';
      }
      if(field.list_of_fields && field.list_of_fields.length > 0){
        let fieldList:any = JSON.parse(JSON.stringify(field.list_of_fields));
        if(fieldList && fieldList.length > 0 && index == undefined){
          let curField = JSON.parse(JSON.stringify(field));
          curField['add_list_field'] = 'add';
          fieldList.push(curField);
        }
        result.form = {
          "details": {
              "class": "",
              "collection_name":"",
              "bulk_update":false
              },
          "tab_list_buttons": [
              {
                  "label": buttonLabel,
                  "onclick": {
                          "api": "add",
                          "action_name": "",
                          "close_form_on_succes": false
                      },
                  "type": "button",
                  "field_name": "save",
                  "api_params": "",
                  "show_if":"",
                  "disable_if":""
              },
              {
                "label": "Ok",
                "onclick": {
                        "api": "close",
                        "action_name": "",
                        "close_form_on_succes": false
                    },
                "type": "button",
                "field_name": "",
                "api_params": "",
                "show_if":"",
                "disable_if":""
            }
          ],
          "tableFields": fieldList,
          "api_params": null,
          "label": field.label
          }
      }else{
        if(field.form && field.form._id){
          result.id = field.form._id;
        }
      }
    }else{
      if(field.add_new_form && field.add_new_form._id){
        result.id = field.add_new_form._id;
      }
      result.addNewRecord = false;
      if(!enableNextButton && field && field.find_child_form){
        let cri = "collection.name;eq;" + currentMenu.name + ";STATIC";
        result.criteria = []
        result.criteria.push(cri);
        result.params = 'scheduled_task_form';
      }
    }
    return result;
  }

  getDataForNextForm(reqParams:string,reqCriteria:any) {
    const request = this.apiCallService.getDataForGrid(1, {}, { 'name': reqParams }, [], {}, '');
    const crList = this.apiCallService.getCriteriaList(reqCriteria, {});
    request.data.crList = crList;
    this.apiService.getNextFormData(request);
  }
  getNextFormById(id: string) {
    const params = "form";
    const criteria = ["_id;eq;" + id + ";STATIC"];
    const payload = this.apiCallService.getPaylodWithCriteria(params, '', criteria, {});
    this.apiService.GetNestedForm(payload);
  }

  updateNextFormData(multipleFormCollection:any,nextFormUpdateMode:boolean,form:any,custmizedFormValue:any,editedRowIndex:any,previousFormFocusField:any,tableFields:any){
    let result = {
      nextFormData: {},
      cdata:{},
      fData:{},
      nextFormUpdateMode:nextFormUpdateMode,
      custmizedFormValue:custmizedFormValue,
      fieldName:"",
      previousFormFocusField:previousFormFocusField,
      editFunction:false,
      updateFormFunction:false,
      getStaticData:false
    }
    let nextFormData:any = {}
    if(multipleFormCollection.length > 0){
      nextFormData = multipleFormCollection[multipleFormCollection.length -1];
    }
    if(nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['custom']){
      result.cdata = nextFormData['next_form_data']['custom'];
    }
    if(result.nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['form']){
      result.fData = nextFormData['next_form_data']['form'];
    }
    if(nextFormData['index'] != undefined && nextFormData['index'] >= 0){
      result.nextFormUpdateMode = true;
    }
    if(nextFormData && nextFormData['current_field'] && nextFormData['current_field']['type'] && (nextFormData['index'] == undefined || nextFormData['index'] == -1)){
      switch (nextFormData['current_field']['type']) {
        case 'list_of_fields':
        case 'grid_selection':
          if(Array.isArray(result.cdata)){
            if(form && form.buttons){
              if(!this.checkIfService.checkAddNewButtonOnGridSelection(form.buttons)){
                result.fieldName = nextFormData['current_field']['field_name'];
                result.custmizedFormValue[result.fieldName] = result.cdata;
                //this.modifyCustmizedValue(fieldName);
              }
            }
          }
          break;
        default:
          break;
      }
    }
    if(nextFormData && nextFormData['next_form_data'] && nextFormData['next_form_data']['updataModeInPopupType']){
      result.editFunction = true;
      //this.editedRowData(fData);
    }else{
      result.updateFormFunction=true;
      //this.updateDataOnFormField(fData);
      if(editedRowIndex >= 0 || Object.keys(result.fData).length > 0){
        result.getStaticData = true;
        //this.getStaticDataWithDependentData();
      }
    }
    let nextFormFocusedFieldname = '';
    for (let key in result.fData) {
      nextFormFocusedFieldname = key;
      break;
    }
    if (tableFields && tableFields.length > 0) {
      for (let i = 0; i < tableFields.length; i++) {
        const element = tableFields[i];
        if(nextFormFocusedFieldname == element.field_name){
          result.previousFormFocusField = element;
          break;
        }
      }
    }

    result.nextFormData = nextFormData;
    return result;
  }
}
