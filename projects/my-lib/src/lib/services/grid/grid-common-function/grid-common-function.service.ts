import { Injectable } from '@angular/core';
import { CoreFunctionService } from '../../common-utils/core-function/core-function.service';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { FileHandlerService } from '../../fileHandler/file-handler.service';
import { CheckIfService } from '../../check-if/check-if.service';
import { StorageService } from '../../storage/storage.service';
import { DatePipe,CurrencyPipe } from '@angular/common';
import { DataShareService } from '../../data-share/data-share.service';
@Injectable({
  providedIn: 'root'
})
export class GridCommonFunctionService {

constructor(
  private CommonFunctionService:CommonFunctionService,
  private coreFunctionService:CoreFunctionService,
  private fileHandlerService: FileHandlerService,
  private checkIfService:CheckIfService,
  private storageService:StorageService,
  private datePipe: DatePipe,
  private CurrencyPipe: CurrencyPipe,
  private dataShareService: DataShareService
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
    modifyRow["disabled"] = this.checkIfService.checkRowIf(row,field);
    for (let j = 0; j < gridColumns.length; j++) {
      const column = gridColumns[j];
      if(!column.editable || editableGridColumns.length == 0){
        modifyRow[column.field_name] = this.getValueForGrid(column,row);
      }
      modifyRow[column.field_name+"_tooltip"] = this.getValueForGridTooltip(column,row);
      if(column.editable){
        modifyRow[column.field_name+"_disabled"] = this.checkIfService.isDisableRow(column,row);
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
          if (!this.checkIfService.showIf(field, parentObject)) {
            field['display'] = false;
            field['show'] = true;
          } else {
            if(field.hide != undefined && field.hide){
              field['display'] = false;
            }else{
              field['display'] = true;
            }
          }
        } else {
            if(field &&  field.hide) {
              field['display'] = false;
            }
            else{
              field['display'] = true;
            }
        }
        if(field['field_class']){
          field['field_class'] = field['field_class'].trim();
        }
        field['width'] = this.getGridColumnWidth(field,gridColumns);
        if(field && field.type && field.type !=''){
          switch(field.type.toLowerCase()){
            case "info":
            case "html" :
            case "file":
            case "template":
            case "image":
            case "icon":
            case "download_file":
            case "color":
              field['hideCopy']=true;
              break;
            default:
              break;
        }
      }
      };
    }
    return modifyGridColumns;
  }
  getGridColumnWidth(column:any,listOfGridFieldName:any) {
    if (column.width && column.width != '0') {
      return column.width;
    } 
    // else {
    //   if (listOfGridFieldName.length > 8) {
    //     return '150px';
    //   } 
      else {
        return '';
      }
    // }
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
              let typegrapyCriteriaList = [];
              if(element['colorCriteria'] && element['colorCriteria'].length > 0){
                typegrapyCriteriaList = element['colorCriteria'];
              }
              const modifyList = this.modifyGridData(cData,gridColumns,element,[],typegrapyCriteriaList);
              modifyData[fieldName] = modifyList;
              element.gridColumns = this.modifyGridColumns(gridColumns,object);
              modifyObject.field_index = i;
            }else {
              modifyData[fieldName] = cData;
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
            item['hideCopy']=true;
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
          item['hideCopy']=true;
          return '<i class="fa fa-eye cursor-pointer"></i>';
        } else {
          return '-';
        }
      case "checkbox":
        let value:any = false;
        if (item.display_name && item.display_name != "") {
          value = this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          value = this.getValueForGrid(item,listOfField);
        }
        return value ? "Yes" : "No";
      default:
        if (item.display_name && item.display_name != "") {
          return this.CommonFunctionService.getObjectValue(item.display_name, listOfField);
        } else {
          return this.getValueForGrid(item,listOfField);
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
          return !this.checkIfService.checkDisableRowIf(condition,data);
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
          if(!this.checkIfService.checkIfConditionForArrayListValue(modify,object)){
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
  modifiedGridColumns(gridColumns:any,selectedRow:any,formValue:any){
    if(gridColumns.length > 0){
      gridColumns.forEach((field:any) => {
        if(this.coreFunctionService.isNotBlank(field.show_if)){
          if(!this.checkIfService.checkShowIf(field,selectedRow,formValue)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }
        }else{
          field['display'] = true;
        }
      });
    }
    return gridColumns;
  }
  checkGridSelectionMendetory(gridSelectionMendetoryList:any,selectedRow:any,formValue:any,custmizedFormValue:any){
    let validation = {
      'status' : true,
      'msg' : ''
    }
    if(gridSelectionMendetoryList && gridSelectionMendetoryList.length > 0){
      let check = 0;
      gridSelectionMendetoryList.forEach((field:any) => {
        let data:any = [];
        if(custmizedFormValue[field.field_name]){
          data = custmizedFormValue[field.field_name];
        }
        if(field.mendetory_fields && field.mendetory_fields.length > 0){
          field.mendetory_fields = this.modifiedGridColumns(field.mendetory_fields,selectedRow,formValue)
          if(data && data.length > 0){
            field.mendetory_fields.forEach((mField:any) => {
              const fieldName = mField.field_name;
              if(mField.display){
                data.forEach((row:any) => {
                  if(row && row[fieldName] == undefined || row[fieldName] == '' || row[fieldName] == null){
                    if(validation.msg == ''){
                      validation.msg = mField.label + ' of ' + field.label+' is required.';
                    }
                    check = 1;
                  }
                });
              }
            });
          }
        }
      });
      if(check != 0){
        validation.status = false;
        return validation;
      }else{
        return validation
      }
    }else{
      return validation;
    }
  }

  getGridSelectedData(data:any,field:any){
    let responce:any ={
      gridSelectedData:[],
      customEntryData:[]
    }
    if(data && data.length > 0 && field.add_new_enabled){
      data.forEach((grid:any) => {
        if(grid && grid.customEntry){
          responce.customEntryData[field.field_name].push(grid);
        }else{
          responce.gridSelectedData.push(grid);
        }
      });
    }else {
      responce.gridSelectedData = data;
    }
    return responce;
  }
  getModifiedGridColumns(gridColumns:any,object:any){
    if(gridColumns.length > 0){
      gridColumns.forEach((field:any) => {
        if(this.coreFunctionService.isNotBlank(field.show_if)){
          if(!this.checkIfService.showIf(field,object)){
            field['display'] = false;
          }else{
            field['display'] = true;
          }
        }else{
          field['display'] = true;
        }
      });
    }
    return gridColumns;
  }

  isDate(date:any) {
    let dateValue:any = new Date(date);
    return (dateValue !== "Invalid Date") && !isNaN(dateValue);
  }

  getValueForGrid(field:any, object:any) {
    let value:any = '';
    let fieldName: any= '';
    if (field) {
      if(this.coreFunctionService.isNotBlank(field.display_name)){
        fieldName= field.display_name;
      }
      else if(this.coreFunctionService.isNotBlank(field.field_name)){
        fieldName= field.field_name;
      }
    }
    if(fieldName !=''){
      value= this.CommonFunctionService.getObjectValue(fieldName, object)
    }
    if (!field.type) field.type = "Text";
    let returnValue:any = '';
    switch (field.type.toLowerCase()) {
      case 'datetime':
        if(value && value != ''){
          if(this.storageService.checkPlatForm() == 'mobile'){
            returnValue =  this.datePipe.transform(value, 'medium');
          }else{
            returnValue = this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
          }
        }
        return returnValue
      case 'date':
      case 'daterange':
        if(value && value != ''){
          if(this.storageService.checkPlatForm() == 'mobile'){
            returnValue =  this.datePipe.transform(value, 'mediumDate');
          }else{
            returnValue = this.datePipe.transform(value, 'dd/MM/yyyy');
          }
        }
        return returnValue;
      case 'time': return this.isDate(value) ? this.datePipe.transform(value, 'h:mm a') : value;
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.CurrencyPipe.transform(value, 'INR');
  	  case "dropdown": return value && value.name ? value.name : value;
      case "typeahead": return value && value.name ? value.name : value;
      case "info":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">visibility</span>';
          }else{
            return '<i class="fa fa-eye cursor-pointer"></i>';
          }
        } else {
          return '-';
        }

      case "html" :
        if (value && value != '') {
          return '<span class="material-icons cursor-pointer">preview</span>';
        } else {
          return '-';
        }
      case "file":
      case "file_with_preview":
      case "file_with_print":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">text_snippet</span>';
          }else{
            return '<span class="material-icons cursor-pointer">text_snippet</span>';
          }
        } else {
          return '-';
        }
      case "template":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined">description</span>';
          }else{
            return '<i class="fa fa-file cursor-pointer" aria-hidden="true"></i>';
          }
        } else {
          return '-';
        }
      case "image":
        return '<img src="data:image/jpg;base64,' + value + '" />';
      case "icon":
        if(this.storageService.checkPlatForm() == 'mobile'){
          return '<span class="material-symbols-outlined cursor-pointer">' + field.field_class + '</span>';
        }else{
          return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
        }
      case "download_file":
        if (value && value != '') {
          if(this.storageService.checkPlatForm() == 'mobile'){
            return '<span class="material-symbols-outlined cursor-pointer">' + field.field_class + '</span>';
          }else{
            return '<span class="material-icons cursor-pointer">' + field.field_class + '</span>';
          }
        }else{
          return '-';
        }
      case "trim_of_string":
        if(value != undefined && value != null && value != ''){
          if(typeof value == 'string'){
            let stringObject = value.split('/');
            if(stringObject.length > 0){
              return stringObject[0]
            }else{
              return value;
            }
          }else{
            return value;
          }
        }else{
          return value;
        }

      case "color":
        break;

      case "pattern":
        if(object != null){
          return this.CommonFunctionService.getConvertedString(object,field.field_name);
        }
      break;
      case "chips":
        if(this.coreFunctionService.isNotBlank(value) && this.CommonFunctionService.isArray(value)){
          let name = "";
          for(let i=0 ;i<value.length; i++){
            if(this.coreFunctionService.isNotBlank(value[i]['name'])){
              name = name+', '+value[i]['name'];
            }else{
              name = name+', '+value[i];
            }
          }
          return name.substring(2);;
        }
        return "-";
      case "reference_names":
        if(this.coreFunctionService.isNotBlank(value) && this.CommonFunctionService.isArray(value)){
          let name = '';
          for(let i=0 ;i<value.length; i++){
            if(this.coreFunctionService.isNotBlank(value[i]['name'])){
              name = name+', '+value[i]['name'];
            }
          }
          if(name.length > 1){
            name = name.substring(2);
          }
          return name;
        }else{
          return "-";
        }
      default: return value;
    }
  }
  getValueForGridTooltip(field:any, object:any) {
    let value = '';
    if (field.field_name != undefined && field.field_name != null && field.field_name != '') {
      value = this.CommonFunctionService.getObjectValue(field.field_name, object)
    }
    if (!field.type) field.type = "Text";
    switch (field.type.toLowerCase()) {
      case 'datetime': return this.datePipe.transform(value, 'dd/MM/yyyy h:mm a');
      case 'date': return this.datePipe.transform(value, 'dd/MM/yyyy');
      case 'time': return this.isDate(value) ? this.datePipe.transform(value, 'h:mm a') : value;
      case "boolean": return value ? "Yes" : "No";
      case "currency": return this.CurrencyPipe.transform(value, 'INR');
      case "info":
      case "file":
      case "template":
      case "image":
      case "icon":
      case "html":
          return '';
      default: return value;
    }
  }

  getNoOfItems(grid:any, defaultNoOfItem:any) {
    if(grid && grid.details && grid.details.numberOfItems) {
      defaultNoOfItem = grid.details.numberOfItems;
    }
    return defaultNoOfItem;
  }


  setOldTabCount(tab:any) {
    let dataCount:any = {};  
    let count:any = {};    
    let totalDataCount:any = {};
    const currentTabName = this.storageService.GetActiveMenu()['name'];        
    const key = currentTabName+"_"+tab.name;
    totalDataCount = this.dataShareService.getGridCountData();
    let oldDataSize = totalDataCount[key];
    count[key] = oldDataSize;
    dataCount['count'] = count;
    dataCount['gridCountData'] = totalDataCount;
    this.dataShareService.shareGridCountData(dataCount);
  }


  compareAuditHistoryData(formFieldsData:any,currentObjectData:any,previousObjectData:any){
      let formFields = formFieldsData;
      let currentObj = {};
      let previousObject = {};
      for (let i = 0; i < formFields.length; i++ ) {
        let field = formFields[i];
        let isChanged = false;
        if(field && field.field_name) {
            currentObj = currentObjectData[field.field_name];
            previousObject = previousObjectData[field.field_name];
            if(currentObj != null && currentObj != undefined && typeof currentObj == 'object'){
              currentObj = currentObjectData[field.field_name].name;
              previousObject = previousObjectData[field.field_name].name;
              if(currentObj != previousObject) {
                isChanged = true;
              }
            }else {
              if(currentObj != previousObject){
                isChanged = true;
              }
            }
            field['isChanged'] = isChanged; 
            formFieldsData[i] = field;
        }
      }
  }


  copmareListOfFields(fields:any,currentObjectData:any,previousObjectData:any){
    let currentData:any[] = currentObjectData[fields.field_name];
    let previousData:any[] = previousObjectData[fields.field_name];
    let currentObj:any;
    let previousObject:any;
    if(currentObjectData[fields.field_name] && currentObjectData[fields.field_name].length > 0) {
      for (let i = 0; i < fields.list_of_fields.length; i++) {
        let isChanged = false;
        const field = fields.list_of_fields[i]
        for (let j = 0; j < currentData.length; j++) {
          let comparecurrentObj = currentData[j];
            comparecurrentObj = comparecurrentObj[field.field_name];
          let comparepreviousObject = previousData[j];
            comparepreviousObject = comparepreviousObject[field.field_name];

          if(comparecurrentObj != null && comparecurrentObj != undefined && typeof comparecurrentObj == 'object'){
            currentObj = comparecurrentObj[field.field_name].name;
            previousObject = comparepreviousObject[field.field_name].name;
            if(comparecurrentObj != comparepreviousObject) {
              isChanged = true;
            }
          }else {
            if(comparecurrentObj != comparepreviousObject){
              if(comparecurrentObj != null && comparecurrentObj != undefined && comparepreviousObject != null && comparepreviousObject != undefined ) {
                isChanged = true;
              }else {
                isChanged = false;
              }
            }
          }
        }
        field['isChanged'] = isChanged; 
        fields[i] = field;
      }
    }
  }











}
