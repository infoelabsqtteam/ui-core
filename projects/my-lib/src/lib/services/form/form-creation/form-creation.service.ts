import { ApiCallService } from './../../api/api-call/api-call.service';
import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../../common-utils/common-function.service';
import { EnvService } from '../../env/env.service';
import { UntypedFormBuilder, UntypedFormGroup, UntypedFormControl, Validators } from '@angular/forms';
import { StorageService } from '../../storage/storage.service';
import { CustomvalidationService } from '../../customvalidation/customvalidation.service';
import { CheckIfService } from '../../check-if/check-if.service';
import { ModelService } from '../../model/model.service';
// import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class FormCreationService {

  minDate: Date;
  maxDate: Date;

  constructor(
    private commonFunctionService:CommonFunctionService,
    private envService:EnvService,
    private storageService:StorageService,
    private formBuilder: UntypedFormBuilder,
    private customvalidationService:CustomvalidationService,
    private apiCallService:ApiCallService,
    private checkifService:CheckIfService,
    private modalService:ModelService,
    // private datePipe: DatePipe
  ) {
      const currentYear = new Date().getFullYear();
      this.minDate = new Date(currentYear - 100, 0, 1);
      this.maxDate = new Date(currentYear + 25, 11, 31);
  }
  getTempData(tempData:any,tabIndex:any,currentMenu:any,formName:any,dinamic_form:any){
    let responce:any={
      tab:{},
      currentMenu:currentMenu,
      grid_view_mode:"",
      form:{},
      forms:{}
    }
    if(tempData[0].templateTabs){
      responce.tab = tempData[0].templateTabs[tabIndex];
    }
    let tab = responce.tab
    if (tab && tab.tab_name != "" && tab.tab_name != null && tab.tab_name != undefined) {
      if(currentMenu && currentMenu.name && currentMenu.name != undefined && currentMenu.name != null){
        const menu = {"name":tab.tab_name};
        this.storageService.SetActiveMenu(menu);
        responce.currentMenu.name = tab.tab_name;
      }
    }
    if(tab  && tab.grid != null && tab.grid != undefined ){
      if(tab.grid.grid_view != null && tab.grid.grid_view != undefined && tab.grid.grid_view != ''){
        responce.grid_view_mode=tab.grid.grid_view;
      }else{
        responce.grid_view_mode='tableView';
      }
    }

    if(tab && formName != ''){
      if(formName == 'DINAMIC_FORM'){
        responce.form = dinamic_form
      }else if(tab.forms != null && tab.forms != undefined ){
        responce.forms = tab.forms;
        let gridActionButtons = [];
        if(tab.grid && tab.grid.action_buttons){
          gridActionButtons = tab.grid.action_buttons;
        }
        responce.form = this.commonFunctionService.getForm(responce.forms,formName,gridActionButtons)
        if(formName == 'clone_object'){
          responce.form['api_params'] = "QTMP:CLONE_OBJECT";
        }
        //this.setForm();
      }else{
        responce.form = {};
      }
    }
    return responce;
  }

  checkFormDetails(form:any,tab:any,currentMenu:any){
    let responce:any={
      currentMenu:currentMenu,
      bulkupdates:false,
      getLocation:false,
      headerFiledsData:[],
      tableFields:[],
      formFieldButtons:[],
      getTableField:true
    }
    if(form){
      if(form.details){
        if(form.details.collection_name && form.details.collection_name != '' && (responce.currentMenu != undefined || this.envService.getRequestType() == 'PUBLIC')){
          if(responce.currentMenu == undefined){
            responce.currentMenu = {};
          }
          responce.currentMenu['name'] = form.details.collection_name;
          if(tab && tab.tab_name && tab.tab_name != ''){
            responce.currentMenu['tab_name'] = tab.tab_name;
          }
        }
        if(form.details.bulk_update){
          responce.bulkupdates = true;
        }else{
          responce.bulkupdates = false;
        }
      }
      if(form.getLocation){
        responce.getLocation = form.getLocation;
      }else{
        responce.getLocation = false;
      }
      if(form.headerFields){
        responce.headerFiledsData = form.headerFields;
      }
      if(form['tableFields'] && form['tableFields'] != undefined && form['tableFields'] != null){
        responce.tableFields = JSON.parse(JSON.stringify(form['tableFields']));
        responce.getTableField = false;
      }else{
        responce.tableFields = [];
      }
      if(form.tab_list_buttons && form.tab_list_buttons != undefined && form.tab_list_buttons.length > 0){
        responce.formFieldButtons = form.tab_list_buttons;
      }
    }
    return responce;

  }
  createFormControl(forControl:any, field:any, object:any, type:string) {
    let disabled = field.is_disabled ? true : ((field.disable_if != undefined && field.disable_if != '') ? true : false);
    switch (type) {
      case "list":
        forControl[field.field_name] = this.formBuilder.array(object, this.validator(field))
        break;
        case 'checkbox':
          forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled }, this.validator(field))
          break;
      case "text":
        switch (field.type) {
          case "gst_number":
            forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
            break;
          case "api":
            switch (field.api_call_name) {
              case "gst_number":
                forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
                break;
              default:
                forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled }, this.validator(field))
                break;
            }
              forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidGSTNumber.bind(this.customvalidationService))
              break;
          case "typeahead":
            switch (field.datatype) {
              case 'object':
                forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled },this.validator(field),this.customvalidationService.isValidData.bind(this.customvalidationService))
                break;
              default:
                forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled }, this.validator(field))
                break;
            }
            break;
          default:
            forControl[field.field_name] = new UntypedFormControl({ value: object, disabled: disabled }, this.validator(field))
            break;
        }
        break;
      case "group":
        forControl[field.field_name] = this.formBuilder.group(object)
        break;
      default:
        break;
    }
  }
  validator(field:any) {
    const validator = []
    if (field.is_mandatory != undefined && field.is_mandatory) {
      switch (field.type) {
        case "grid_selection":
        case "list_of_string":
          break;
        case "typeahead":
          if (field.datatype != 'list_of_object' && field.datatype != 'chips') {
            validator.push(Validators.required)
          }
          break;
        case 'checkbox':
          validator.push(Validators.requiredTrue)
          break;
        case "email":
          validator.push(Validators.required)
          validator.push(Validators.email);
          break;
        default:
          validator.push(Validators.required)
          break;
      }
    }else{
      switch (field.type){
        case "email":
          validator.push(Validators.email);
          break;
        default:
          break;
      }
    }
    if (field.min_length != undefined && field.min_length != null && field.min_length != '' && Number(field.min_length) && field.min_length > 0) {
      validator.push(Validators.minLength(field.min_length))
    }
    if(field.max_length != undefined && field.max_length != null && field.max_length != '' && Number(field.max_length) && field.max_length > 0){
      validator.push(Validators.maxLength(field.max_length))
    }
    return validator;
  }
  setNewForm(tableFields:any,formFieldButtons:any,form:any,elements:any,selectedRowIndex:number){
    let responce:any = {
      calculationFieldList:[],
      showIfFieldList:[],
      buttonIfList:[],
      disableIfFieldList:[],
      mendetoryIfFieldList : [],
      gridSelectionMendetoryList:[],
      customValidationFiels : [],
      editorTypeFieldList : [],
      checkBoxFieldListValue:[],
      filePreviewFields:[],
      staticModal:[],
      forControl:{},
      showGridData:{},
      isStepper:false,
      blankField:{fieldName:'',index:-1},
      requestLocationPermission:false
    }
    for (let index = 0; index < tableFields.length; index++) {
      const element = tableFields[index];
      if(element == null){
        responce.blankField.fieldName = form.name;
        responce.blankField.index = index+1;
        //this.notifyFieldValueIsNull(form.name,index+1);
        break;
      }
      if(!element.hideOnMobile){
        if(element.type == 'pdf_view'){
          if(selectedRowIndex && selectedRowIndex != -1 && elements && elements.length > 0){
            const object = elements[selectedRowIndex];
            responce.staticModal.push(this.apiCallService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object));
          }
          responce.editorTypeFieldList.push(element);
        }
        if(element.type == 'info_html' || element.type == 'html_view') {
          responce.editorTypeFieldList.push(element);
          responce.filePreviewFields.push(element);
        }
        if(element.type == 'gmap' || element.type == 'gmapview') {
          responce.requestLocationPermission = true;
        }
        if(element.field_name && element.field_name != ''){
          switch (element.type) {
            case "list_of_checkbox":
              this.createFormControl(responce.forControl, element, [], "list")
              responce.checkBoxFieldListValue.push(element);
              break;
            case "checkbox":
              this.createFormControl(responce.forControl, element, false, "checkbox")
              break;
            case "date":
              let currentYear = new Date().getFullYear();
              let value:any = "";
              if(element.defaultValue && element.defaultValue != null && element.defaultValue != ''){
                value = this.setDefaultDate(element);
              }
              if(element.datatype == 'object'){
                this.minDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.minDate){
                    if(element.etc_fields.minDate == '-1'){
                      this.minDate = new Date(currentYear - 100, 0, 1);
                    }else{
                      this.minDate.setDate(new Date().getDate() - Number(element.etc_fields.minDate));
                    }
                  }
                }
                this.maxDate = new Date();
                if(element.etc_fields && element.etc_fields != null){
                  if(element.etc_fields.maxDate){
                    if(element.etc_fields.maxDate == '-1'){
                      this.maxDate = new Date(currentYear + 25, 11, 31);
                    }else{
                      this.maxDate.setDate(new Date().getDate() + Number(element.etc_fields.maxDate));
                    }
                  }
                }
              }else{
                this.minDate = new Date(currentYear - 100, 0, 1);
                this.maxDate = new Date(currentYear + 25, 11, 31);
              }
              element['minDate'] = this.minDate
              element['maxDate'] = this.maxDate;
              this.createFormControl(responce.forControl, element, value, "text")
              break;
            case "daterange":
              const date_range = {};
              let list_of_dates = [
                {field_name : 'start'},
                {field_name : 'end'}
              ]
              if (list_of_dates.length > 0) {
                list_of_dates.forEach((data) => {
                  this.createFormControl(date_range, data, '', "text")
                });
              }
              this.createFormControl(responce.forControl, element, date_range, "group")
              break;
            case "list_of_fields":
            case "group_of_fields":
              const list_of_fields = {};
              if(element){
                if (element.list_of_fields && element.list_of_fields.length > 0) {
                  for (let j = 0; j < element.list_of_fields.length; j++) {
                    const data = element.list_of_fields[j];
                    if(data == null){
                      responce.blankField.fieldName = element.name;
                      responce.blankField.index = index+1+"->"+j+1;
                      //this.notifyFieldValueIsNull(element.name,j+1);
                      break;
                    }
                    if(element.type == 'list_of_fields' && element.datatype != 'key_value'){
                      data['notDisplay'] = false;
                    }
                    let modifyData = JSON.parse(JSON.stringify(data));
                    modifyData['parent'] = element.field_name;
                    //is disable handling
                    //if parent is disabled then it's non disabled list_of_field will be disabled
                    if(element.is_disabled){
                      if(!modifyData.is_disabled){
                        modifyData.is_disabled = element.is_disabled;
                      }
                    }
                    //show if handling
                    if(data.show_if && data.show_if != ''){
                      modifyData['parentIndex'] = index;
                      modifyData['currentIndex'] = j;
                      responce.showIfFieldList.push(modifyData);
                    }
                    //Mendetory If handling
                    if(data.mandatory_if && data.mandatory_if != ''){
                      responce.mendetoryIfFieldList.push(modifyData);
                    }
                    //disable if handling
                    if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null) || (data.disable_on_add && data.disable_on_add != '' && data.disable_on_add != undefined && data.disable_on_add != null)){
                      responce.disableIfFieldList.push(modifyData);
                    }
                    if(element.type == 'list_of_fields'){
                      modifyData.is_mandatory=false;
                    }
                    if(data.field_name && data.field_name != '' && element.datatype != "list_of_object_with_popup"){
                      // Calculation onChange handling
                      if (element.onchange_function && element.onchange_function_param && element.onchange_function_param != ""){
                        responce.calculationFieldList.push(element);
                      }
                      switch (data.type) {
                        case "list_of_checkbox":
                          this.createFormControl(list_of_fields, modifyData, [], "list")
                          responce.checkBoxFieldListValue.push(modifyData);
                          break;
                        case "checkbox":
                          this.createFormControl(list_of_fields, modifyData, false, "checkbox")
                          break;
                        case "date":
                          let currentYear = new Date().getFullYear();
                          if(data.datatype == 'object'){
                            this.minDate = new Date();
                            if(data.etc_fields && data.etc_fields != null){
                              if(data.etc_fields.minDate){
                                if(data.etc_fields.minDate == '-1'){
                                  this.minDate = new Date(currentYear - 100, 0, 1);
                                }else{
                                  this.minDate.setDate(new Date().getDate() - Number(data.etc_fields.minDate));
                                }
                              }
                            }
                            this.maxDate = new Date();
                            if(data.etc_fields && data.etc_fields != null){
                              if(data.etc_fields.maxDate){
                                if(data.etc_fields.maxDate == '-1'){
                                  this.maxDate = new Date(currentYear + 25, 11, 31);
                                }else{
                                  this.maxDate.setDate(new Date().getDate() + Number(data.etc_fields.maxDate));
                                }
                              }
                            }
                          }else{
                            this.minDate = new Date(currentYear - 100, 0, 1);
                            this.maxDate = new Date(currentYear + 25, 11, 31);
                          }
                          data['minDate'] = this.minDate
                          data['maxDate'] = this.maxDate;
                          this.createFormControl(list_of_fields, modifyData, '', "text")
                          break;
                        default:
                          this.createFormControl(list_of_fields, modifyData, '', "text")
                          break;
                      }
                    }
                    data.field_class = this.commonFunctionService.getDivClass(data,(tableFields.length + element.list_of_fields.length));
                  }
                }
              }
              this.createFormControl(responce.forControl, element, list_of_fields, "group")
              // if(element.type == 'list_of_fields'){
              //   this.list_of_fields.push(element);
              // }
              break;
            // case 'html_view':
            //   const field = {
            //     field_name : 'html_view_1'
            //   }
            //   this.createFormControl(forControl, element, '', "text")
            //   break;
            case "stepper":
              if(element.list_of_fields && element.list_of_fields.length > 0) {
                element.list_of_fields.forEach((step:any) => {
                  if(step.list_of_fields != undefined && step.list_of_fields.length > 0){
                    const stepper_of_fields = {};
                    step.list_of_fields.forEach((data:any) =>{
                      let modifyData = JSON.parse(JSON.stringify(data));
                      modifyData.parent = step.field_name;
                      //show if handling
                      if(data.show_if && data.show_if != ''){
                        responce.showIfFieldList.push(modifyData);
                      }
                      //mendetory if handling
                      if(data.mandatory_if && data.mandatory_if != ''){
                        responce.mendetoryIfFieldList.push(modifyData);
                      }
                      //disable if handling
                      if((data.disable_if && data.disable_if != '') || (data.disable_on_update && data.disable_on_update != '' && data.disable_on_update != undefined && data.disable_on_update != null) || (data.disable_on_add && data.disable_on_add != '' && data.disable_on_add != undefined && data.disable_on_add != null)){
                        responce.disableIfFieldList.push(modifyData);
                      }
                      // Calculation onChange handling
                      if (element.onchange_function && element.onchange_function_param && element.onchange_function_param != ""){
                        responce.calculationFieldList.push(element);
                      }

                      this.createFormControl(stepper_of_fields, modifyData, '', "text")
                      if(data.tree_view_object && data.tree_view_object.field_name != ""){
                        let treeModifyData = JSON.parse(JSON.stringify(data.tree_view_object));
                        treeModifyData.is_mandatory=false;
                        this.createFormControl(stepper_of_fields, treeModifyData , '', "text")
                      }
                    });
                    this.createFormControl(responce.forControl, step, stepper_of_fields, "group")
                  }
                });
                responce.isStepper = true;
              }
              break;
            case "pdf_view" :
              if(selectedRowIndex && selectedRowIndex != -1 && elements && elements.length > 0){
                const object = elements[selectedRowIndex];
                responce.staticModal.push(this.apiCallService.getPaylodWithCriteria(element.onchange_api_params,element.onchange_call_back_field,element.onchange_api_params_criteria,object));
              }
              break;
            case "input_with_uploadfile":
              element.is_disabled = true;
              this.createFormControl(responce.forControl, element, '', "text")
              break;
            case "grid_selection":
              if(element && element.gridColumns && element.gridColumns.length > 0){
                let colParField = JSON.parse(JSON.stringify(element));
                colParField['mendetory_fields'] = [];
                element.gridColumns.forEach((colField:any) => {
                  if(colField && colField.is_mandatory){
                    colParField['mendetory_fields'].push(colField);
                  }
                });
                if(colParField && colParField['mendetory_fields'] && colParField['mendetory_fields'].length > 0){
                  responce.gridSelectionMendetoryList.push(colParField);
                  element['mendetory_fields'] = colParField['mendetory_fields'];
                }
                responce.showGridData[element.field_name] = true;
              }
              if(element && element.addNewButtonIf && element.addNewButtonIf != ''){
                element['fieldIndex'] = index;
                responce.buttonIfList.push(element);
              }
              element['showButton'] = this.checkGridSelectionButtonCondition(element,'add',{},{});
              this.createFormControl(responce.forControl, element, '', "text");
              break;
            case "tree_view":
              // this.treeControl[element.field_name] = new FlatTreeControl<TodoItemFlatNode>(this.getLevel, this.isExpandable);
              // this.dataSource[element.field_name] = new MatTreeFlatDataSource(this.treeControl[element.field_name], this.treeFlattener);
              this.createFormControl(responce.forControl, element, '', "text");
              break;
            default:
              if(element.defaultValue && element.defaultValue != null && element.defaultValue != ''){
                const value = element.defaultValue;
                this.createFormControl(responce.forControl, element, value, "text");
              }else{
                this.createFormControl(responce.forControl, element, '', "text");
              }
              break;
          }
          if(element.tree_view_object && element.tree_view_object.field_name != ""){
            let treeModifyData = JSON.parse(JSON.stringify(element.tree_view_object));
            treeModifyData.is_mandatory=false;
            this.createFormControl(responce.forControl, treeModifyData , '', "text")
          }
        }
        //show if handling
        if(element.show_if && element.show_if != ''){
          responce.showIfFieldList.push(element);
        }
        //mendatory if handling
        if(element.mandatory_if && element.mandatory_if != ''){
          responce.mendetoryIfFieldList.push(element);
        }
        //Customvalidation handling
        if(element.compareFieldName && element.compareFieldName != ''){
          responce.customValidationFiels.push(element);
        }
        //disable if handling
        if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null) || (element.disable_on_add && element.disable_on_add != '' && element.disable_on_add != undefined && element.disable_on_add != null)){
          responce.disableIfFieldList.push(element);
        }
        // Calculation onChange handling
        if (element.onchange_function && element.onchange_function_param && element.onchange_function_param != ""){
          responce.calculationFieldList.push(element);
        }
        element.field_class = this.commonFunctionService.getDivClass(element,tableFields.length);
      }
    }
    if(formFieldButtons && formFieldButtons.length > 0){
      formFieldButtons.forEach((element:any) => {
        if(element.field_name && element.field_name != ''){
          switch (element.type) {
            case "dropdown":
              this.createFormControl(responce.forControl, element, '', "text")
              break;
            default:
              break;
          }
        }
        if(element.show_if && element.show_if != ''){
          responce.showIfFieldList.push(element);
        }
        if(element.mandatory_if && element.mandatory_if != ''){
          responce.mendetoryIfFieldList.push(element);
        }
        if((element.disable_if && element.disable_if != '') || (element.disable_on_update && element.disable_on_update != '' && element.disable_on_update != undefined && element.disable_on_update != null) || (element.disable_on_add && element.disable_on_add != '' && element.disable_on_add != undefined && element.disable_on_add != null)){
          responce.disableIfFieldList.push(element);
        }
      });
    }
    return responce;
  }
  checkFieldButtonCondition(tableFields:any){
    let responce:any={
      tempVal:{}
    }
    tableFields.forEach((element:any) => {
      switch (element.type) {
        case "typeahead":
          if (element.datatype == 'list_of_object') {
            responce.tempVal[element.field_name + "_add_button"] = true;
          }
          break;
        case "list_of_string":
          responce.tempVal[element.field_name + "_add_button"] = true;
          break;
        case "list_of_fields":
        case "group_of_fields":
          if(element.list_of_fields != undefined && element.list_of_fields != null && element.list_of_fields.length > 0){
            element.list_of_fields.forEach((child:any) => {
              if(child && child != null){
                switch (child.type) {
                  case "typeahead":
                    if (child.datatype == 'list_of_object') {
                      responce.tempVal[element.field_name + '_' + child.field_name + "_add_button"] = true;
                    }
                    break;
                  case "list_of_string":
                    responce.tempVal[element.field_name + '_' + child.field_name + "_add_button"] = true;
                    break;
                  default:
                    break;
                }
              }
            });
          }
          break;
        case "stepper":
          if(element.list_of_fields != undefined && element.list_of_fields != null && element.list_of_fields.length > 0){
            element.list_of_fields.forEach((step:any) => {
              if(step.list_of_fields != undefined && step.list_of_fields != null && step.list_of_fields.length > 0){
                step.list_of_fields.forEach((child:any) => {
                  switch (child.type) {
                    case "typeahead":
                      if (child.datatype == 'list_of_object') {
                        responce.tempVal[step.field_name + '_' + child.field_name + "_add_button"] = true;
                      }
                      break;
                    case "list_of_string":
                      responce.tempVal[step.field_name + '_' + child.field_name + "_add_button"] = true;
                      break;
                    default:
                      break;
                  }
                });
              }
            });
          }
          break;
        default:
          break;
      }
    });
    return responce;
  }
  updateSelectContact(selectContact:any,tabFilterData:any,tableFields:any,templateForm:UntypedFormGroup,formValueWithCustomData:any,staticModal:any){
    let account={};
    let contact={};
    let payload:any = {};
    let selectContactObject:any = {};
    if(selectContact){
      selectContactObject = selectContact;
    }
    if(tabFilterData && tabFilterData.length > 0){
      tabFilterData.forEach((element:any) => {
        if(element && element._id){
          if(element._id == selectContact){
            selectContactObject = element;
          }
        }
      });
    }
    if(selectContactObject){
      if(selectContactObject['_id']){
        contact = {
          "_id":selectContactObject['_id'],
          "name":selectContactObject['name'],
          "code":selectContactObject['serialId']
        }
      }
      if(selectContactObject['lead']){
        account = selectContactObject['lead'];
      }
    }
    if(tableFields && tableFields.length > 0){
      tableFields.forEach((element:any) => {
        if(element && element.field_name && element.field_name != ''){
          let fieldName = element.field_name;
          if(fieldName == 'account'){
            templateForm.controls['account'].setValue(account);
            if (element.onchange_api_params && element.onchange_call_back_field && !element.do_not_auto_trigger_on_edit) {
              payload = this.apiCallService.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, formValueWithCustomData)
              if(element.onchange_api_params.indexOf("FORM_GROUP") >= 0 || element.onchange_api_params.indexOf("QTMP") >= 0){
                payload["data"]=formValueWithCustomData;
              }
              staticModal.push(payload);
            }
          }
          if(element.field_name == 'contact'){
            templateForm.controls['contact'].setValue(contact);
            //this.templateForm.get('contact').setValue(contact);
            if (element.onchange_api_params && element.onchange_call_back_field && !element.do_not_auto_trigger_on_edit) {
              payload = this.apiCallService.getPaylodWithCriteria(element.onchange_api_params, element.onchange_call_back_field, element.onchange_api_params_criteria, formValueWithCustomData)
              if(element.onchange_api_params.indexOf("FORM_GROUP") >= 0 || element.onchange_api_params.indexOf("QTMP") >= 0){
                payload["data"]=formValueWithCustomData;
              }
              staticModal.push(payload);
            }
          }
          if(element.type == 'stepper' && element.list_of_fields && element.list_of_fields.length > 0){
            element.list_of_fields.forEach((stepData:any) => {
              if(stepData && stepData.list_of_fields && stepData.list_of_fields.length > 0){
                stepData.list_of_fields.forEach((data:any) => {
                  let fieldName = stepData.field_name;
                  if(data.field_name == 'account'){
                    (<UntypedFormGroup>templateForm.controls[fieldName]).controls['account'].setValue(account);
                    //this.templateForm.get(stepData.field_name).get('account').setValue(account);
                    if (data.onchange_api_params && data.onchange_call_back_field && !data.do_not_auto_trigger_on_edit) {
                      payload = this.apiCallService.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, formValueWithCustomData)
                      if(data.onchange_api_params.indexOf("FORM_GROUP") >= 0 || data.onchange_api_params.indexOf("QTMP") >= 0){
                        payload["data"]=formValueWithCustomData;
                      }
                      staticModal.push(payload);
                    }
                  }
                  if(data.field_name == 'contact'){
                    (<UntypedFormGroup>templateForm.controls[fieldName]).controls['contact'].setValue(contact);
                    if (data.onchange_api_params && data.onchange_call_back_field && !data.do_not_auto_trigger_on_edit) {
                      payload = this.apiCallService.getPaylodWithCriteria(data.onchange_api_params, data.onchange_call_back_field, data.onchange_api_params_criteria, formValueWithCustomData)
                      if(data.onchange_api_params.indexOf("FORM_GROUP") >= 0 || data.onchange_api_params.indexOf("QTMP") >= 0){
                        payload["data"]=formValueWithCustomData;
                      }
                      staticModal.push(payload);
                    }
                  }
                });
              }
            });
          }
        }
      });
    }
    return staticModal;
  }
  checkGridSelectionButtonCondition(field:any,button:any,selectedRow:any,formValue:any){
    let check:any = true;
    switch (button) {
      case 'add':
        if(field && field.addNewButtonIf && field.addNewButtonIf != ''){
          let modifyedField:any = {};
          modifyedField['show_if'] = field.addNewButtonIf;
          check = this.checkifService.checkShowIf(modifyedField,selectedRow,formValue);
        }
        break;
      default:
        break;
    }
    return check;
  }

  setDefaultDate(element:any){
    let value:any = "";
    let today = new Date();
    today.setHours(0,0,0,0);
    let yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0,0,0,0);
    switch (element.defaultValue) {
      case "Today":
        value = today;
        break;
      case "Yesterday":
        value = yesterday;
        break;
      default:
        break;
    }
    return value;
  }
  getFocusField(previousFormFocusField:any,tableFields:any,templateForm:UntypedFormGroup,focusFieldParent:any,checkFormFieldAutfocus:any){
    let responce:any={
      checkFormFieldAutfocus:checkFormFieldAutfocus,
      previousFormFocusField:previousFormFocusField,
      focusFieldParent:focusFieldParent,
      id:""
    }
    if(previousFormFocusField && previousFormFocusField._id){
      responce = this.focusField("",previousFormFocusField,templateForm,focusFieldParent,checkFormFieldAutfocus,previousFormFocusField,responce)
    }else{
      if(previousFormFocusField == undefined || previousFormFocusField._id == undefined){
        for (const key of tableFields) {
          if(key.type == "stepper"){
            if(key.list_of_fields && key.list_of_fields != null && key.list_of_fields.length > 0){
              for (const step of key.list_of_fields) {
                if(step.list_of_fields && step.list_of_fields != null && step.list_of_fields.length > 0){
                  for (const field of step.list_of_fields) {
                    if (field.field_name) {
                      responce = this.focusField(step,field,templateForm,focusFieldParent,checkFormFieldAutfocus,previousFormFocusField,responce);
                      break;
                    }
                  }
                }
              }
            }
          }else if (key.field_name) {
            if(key.type == 'text'){
              responce = this.focusField("",key,templateForm,focusFieldParent,checkFormFieldAutfocus,previousFormFocusField,responce);
              break;
            }else{
              responce.checkFormFieldAutfocus = false;
              break;
            }
          }
        }
      }
    }
    return responce;
  }
  focusField(parent:any,key:any,templateForm:UntypedFormGroup,focusFieldParent:any,checkFormFieldAutfocus:any,previousFormFocusField:any,responce:any){
    responce.id = key._id + "_" + key.field_name;
    let field:any = {};
    if(parent == ''){
      if(focusFieldParent && focusFieldParent.field_name && focusFieldParent.field_name != ''){
        parent = focusFieldParent;
      }
    }
    if(parent != ""){
      field = (<UntypedFormGroup>templateForm.controls[parent.field_name]).controls[key.field_name];
    }else{
      field = templateForm.controls[key.field_name];
    }
    if(field && field.touched){
      responce.checkFormFieldAutfocus = false;
      if(previousFormFocusField && previousFormFocusField._id){
        responce.previousFormFocusField = {};
        responce.focusFieldParent={};
      }
    }else if(field == undefined){
      responce.previousFormFocusField = {};
      responce.focusFieldParent={};
    }
    return responce;
  }
  getDonotResetFields(tableFields:any,donotResetFieldLists:any,FormValue:any){
    tableFields.forEach((tablefield:any) => {
      if(tablefield.do_not_refresh_on_add && tablefield.type != "list_of_fields" && tablefield.type != "group_of_fields" && tablefield.type != "stepper"){
        donotResetFieldLists[tablefield.field_name] = FormValue[tablefield.field_name];
      }else if(tablefield.type == "group_of_fields"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach((field:any) => {
            if(field.do_not_refresh_on_add){
              donotResetFieldLists[tablefield.field_name][field.field_name] = FormValue[tablefield.field_name][field.field_name];
            }
          });
        }
      }else if(tablefield.type == "stepper"){
        if(tablefield.list_of_fields && tablefield.list_of_fields.length > 0){
          tablefield.list_of_fields.forEach((step:any) => {
            if(step.list_of_fields && step.list_of_fields.length > 0){
              step.list_of_fields.forEach((field:any) => {
                if(field.do_not_refresh_on_add){
                  donotResetFieldLists[step.field_name][field.field_name] = FormValue[step.field_name][field.field_name];
                }
              });
            }
          });
        }
      }
    });
    return donotResetFieldLists;
  }
  addNewForm(selectTabIndex:number,isBulkUpdate:boolean,bulkuploadList:any,selectedRowIndex:number,formName:string,selectContactAdd:any){
    let formData:any = {}
    formData['tabIndex'] = selectTabIndex;
    formData['bulkUpdate'] = isBulkUpdate;
    formData['bulkDataList'] = bulkuploadList;
    formData['editedRowIndex'] = selectedRowIndex;
    formData['formName'] = formName;
    formData['selectContact'] = selectContactAdd;
    this.modalService.open('form-modal',formData)
  }
  getFieldsFromForms(tab:any,formName:string,dinamic_form:any,gridButtons:any,tableFields:any,actionButtons:any){
    let responce = {
      "fields" : tableFields,
      "buttons" : actionButtons
    }
    let form = null;
    if(formName != 'DINAMIC_FORM' && tab && tab.forms){
      form = this.commonFunctionService.getForm(tab.forms,formName,gridButtons);
    }else if(formName == 'DINAMIC_FORM'){
      form = dinamic_form;
    }else{
      form = null
    }
    if(form != null){
      if(form?.['tableFields'] && form?.['tableFields']?.length > 0){
        responce.fields = form['tableFields'];
      }
      if(form?.['tab_list_buttons'] && form?.['tab_list_buttons']?.length > 0){
        responce.buttons = form['tab_list_buttons'];
      }
    }
    return responce;
  }

}
