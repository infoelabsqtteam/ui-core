import { Injectable } from '@angular/core';
import { CoreFunctionService } from '../common-utils/core-function/core-function.service';
import { CommonFunctionService } from '../common-utils/common-function.service';
import { FileHandlerService } from '../fileHandler/file-handler.service';
@Injectable({
  providedIn: 'root'
})
export class GridCommonFunctionService {

constructor(
  private CommonFunctionService:CommonFunctionService,
  private coreFunctionService:CoreFunctionService,
  private fileHandlerService: FileHandlerService
) { }
  modifyGridData(gridData:any,gridColumns:any,field:any,editableGridColumns:any,typegrapyCriteriaList:any){
    let modifiedData = [];
    if(gridColumns.length > 0){
      for (let i = 0; i < gridData.length; i++) {
        const row = gridData[i];
        let modifyRow = this.rowModify(row,field,gridColumns,editableGridColumns,typegrapyCriteriaList);
        modifiedData.push(modifyRow);
      }
    }
    return modifiedData;
  }
  rowModify(row:any,field:any,gridColumns:any,editableGridColumns:any,typegrapyCriteriaList:any){
    let modifyRow = JSON.parse(JSON.stringify(row));
    modifyRow["disabled"] = this.checkRowIf(row,field);
    for (let j = 0; j < gridColumns.length; j++) {
      const column = gridColumns[j];
      if(!column.editable || editableGridColumns.length == 0){
        modifyRow[column.field_name] = this.CommonFunctionService.getValueForGrid(column,row);
      }
      modifyRow[column.field_name+"_tooltip"] = this.CommonFunctionService.getValueForGridTooltip(column,row);
      if(column.editable){
        modifyRow[column.field_name+"_disabled"] = this.isDisable(column,row); 
        if(column.type == 'file' && editableGridColumns.length > 0) {
          if(row && row[column.field_name] && this.CommonFunctionService.isArray(row[column.field_name]) && row[column.field_name].length > 0) {
            modifyRow[column.field_name] = this.fileHandlerService.modifyUploadFiles(row[column.field_name]);
          } else {
            modifyRow[column.field_name] = row[column.field_name];
          }
        }
      }
    }
    if(editableGridColumns && (editableGridColumns.length == 1 || (field && !field.grid_row_selection) || row.selected)){
      modifyRow["column_edit"] = true;
    }else{
      modifyRow["column_edit"] = false;
    }
    if(editableGridColumns && editableGridColumns.length == 0 && field && Object.keys(field).length > 0){
      modifyRow['actionBtnDisplay'] = this.checkRowDisabledIf(field,row);
    }
    if(typegrapyCriteriaList && typegrapyCriteriaList.length > 0){
      modifyRow['background-color'] = this.checkTypgraphCondition(typegrapyCriteriaList,row,'background-color');
    }
    return modifyRow;
  }
  checkDisableInRow(editedColumns:any,row:any){
    for (let index = 0; index < editedColumns.length; index++) {
      const column = editedColumns[index];
      row[column.field_name+"_disabled"] = this.isDisable(column,row);
    }
  }
  checkRowIf(data:any,field:any){
    let check = false;
    if(data.selected || field.checkDisableRowIf){
      let condition = '';
      if(field.disableRowIf && field.disableRowIf != ''){
        condition = field.disableRowIf;
      }
      if(condition != ''){
        if(this.CommonFunctionService.checkDisableRowIf(condition,data)){
          check = true;
        }else{
          check = false;
        }
      }
    }
    return check;
  }
  isDisable(field:any, data:any) {
    const updateMode = false;
    if (field.is_disabled) {
      return true;
    }
    if(data.disabled){
      return data.disabled;
    }
    if (field.etc_fields && field.etc_fields.disable_if && field.etc_fields.disable_if != '') {
      return this.CommonFunctionService.isDisable(field.etc_fields, updateMode, data);
    }
    return false;
  }
  isDisableRuntime(column:any, data:any,i:number,gridData:any,field:any,filterData:any) {
    const updateMode = false;
    if (column.is_disabled) {
      return true;
    }
    if(data.disabled){
      return data.disabled;
    }
    if (column.etc_fields && column.etc_fields.disable_if && column.etc_fields.disable_if != '') {
      let indx:any = this.getCorrectIndex(data,i,field,gridData,filterData);
      data = gridData[indx];
      return this.CommonFunctionService.isDisable(field.etc_fields, updateMode, data);
    }
    return false;
  }
  getListByKeyValueToList(list:any,key:string,value:any){
    let getlist = [];
    for (let i = 0; i < list.length; i++) {
      const element = list[i];
      if(element && element[key] == value){
        getlist.push(element);
      }
    }
    return getlist;
  }
  modifyGridColumns(gridColumns:any,parentObject:any){
    let modifyGridColumns = [];
    if(gridColumns && gridColumns.length > 0){
      modifyGridColumns = this.CommonFunctionService.updateFieldInList('display',gridColumns);
      for (let i = 0; i < modifyGridColumns.length; i++) {
        const field = modifyGridColumns[i];
        if (this.coreFunctionService.isNotBlank(field.show_if)) {
          if (!this.CommonFunctionService.showIf(field, parentObject)) {
            field['display'] = false;
          } else {
            field['display'] = true;
          }
        } else {
          field['display'] = true;
        }
        if(field['field_class']){
          field['field_class'] = field['field_class'].trim();
        }
        field['width'] = this.getGridColumnWidth(field,gridColumns);
      };
    }
    return modifyGridColumns;
  }
  getGridColumnWidth(column:any,listOfGridFieldName:any) {
    if (column.width && column.width != '0') {
      return column.width;
    } else {
      if (listOfGridFieldName.length > 8) {
        return '150px';
      } else {
        return '';
      }
    }
  }
  updateGridDataToModifiedData(grid_row_selection:any,gridData:any,modifiedGridData:any,listOfGridFieldName:any){
    let gridSelectedData:any = [];
    let modifiedSelectedData:any = [];
    if (grid_row_selection == false) {
      gridSelectedData = [...gridData];
      modifiedSelectedData = [...modifiedGridData];
    }
    else {
      gridSelectedData = this.getListByKeyValueToList(gridData,"selected",true);
      modifiedSelectedData = this.getListByKeyValueToList(modifiedGridData,"selected",true);
    }
    if(listOfGridFieldName.length > 0){
      gridSelectedData.forEach((data:any,i:number) => {
        listOfGridFieldName.forEach((column:any) => {
          if(column.editable || column.type == 'number'){
            switch (column.type) {
              case 'file':
                gridSelectedData[i][column.field_name] = this.fileHandlerService.modifyUploadFiles(modifiedSelectedData[i][column.field_name]);
                break
              default:
                gridSelectedData[i][column.field_name] = modifiedSelectedData[i][column.field_name];
                break;
            }
          }
        });
      });
    }
    return gridSelectedData;
  }
  getCorrectIndex(data:any, indx:number,field:any,gridData:any,filterValue:any){
    let index;
    if (field.matching_fields_for_grid_selection && field.matching_fields_for_grid_selection.length > 0) {
      gridData.forEach((row:any, i:number) => {
        var validity = true;
        field.matching_fields_for_grid_selection.forEach((matchcriteria:any) => {
          if (this.CommonFunctionService.getObjectValue(matchcriteria, data) == this.CommonFunctionService.getObjectValue(matchcriteria, row)) {
            validity = validity && true;
          }
          else {
            validity = validity && false;
          }
        });
        if (validity == true) {
          index = i;
        }
      });
    }else if (data._id != undefined) {
      index = this.CommonFunctionService.getIndexInArrayById(gridData, data._id);
    } else {
      index = indx;
    }
    if(index && index != indx && filterValue == ''){
      index = indx;
    }
    return index;
  }
  applyOnGridFilter(field:any) {
    if (field && field.etc_fields && field.etc_fields.on_grid_filter === 'false') {
      return false;
    }
    return true;
  }
  applyOnGridFilterLabel(field:any) {
    if (field && field.etc_fields && field.etc_fields.on_grid_filter_label != '') {
      return field.etc_fields.on_grid_filter_label;
    }
    return "Search Parameter ...";
  }
  checkDataAlreadyAddedInListOrNot(primary_key:string,incomingData:any,alreadyDataAddedlist:any){
    if(alreadyDataAddedlist == undefined){
      alreadyDataAddedlist = [];
    }
    let alreadyExist = "false";
    if(typeof incomingData == 'object'){
      alreadyDataAddedlist.forEach((element:any) => {
        if(element._id == incomingData._id){
          alreadyExist =  "true";
        }
      });
    }
    else if(typeof incomingData == 'string'){
      alreadyDataAddedlist.forEach((element: string) => {
        if(typeof element == 'string'){
          if(element == incomingData){
            alreadyExist =  "true";
          }
        }else{
          if(element[primary_key] == incomingData){
            alreadyExist =  "true";
          }
        }

      });
    }else{
      alreadyExist =  "false";
    }
    if(alreadyExist == "true"){
      return true;
    }else{
      return false;
    }
  }
  // fieldButtonLabel(field){
  //   if(field && field.grid_selection_button_label != null && field.grid_selection_button_label != ''){
  //     return field.grid_selection_button_label;
  //   }else{
  //     return field.label;
  //   }
  // }
  modifyTableFields(tablefields:any){

  }
  gridDataModify(modifyData:any,data:any,fields:any,field_name:any,key:any,object:any){
    let modifyObject = {
      "modifyData" : modifyData,
      "fields" : fields,
      "field_index" : -1
    };
    if(fields && fields.length > 0){
      for (let i = 0; i < fields.length; i++) {
        const element = fields[i];
        const type = element.type;
        const fieldName = element.field_name;
        if(type && type.startsWith(key) && field_name == fieldName){
          if(element && fieldName && data && data[fieldName]){
            const cData = data[fieldName];
            if(Array.isArray(cData) && cData.length > 0){
              const gridColumns = element.gridColumns;
              const modifyList = this.modifyGridData(cData,gridColumns,element,[],[]);
              modifyData[fieldName] = modifyList;
              element.gridColumns = this.modifyGridColumns(gridColumns,object);
              modifyObject.field_index = i;
            }
          }
        }else if(type && type.startsWith('list_of_fields') && element.datatype == "list_of_object_with_popup" && field_name == fieldName){
          if(element && fieldName && data && data[fieldName]){
            const cData = data[fieldName];
            if(Array.isArray(cData) && cData.length > 0){
              const gridColumns = element.list_of_fields;
              const modifyList = this.modifyListofFieldsData({},cData,gridColumns)['data'];
              modifyData[fieldName] = modifyList;
              modifyObject.field_index = i;
            }
          }
        }
      }
    }
    modifyObject.modifyData = modifyData;
    modifyObject.fields = fields;
    return modifyObject;
  }

  modifyListofFieldsData(parentField:any,data:any,fields:any){
    let modifyListoffieldObject:any = {};
    let modifyData = [];
    if(fields && fields.length > 0 && data && data.length > 0){
      for (let index = 0; index < data.length; index++) {
        const object = data[index];
        const mObject = this.getModifyListOfFieldsObject(parentField,object,fields);
        modifyData.push(mObject);
      }
      modifyListoffieldObject['data'] = modifyData;
    }
    return modifyListoffieldObject;
  }
  getModifyListOfFieldsObject(parentField:any,object:any,fields:any){
    let mObject:any = {};
    if(fields && fields.length > 0){
      for (let index = 0; index < fields.length; index++) {
        const element = fields[index];
        let fieldName = element.field_name;
        mObject[fieldName] = this.showListFieldValue(object,element);
      }
      mObject['actionBtnDisplay'] = this.checkRowDisabledIf(parentField,object);
    }
    return mObject;
  }
  showListFieldValue(listOfField:any, item:any) {
    switch (item.type) {
      case "typeahead":
        if(item.datatype == "list_of_object"){
          if (Array.isArray(listOfField[item.field_name]) && listOfField[item.field_name].length > 0 && listOfField[item.field_name] != null && listOfField[item.field_name] != undefined && listOfField[item.field_name] != '') {
            return '<i class="fa fa-eye cursor-pointer"></i>';
          } else {
            return '-';
          }
        }else if(item.datatype == "object"){
          if (item.display_name && item.display_name != "") {
            return this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
          } else {
            return listOfField[item.field_name];
          }
        }
        else if(item.datatype == "text"){
          if (item.display_name && item.display_name != "") {
            return this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
          } else {
            return listOfField[item.field_name];
          }
        }
        break;
      case "list_of_string":
      case "list_of_checkbox":
      case "grid_selection":
      case "list_of_fields":
        if (Array.isArray(listOfField[item.field_name]) && listOfField[item.field_name].length > 0 && listOfField[item.field_name] != null && listOfField[item.field_name] != undefined && listOfField[item.field_name] != '') {
          return '<i class="fa fa-eye cursor-pointer"></i>';
        } else {
          return '-';
        }
      case "checkbox":
        let value:any = false;
        if (item.display_name && item.display_name != "") {
          value = this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          value = this.CommonFunctionService.getValueForGrid(item,listOfField);
        }
        return value ? "Yes" : "No";
      default:
        if (item.display_name && item.display_name != "") {
          return this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          return this.CommonFunctionService.getValueForGrid(item,listOfField);
        }
    }

  }
  checkRowDisabledIf(field:any,data:any){
    if(field && field.disableRowIf && field.disableRowIf != ''){
      const condition = field.disableRowIf;
      if(condition){
        if(field.disableRowIfOnlySelection){
          return true;
        }else{
          return !this.CommonFunctionService.checkDisableRowIf(condition,data);
        }
      }
    }
    return true;
  }
  checkTypgraphCondition(typegrapyCriteriaList:any,object:any,name:any){
    let background = '';
    if(typegrapyCriteriaList && typegrapyCriteriaList.length >= 1){
      let criteriaMatched = false;
      let matchedelement:any = {};
      for (let index = 0; index < typegrapyCriteriaList.length; index++) {
        const element = typegrapyCriteriaList[index];
        let crList = element['crList'];
        let childConditionsMatched = false;
        for (let j = 0; j < crList.length; j++) {
          const child = crList[j];
          let modify = child.replaceAll(';', "#");
          if(!this.CommonFunctionService.checkIfConditionForArrayListValue(modify,object)){
            childConditionsMatched = false;
            break;
          }else{
            childConditionsMatched = true;
          }
        }
        if(childConditionsMatched){
          matchedelement = typegrapyCriteriaList[index]
          criteriaMatched = true;
          break;
        }else{
          criteriaMatched = false;
        }
      }
      if(criteriaMatched){
        let typograpy = matchedelement['typoGraphy'];
        let value = '';
        switch (name) {
          case 'background-color':
            value = typograpy['background_color'];
            break;
          default:
            break;
        }
        background = value;
      }
    }
    return background;
  }

}
