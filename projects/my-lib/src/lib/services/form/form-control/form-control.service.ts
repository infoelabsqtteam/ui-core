import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup } from '@angular/forms';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { FileHandlerService } from '../../fileHandler/file-handler.service';
import { GridCommonFunctionService } from '../../grid/grid-common-function/grid-common-function.service';
import { TreeComponentService } from '../../tree-component/tree-component.service';

@Injectable({
  providedIn: 'root'
})
export class FormControlService {

  constructor(
    private commonFunctionService:CommonFunctionService,
    private fileHandlerService: FileHandlerService,
    private gridCommonFunctionService:GridCommonFunctionService,
    private TreeComponentService:TreeComponentService
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
  updateDataOnForm(templateForm:FormGroup,tableFields:any,formValue:any,formFieldButtons:any,custmizedFormValue:any,modifyCustmizedFormValue:any,selectedRow:any,dataListForUpload:any,treeViewData:any,staticData:any,longitude:any,latitude:any,zoom:any){
    let responce ={
      templateForm:templateForm,
      custmizedFormValue:custmizedFormValue,
      modifyCustmizedFormValue:modifyCustmizedFormValue,
      tableFields:tableFields,
      dataListForUpload:dataListForUpload,
      selectedRow:selectedRow,
      treeViewData:treeViewData,
      staticData:staticData,
      longitude:longitude,
      latitude:latitude,
      zoom:zoom,
      getAddress:false

    }
    tableFields.forEach((element:any) => {
      if(element && element.field_name && element.field_name != ''){
        let fieldName = element.field_name;
        let object = formValue[fieldName];
        if(object != null && object != undefined){
          this.updateFormValue(element,formValue,responce);
        }
      }
    });
    if(formFieldButtons.length > 0){
      formFieldButtons.forEach((element:any) => {
        let fieldName = element.field_name;
        let object = selectedRow[fieldName];
        if(formValue[fieldName] != null && formValue[fieldName] != undefined){
          if(element.field_name && element.field_name != ''){
            switch (element.type) {
              case "dropdown":
                let dropdownValue = object == null ? null : object;
                responce.templateForm.controls[element.field_name].setValue(dropdownValue);
                break;
              default:
                break;
            }
          }
        }
      });
    }
    return responce;
  }
  updateFormValue(element:any,formValue:any,responce:any){
    let type = element.type;
    let datatype = element.datatype;
    let tree_view_object = element.tree_view_object;
    let date_format = element.date_format;
    let fieldName = element.field_name;
    let ddn_field = element.ddn_field;
    let parent = element.parent;
    let list_of_fields = element.list_of_fields;
    let object = formValue[fieldName];
    switch (type) {
      case "grid_selection":
      case 'grid_selection_vertical':
      case "list_of_string":
      case "drag_drop":
        if(object != null && object != undefined){
          if(Array.isArray(object)){
            responce.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));
            if(type.startsWith("grid_selection")){
              const modifyData = this.gridCommonFunctionService.gridDataModify(responce.modifyCustmizedFormValue,responce.custmizedFormValue,responce.tableFields,fieldName,"grid_selection",formValue);
              responce.modifyCustmizedFormValue = modifyData.modifyData;
              if(modifyData.field_index != -1){
                const index = modifyData.field_index;
                responce.tableFields[index] = modifyData.fields[index];
              }
            }
          }
          responce.templateForm.controls[fieldName].setValue('')
        }
        break;
      case "file":
      case "input_with_uploadfile":
      case "file_for_s3":
        if(object != null && object != undefined){
          responce.dataListForUpload[fieldName] = JSON.parse(JSON.stringify(object));
          const value = this.fileHandlerService.modifyFileSetValue(object);
          if(type == 'input_with_uploadfile'){
            let tooltipMsg = this.fileHandlerService.getFileTooltipMsg(object);
            element['tooltipMsg'] = tooltipMsg;
          }
          responce.templateForm.controls[fieldName].setValue(value);
        }
        break;
      case "list_of_fields":
        if(object != null && object != undefined){
          if(Array.isArray(object)){
            responce.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));
            let modifyObject = this.gridCommonFunctionService.modifyListofFieldsData(element,responce.custmizedFormValue[fieldName],element.list_of_fields);
            responce.modifyCustmizedFormValue[fieldName] = modifyObject['data'];
          }else if(typeof object == "object" && datatype == 'key_value'){
            responce.custmizedFormValue[fieldName] = object;
          }else{
            if(list_of_fields && list_of_fields != null && list_of_fields.length > 0){
              list_of_fields.forEach((data:any,j:any) => {
                switch (data.type) {
                  case "list_of_string":
                  case "grid_selection":
                  case 'grid_selection_vertical':
                  case "drag_drop":
                    if(object && object[data.field_name] != null && object[data.field_name] != undefined){
                      if(Array.isArray(object[data.field_name])){
                        if (!responce.custmizedFormValue[fieldName]) responce.custmizedFormValue[fieldName] = {};
                        responce.custmizedFormValue[fieldName][data.field_name] = JSON.parse(JSON.stringify(object[data.field_name]));
                      }
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[data.field_name].setValue('')
                      //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                    }
                    break;
                  case "typeahead":
                    if(data.datatype == "list_of_object" || datatype == 'chips'){
                      if(object && object[data.field_name] != null && object[data.field_name] != undefined){
                        if(Array.isArray(object[data.field_name])){
                          if (!responce.custmizedFormValue[fieldName]) responce.custmizedFormValue[fieldName] = {};
                          responce.custmizedFormValue[fieldName][data.field_name] = JSON.parse(JSON.stringify(object[data.field_name]));
                        }
                        (<FormGroup>responce.templateForm.controls[fieldName]).controls[data.field_name].setValue('')
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue('');
                      }
                    }else{
                      if(object && object[data.field_name] != null && object[data.field_name] != undefined){
                        const value = object[data.field_name];
                        (<FormGroup>responce.templateForm.controls[fieldName]).controls[data.field_name].setValue(value)
                        //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                      }
                    }
                    break;
                  case "input_with_uploadfile":
                    if(object != null && object != undefined && object[data.field_name] != null && object[data.field_name] != undefined){
                      let custmisedKey = this.commonFunctionService.custmizedKey(element);
                      responce.dataListForUpload[custmisedKey][data.field_name] = JSON.parse(JSON.stringify(object[data.field_name]));
                      const value = this.fileHandlerService.modifyFileSetValue(object[data.field_name]);
                      let tooltipMsg = this.fileHandlerService.getFileTooltipMsg(object[data.field_name]);
                      element.list_of_fields[j]['tooltipMsg'] = tooltipMsg;
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[data.field_name].setValue(value);
                    }
                    break;
                  default:
                    if(object && object[data.field_name] != null && object[data.field_name] != undefined){
                      const value = object[data.field_name];
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[data.field_name].setValue(value)
                      //(<FormGroup>this.templateForm.controls[element.field_name]).controls[data.field_name].patchValue(value);
                    }
                    break;
                }
              });
            }
          }
        }
        break;
      case "typeahead":
        if(datatype == "list_of_object" || datatype == 'chips'){
          if(object != null && object != undefined){
            responce.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));
            responce.templateForm.controls[fieldName].setValue('')
          }
        }else{
          if(object != null && object != undefined){
            const value = object;
            responce.templateForm.controls[fieldName].setValue(value)
          }
        }
        break;
      case "group_of_fields":
        if(list_of_fields && list_of_fields.length > 0){
          list_of_fields.forEach((data:any,j:any) => {
            let ChildFieldData = object;
            let childFieldName = data.field_name;
            if(data && childFieldName && childFieldName != '' && ChildFieldData && ChildFieldData != null){
              switch (data.type) {
                case "list_of_string":
                case "grid_selection":
                case 'grid_selection_vertical':
                case "drag_drop":
                  if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                    if (!responce.custmizedFormValue[fieldName]) responce.custmizedFormValue[fieldName] = {};
                    const value = JSON.parse(JSON.stringify(ChildFieldData[childFieldName]));
                    responce.custmizedFormValue[fieldName][childFieldName] = value;
                    //this.templateForm.get(fieldName).get(childFieldName).setValue('')
                    (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue('')
                    //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue('');
                  }
                  break;
                case "typeahead":
                  if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                    if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                      if (!responce.custmizedFormValue[fieldName]) responce.custmizedFormValue[fieldName] = {};
                      const value = JSON.parse(JSON.stringify(ChildFieldData[childFieldName]));
                      responce.custmizedFormValue[fieldName][childFieldName] = value;
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value);
                      //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue('');
                    }
                  }else{
                    if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                      const value = ChildFieldData[childFieldName];
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value)
                      //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue(value);
                    }
                  }
                  break;
                case "number":
                  if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                    let gvalue;
                    const value = ChildFieldData[childFieldName];
                    if(value != null && value != ''){
                      gvalue = value;
                    }else{
                      gvalue = 0;
                    }
                    (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(gvalue)
                    //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue(gvalue);
                  }else if(ChildFieldData && ChildFieldData.hasOwnProperty(childFieldName)){
                    let gvalue = 0;
                    (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(gvalue)
                  }
                  break;
                case "list_of_checkbox":
                  (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].patchValue([])
                  if(parent){
                    responce.selectedRow[parent] = {}
                    responce.selectedRow[parent][fieldName] = ChildFieldData;
                  }else{
                    responce.selectedRow[fieldName] = ChildFieldData;
                  }
                  //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue([]);
                  break;
                case "date":
                  if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                    if(data.date_format && data.date_format !="" && typeof ChildFieldData[childFieldName] === 'string'){
                      const date = ChildFieldData[childFieldName];
                      const dateMonthYear = date.split('/');
                      const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
                      const value = new Date(formatedDate);
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value)
                    }else{
                      const value = formValue[fieldName][childFieldName] == null ? null : formValue[fieldName][childFieldName];
                      (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value);
                    }
                  }
                  break;
                case "input_with_uploadfile":
                  if(object != null && object != undefined && object[data.field_name] != null && object[data.field_name] != undefined){
                    let custmisedKey = this.commonFunctionService.custmizedKey(element);
                    responce.dataListForUpload[custmisedKey][data.field_name] = JSON.parse(JSON.stringify(object[data.field_name]));
                    const value = this.fileHandlerService.modifyFileSetValue(object[data.field_name]);
                    let tooltipMsg = this.fileHandlerService.getFileTooltipMsg(object[data.field_name]);
                    element.list_of_fields[j]['tooltipMsg'] = tooltipMsg;
                    (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value);
                  }
                  break;
                default:
                  if(ChildFieldData && ChildFieldData[childFieldName] != null && ChildFieldData[childFieldName] != undefined && ChildFieldData[childFieldName] != ''){
                    const value = ChildFieldData[childFieldName];
                    (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(value)
                    //(<FormGroup>this.templateForm.controls[fieldName]).controls[childFieldName].patchValue(value);
                  }
                  break;
              }
            }
          });
        }
        break;
      case "tree_view_selection":
        if(formValue[fieldName] != null && formValue[fieldName] != undefined){
          responce.treeViewData[fieldName] = [];
          let treeDropdownValue = object == null ? null : object;
          if(treeDropdownValue != ""){
            responce.treeViewData[fieldName].push(JSON.parse(JSON.stringify(treeDropdownValue)));
          }
          responce.templateForm.controls[fieldName].setValue(treeDropdownValue)
        }
        break;
      case "tree_view":
        if(formValue[fieldName] != null && formValue[fieldName] != undefined){
          let treeValue = object == null ? null : object;
          responce.templateForm.controls[fieldName].setValue(treeValue);
          if(treeValue){
            let result = this.TreeComponentService.updateTreeViewData(JSON.parse(JSON.stringify(treeValue)),JSON.parse(JSON.stringify(element)),responce.treeViewData);
            responce.treeViewData =result.treeViewData;
          }
        }
        break;
      case "stepper":
        if(list_of_fields && list_of_fields.length > 0){
          list_of_fields.forEach((step:any) => {
            if(step.list_of_fields && step.list_of_fields.length > 0){
              step.list_of_fields.forEach((data:any) => {
                let childFieldName = data.field_name;
                switch (data.type) {
                  case "list_of_string":
                  case "grid_selection":
                  case 'grid_selection_vertical':
                    if(formValue[childFieldName] != null && formValue[childFieldName] != undefined && formValue[childFieldName] != ''){
                      responce.custmizedFormValue[childFieldName] = formValue[childFieldName]
                    }
                    (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].setValue('');
                    break;
                  case "typeahead":
                    if(data.datatype == "list_of_object" || data.datatype == 'chips'){
                      if(formValue[childFieldName] != null && formValue[childFieldName] != undefined && formValue[childFieldName] != ''){
                        responce.custmizedFormValue[childFieldName] = formValue[childFieldName]
                        (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].setValue('');
                      }
                    }else{
                      if(formValue[childFieldName] != null && formValue[childFieldName] != undefined && formValue[childFieldName] != ''){
                        const value = formValue[childFieldName];
                        (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].setValue(value);
                      }
                    }
                    break;
                  case "number":
                      let gvalue;
                      const value = formValue[childFieldName];
                      if(value != null && value != ''){
                        gvalue = value;
                      }else{
                        gvalue = 0;
                      }
                      (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].setValue(gvalue);
                    break;
                  case "list_of_checkbox":
                    (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].patchValue([]);
                    break;
                  default:
                    if(formValue[childFieldName] != null && formValue[childFieldName] != undefined && formValue[childFieldName] != ''){
                      const value = formValue[childFieldName];
                      (<FormGroup>responce.templateForm.controls[step.field_name]).controls[childFieldName].setValue(value);
                    }
                    break;
                }
                if(data.tree_view_object && data.tree_view_object.field_name != ""){
                  let editeTreeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                  const treeObject = responce.selectedRow[editeTreeModifyData.field_name];
                  (<FormGroup>responce.templateForm.controls[step.field_name]).controls[editeTreeModifyData.field_name].setValue(treeObject);

                }
              });
            }
          });
        }
        break;
      case "number":
        if(object != null && object != undefined){
          let value;
          if(object != null && object != ''){
            value = object;
            responce.templateForm.controls[fieldName].setValue(value)
          }else if(object == 0){
            value = object;
            responce.templateForm.controls[fieldName].setValue(value)
          }
        }
      break;
      case "gmap":
      case "gmapview":
        if(object != null && object != undefined){
          if(formValue['longitude']){
            responce.longitude = formValue['longitude'];
          }
          if(formValue['latitude']){
            responce.latitude = formValue['latitude'];
          }
          if(formValue['zoom']){
            responce.zoom = formValue['zoom'];
          }
          if(responce.longitude != 0 && responce.latitude != 0){
            responce.getAddress = true;
            //this.getAddress(responce.latitude,responce.longitude)
          }
          responce.templateForm.controls[fieldName].setValue(object)
        }
        break;
      case "daterange":
        if(object != null && object != undefined){
          let list_of_dates = [
            {field_name : 'start'},
            {field_name : 'end'}
          ]
          if (list_of_dates.length > 0) {
            list_of_dates.forEach((data) => {
              let childFieldName = data.field_name;
              (<FormGroup>responce.templateForm.controls[fieldName]).controls[childFieldName].setValue(object[childFieldName]);
            });
          }
        }
        break;
      case "date":
        if(object != null && object != undefined){
          if(date_format && date_format != '' && typeof object === 'string'){
            const date = object[fieldName];
            const dateMonthYear = date.split('/');
            const formatedDate = dateMonthYear[2]+"-"+dateMonthYear[1]+"-"+dateMonthYear[0];
            const value = new Date(formatedDate);
            responce.templateForm.controls[fieldName].setValue(value)
          }else{
            const value = formValue[fieldName] == null ? null : formValue[fieldName];
            responce.templateForm.controls[fieldName].setValue(value);
          }
        }
        break;
      case "tabular_data_selector":
        if(object != undefined && object != null){
          responce.custmizedFormValue[fieldName] = JSON.parse(JSON.stringify(object));
        }
        if(Array.isArray(responce.staticData[ddn_field]) && Array.isArray(responce.custmizedFormValue[fieldName])){
          responce.custmizedFormValue[fieldName].forEach((staData:any) => {
            if(responce.staticData[ddn_field][staData._id]){
              responce.staticData[ddn_field][staData._id].selected = true;
            }
          });
        }
        break;
      case "list_of_checkbox":
        responce.templateForm.controls[fieldName].setValue([]);
        break;
      default:
        if(object != null && object != undefined){
          const value = object == null ? null : object;
          responce.templateForm.controls[fieldName].setValue(value);
        }
        break;
    }

    if(tree_view_object && tree_view_object.field_name != ""){
      let editeTreeModifyData = JSON.parse(JSON.stringify(tree_view_object));
      const object = responce.selectedRow[editeTreeModifyData.field_name];
      responce.templateForm.controls[editeTreeModifyData.field_name].setValue(object)
    }
  }
  setCheckboxFileListValue(checkBoxFieldListValue:any,templateForm:FormGroup,staticData:any,selectedRow:any,updateMode:boolean) {
    let result = {
      templateForm:templateForm
    }
    checkBoxFieldListValue.forEach((element:any) => {
      let checkCreatControl: any;
      if (element.parent) {
        checkCreatControl = (<FormGroup>result.templateForm.controls[element.parent]).controls[element.field_name];
      } else {
        checkCreatControl = result.templateForm.controls[element.field_name];
      }
      if (staticData[element.ddn_field] && checkCreatControl.controls && checkCreatControl.controls.length == 0) {
        let checkArray: FormArray;
        if (element.parent) {
          checkArray = (<FormGroup>result.templateForm.controls[element.parent]).controls[element.field_name] as FormArray;
        } else {
          checkArray = result.templateForm.controls[element.field_name] as FormArray;
        }
        staticData[element.ddn_field].forEach((data:any, i:any) => {
          if (updateMode) {
            let arrayData;
            if (element.parent) {
              arrayData = selectedRow[element.parent][element.field_name];
            } else {
              arrayData = selectedRow[element.field_name];
            }
            let selected = false;
            if (arrayData != undefined && arrayData != null) {
              for (let index = 0; index < arrayData.length; index++) {
                if (this.commonFunctionService.checkObjecOrString(data) == this.commonFunctionService.checkObjecOrString(arrayData[index])) {
                  selected = true;
                  break;
                }
              }
            }
            if (selected) {
              checkArray.push(new FormControl(true));
            } else {
              checkArray.push(new FormControl(false));
            }
          } else {
            checkArray.push(new FormControl(false));
          }
        });
      }
    });
    return result.templateForm;
  }


  updateCustomizedValue(custmizedFormValue: any, index: number, value: any) {
    let response = {
      custmizedFormValue: custmizedFormValue,
      selectedListofStringIndex: index
    }
    if (response.selectedListofStringIndex !== null && response.selectedListofStringIndex >= 0) {
      response.custmizedFormValue[response.selectedListofStringIndex] = value;
      response.selectedListofStringIndex = -1;
    } else {
      response.custmizedFormValue.push(value);
    }
    return response
  }

  editListOfString(parentfield: any,field: any,index: number,custmizedFormValue: any, templateForm: FormGroup ) {
    let response = {
      templateForm: templateForm,
      selectedListofStringIndex: index
    }
    let type = field.type;
    let fieldName = field.field_name
    switch(type){
      case 'list_of_string':
        const custmizedFormValueClone = Object.assign([],custmizedFormValue);
        if (parentfield) {
          const custmizedKey = parentfield ? this.commonFunctionService.custmizedKey(parentfield): null;
          const selectedValue = custmizedFormValueClone[custmizedKey][fieldName][index];
          ( <FormGroup>response.templateForm.controls[parentfield.field_name]).controls[fieldName].setValue(selectedValue)
        } else {
          const selectedValue = custmizedFormValueClone[fieldName][index];
          response.templateForm.controls[fieldName].setValue(selectedValue)
        }

      break;
      default:
        break;
    }
    return response;
  }





}
