import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { FileHandlerService } from '../../fileHandler/file-handler.service';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {

  constructor(
    private commonFunctionService:CommonFunctionService,
    private fileHandlerService: FileHandlerService
  ) { }

  editeListFieldData(templateForm:FormGroup,custmizedFormValue:any,tableFields:any,field:any,index:any,listOfFieldsUpdateIndex:any,staticData:any,dataListForUpload:any){
    let responce = {
      "listOfFieldUpdateMode":true,
      "listOfFieldsUpdateIndex":listOfFieldsUpdateIndex,
      "custmizedFormValue":custmizedFormValue,
      "dataListForUpload":dataListForUpload,
      "templateForm":templateForm
    }
    let parentList = responce.custmizedFormValue[field.field_name];
    let object = parentList[index];
    responce.listOfFieldsUpdateIndex = index;
    if(tableFields && tableFields.length > 0){
      tableFields.forEach((element:any) => {
        switch (element.type) {
          case "list_of_fields":
            if(element.field_name == field.field_name && templateForm != null){
              responce.templateForm.controls[element.field_name].reset();
              if (element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((data:any) => {
                  switch (data.type) {
                    case "list_of_string":
                      const custmisedKey = this.commonFunctionService.custmizedKey(element);
                      if (!responce.custmizedFormValue[custmisedKey]) responce.custmizedFormValue[custmisedKey] = {};
                      responce.custmizedFormValue[custmisedKey][data.field_name] = object[data.field_name];
                      break;
                    case "typeahead":
                      if (data.datatype == 'list_of_object') {
                        const custmisedKey = this.commonFunctionService.custmizedKey(element);
                        if (!responce.custmizedFormValue[custmisedKey]) responce.custmizedFormValue[custmisedKey] = {};
                        responce.custmizedFormValue[custmisedKey][data.field_name] = object[data.field_name];
                      } else {
                        (<FormGroup>responce.templateForm.controls[element.field_name]).controls[data.field_name].setValue(object[data.field_name]);
                      }
                      break;
                    case "list_of_checkbox":
                      let checkboxListValue:any = [];
                      if(staticData && staticData[data.ddn_field] && staticData[data.ddn_field].length > 0){
                        staticData[data.ddn_field].forEach((value:any) => {
                          let arrayData = object[data.field_name];
                          let selected = false;
                          if (arrayData != undefined && arrayData != null) {
                            for (let index = 0; index < arrayData.length; index++) {
                              if (this.commonFunctionService.checkObjecOrString(value) == this.commonFunctionService.checkObjecOrString(arrayData[index])) {
                                selected = true;
                                break;
                              }
                            }
                          }
                          if (selected) {
                            checkboxListValue.push(true);
                          } else {
                            checkboxListValue.push(false);
                          }
                        });
                      }
                      //this.templateForm.get(element.field_name).get(data.field_name).setValue(checkboxListValue);
                      (<FormGroup>responce.templateForm.controls[element.field_name]).controls[data.field_name].setValue(checkboxListValue);
                      break;
                    case "file":
                    case "input_with_uploadfile":
                      if(object[data.field_name] != null && object[data.field_name] != undefined){
                        let custmizedKey = this.commonFunctionService.custmizedKey(element);
                        if (!responce.dataListForUpload[custmizedKey]) responce.dataListForUpload[custmizedKey] = {};
                        if (!responce.dataListForUpload[custmizedKey][data.field_name]) responce.dataListForUpload[custmizedKey][data.field_name] = [];
                        responce.dataListForUpload[custmizedKey][data.field_name] = JSON.parse(JSON.stringify(object[data.field_name]));
                        const value = this.fileHandlerService.modifyFileSetValue(object[data.field_name]);
                        //this.templateForm.get(element.field_name).get(data.field_name).setValue(value);
                        (<FormGroup>responce.templateForm.controls[element.field_name]).controls[data.field_name].setValue(value);
                      }
                      break;
                    default:
                      //this.templateForm.get(element.field_name).get(data.field_name).setValue(object[data.field_name]);
                      (<FormGroup>responce.templateForm.controls[element.field_name]).controls[data.field_name].setValue(object[data.field_name]);
                      break;
                  }
                })
              }
            }
            break;
          default:
            break;
        }
      });
    }
    return responce;
  }
}
