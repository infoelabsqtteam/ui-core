import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MultipleFormService {

  constructor() { }


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

}
