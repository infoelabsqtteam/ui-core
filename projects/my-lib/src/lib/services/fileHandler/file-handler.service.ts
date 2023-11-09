import { Injectable } from '@angular/core';
import { CommonFunctionService } from '../common-utils/common-function.service';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor(
    private commonFunctionService:CommonFunctionService
  ) { }


  modifyUploadFiles(files:any){
    const fileList:any = [];
    if(files && files.length > 0){
      files.forEach((element:any) => {
        if(element._id){
          fileList.push(element)
        }else{
          if(element && element.uploadData){
            let file = element.uploadData[0];
            fileList.push(file);
          }else {
            fileList.push({uploadData:[element]})
          }
        }
      });
    }
    return fileList;
  }
  modifyFileSetValue(files:any){
    let fileName = '';
    let fileLength = files.length;
    let file = files[0];
    if(fileLength == 1 && (file.fileName || file.rollName)){
      fileName = file.fileName || file.rollName;
    }else if(fileLength > 1){
      fileName = fileLength + " Files";
    }
    return fileName;
  }
  getFileTooltipMsg(fileList:any){
    let msg = "";
    if(fileList.length > 0){
      fileList.forEach((element:any) => {
        if(msg != ''){
          msg = msg + '\n' + element.fileName;
        }else{
          msg = element.fileName;
        }
      });
    }
    return msg;
  }
  updateFileUploadResponce(curFileUploadFieldparentfield:any,curFileUploadField:any,dataListForUpload:any,templateForm:any,tableFields:any,responceData:any){
    let responce ={
      dataListForUpload:dataListForUpload,
      templateForm:templateForm,
      tableFields:tableFields
    }
    let curFieldName = '';
    let parentIndex = -1;
    let curIndex = -1;
    if(curFileUploadField && curFileUploadField.field_name){
      curFieldName = curFileUploadField.field_name;
      parentIndex =  curFileUploadField['parentIndex'];
      curIndex =  curFileUploadField['curIndex'];
    }
    if(curFileUploadFieldparentfield != '' && curFieldName != ''){
      const custmizedKey = this.commonFunctionService.custmizedKey(curFileUploadFieldparentfield);

      if (!responce.dataListForUpload[custmizedKey]) responce.dataListForUpload[custmizedKey] = {};
      if (!responce.dataListForUpload[custmizedKey][curFieldName]) responce.dataListForUpload[custmizedKey][curFieldName] = [];
      responce.dataListForUpload[custmizedKey][curFieldName] = responceData;


      if(responce.dataListForUpload[custmizedKey][curFieldName] && responce.dataListForUpload[custmizedKey][curFieldName].length > 0){
        let fileList = responce.dataListForUpload[custmizedKey][curFieldName];
        let fileName = this.modifyFileSetValue(fileList);

        if(curFileUploadField.type == 'input_with_uploadfile'){
          let tooltipMsg = this.getFileTooltipMsg(fileList);
          responce.tableFields[parentIndex].list_of_fields[curIndex]['tooltipMsg'] = tooltipMsg;
        }

        (<FormGroup>responce.templateForm.controls[curFileUploadFieldparentfield.field_name]).controls[curFieldName].setValue(fileName);
      }else{
        (<FormGroup>responce.templateForm.controls[curFileUploadFieldparentfield.field_name]).controls[curFieldName].setValue('');
        if(curFileUploadField.type == 'input_with_uploadfile'){
          responce.tableFields[parentIndex].list_of_fields[curIndex]['tooltipMsg'] = '';
        }
      }

    }else{
      if(curFieldName != ''){
        if (!responce.dataListForUpload[curFieldName]) responce.dataListForUpload[curFieldName] = [];
        responce.dataListForUpload[curFieldName] = responceData;

        if(responce.dataListForUpload[curFieldName] && responce.dataListForUpload[curFieldName].length > 0){
          let fileList = responce.dataListForUpload[curFieldName];
          let fileName = this.modifyFileSetValue(fileList);
          if(curFileUploadField.type == 'input_with_uploadfile'){
            let tooltipMsg = this.getFileTooltipMsg(fileList);
            responce.tableFields[curIndex]['tooltipMsg'] = tooltipMsg;
          }
          responce.templateForm.controls[curFieldName].setValue(fileName);
        }else{
          responce.templateForm.controls[curFieldName].setValue('');
          if(curFileUploadField.type == 'input_with_uploadfile'){
            responce.tableFields[curIndex]['tooltipMsg'] = '';
          }
        }
      }
    }
    return responce;
  }
  removeAttachedDataFromList(parent:any,child:any,index:any,dataListForUpload:any){
    let fieldName = child.field_name;
    if(parent != '' && parent != undefined){
      let custmisedKey = this.commonFunctionService.custmizedKey(parent);
      dataListForUpload[custmisedKey][fieldName].splice(index,1);

    }else{
      dataListForUpload[fieldName].splice(index,1)
    }
    return dataListForUpload;
  }


}
