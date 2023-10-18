import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../../common-utils/common-function.service';

@Injectable({
  providedIn: 'root'
})
export class MultipleFormService {

  constructor(
    private commonFunctionService:CommonFunctionService
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
          const crList = this.commonFunctionService.getCriteriaList(criteria,{});
          const payload = this.commonFunctionService.getDataForGrid(1,{},{'name':params},[],{},'');
          payload.data.crList = crList;
          //this.apiService.getGridData(payload);
          result.updateAddNew = true;
          result.payload = payload;
        }
      }
    }
    return result;
  }

}
