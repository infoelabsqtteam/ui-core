import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiCallService } from '../api/api-call/api-call.service';
import { CheckIfService } from '../check-if/check-if.service';
import { StorageService } from '../storage/storage.service';
import { PermissionService } from '../permission/permission.service';
import { ModelService } from '../model/model.service';
import { ApiService } from '../api/api.service';
import { NotificationService } from '../notify/notification.service';
import { AppConfig, AppConfigInterface } from '../../shared/configuration/config';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  public config:AppConfigInterface = AppConfig;

  constructor(
    @Inject(DOCUMENT) document:any,
    private checkIfService:CheckIfService,
    private apiCallService:ApiCallService,
    private storageService:StorageService,
    private permissionService:PermissionService,
    private modalService:ModelService,
    private apiService:ApiService,
    private notificationService:NotificationService
  ) { }


  download(url:any,fileName:any,button?:any){
    if(button && button.openNewTab){
      window.open(url, '_blank');
    }
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  exportCsv(tempNme:any,headElements:any[],tab:any,currentMenu:any,userInfo:any,filterForm:any){
    let fiteredList: any[]=[];
    headElements.forEach(element => {
      if(element && element.display){
        // delete element.display;
        fiteredList.push(element)
      }
    });
      let gridName = '';
      let grid_api_params_criteria = [];
      if(this.checkIfService.isGridFieldExist(tab,"api_params_criteria")){
        grid_api_params_criteria = tab.grid.api_params_criteria;
      }
      const data = this.apiCallService.getPaylodWithCriteria(currentMenu.name,'',grid_api_params_criteria,'');
      if(tab && tab.grid){
        if(tab.grid.export_template && tab.grid.export_template != null){
          gridName = tab.grid.export_template;
        }else{
          gridName = tab.grid._id;
        }
      }
      delete data.log;
      delete data.key;
      data['key'] = userInfo.refCode;
      data['key3']=gridName;
      const value = filterForm.getRawValue();
      const filterCrlist = this.apiCallService.getfilterCrlist(headElements,value);
      if(filterCrlist.length > 0){
        filterCrlist.forEach((element: any) => {
          data.crList.push(element);
        });
      }
      const getExportData = {
        data: {
          refCode: userInfo.refCode,
          log: this.storageService.getUserLog(),
          kvp: data,
          gridData: fiteredList,
        },
        responce: { responseType: "arraybuffer" },
        path: tempNme
      }

      return getExportData;
  }
  exportExcel(total:any,gridColumns:any,gridFilterValue:any,tab:any,menuName:any) {
    let tempName = menuName.name;
    if(this.permissionService.checkPermission(tempName,'export')){
      // let totalGridData:number = this.storageService.getApplicationSetting()?.totalGridData;
      let totalGridData = 500;
      if(!totalGridData) {
        totalGridData = 50000;
      }
      if(total && totalGridData > 0 && total < totalGridData) {
        this.getExcelData(tab,menuName,gridColumns,gridFilterValue,tempName,0,totalGridData);
      }else {
        let data = {
          'tab':tab,
          'menuName':menuName,
          'gridColumns':gridColumns,
          'gridFilterValue':gridFilterValue,
          'tempName':tempName,
          'total':total,
          'totalGridData':totalGridData
        }
        this.modalService.open('export-excel',data);
      }
    }else{
      this.permissionService.checkTokenStatusForPermission();
    }
  }
  getExcelData(tab:any,menuName:any,gridColumns:any,gridFilterValue:any,tempName:any,pageNo:any,pageSize:any){
    this.modalService.open('download-progress-modal', {});
    let responce = this.getExcelDataPayload(tab,menuName,gridColumns,gridFilterValue,tempName,pageNo,pageSize)
    this.apiService.GetExportExclLink(responce.payload);
    this.config.downloadClick = responce.downloadLink;
  }
  getExcelDataPayload(tab:any,menuName:any,gridColumns:any,gridFilterValue:any,tempNme:any,pageNo:any,pageSize:any){
    let responce  ={
      downloadLink : '',
      payload : {}
    }
    let data = this.apiCallService.preparePayloadWithCrlist(tab,menuName,gridColumns,gridFilterValue);
    let gridName = '';
    if(tab && tab?.grid){
      if(tab?.grid?.export_template){
        gridName = tab.grid.export_template;
      }else{
        gridName = tab.grid._id;
      }
    }
    delete data.log;
    data['key3']=gridName;
    data['pageNo'] = pageNo;
    data['pageSize'] = pageSize;
    responce.payload = {
      data: {
        refCode: this.storageService.getRefCode(),
        log: this.storageService.getUserLog(),
        kvp: data
      },
      responce: { responseType: "arraybuffer" },
      path: tempNme
    }
    var fileName = tempNme;
    fileName = fileName.charAt(0).toUpperCase() + fileName.slice(1)
    responce.downloadLink = fileName + '-' + new Date().toLocaleDateString();
    return responce;
  }
  getAllExcelData(tab:any,menuName:any,gridColumns:any,gridFilterValue:any,tempName:any,pageSize:any,data:any){
    if(data && data.length > 0){
      let payloadList = [];
      for (const obj of data) {
        if(obj.value > 0){
          let responce = this.getExcelDataPayload(tab,menuName,gridColumns,gridFilterValue,tempName,obj.value,pageSize);
          payloadList.push(responce);
        }
      }
      if(payloadList && payloadList.length > 0){
        this.apiService.getListExcel(payloadList);
      }
    }
  }
  downloadExcelFromLink(exportExcelLink:any,downloadClick:string){
    downloadClick = this.downloadExcelFile(exportExcelLink,downloadClick);
    this.apiService.resetGetExportExclLink();
    this.modalService.close('download-progress-modal');
    return downloadClick;
  }
  downloadExcelFile(exportExcelLink:any,downloadClick:string){
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    const file = new Blob([exportExcelLink], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = window.URL.createObjectURL(file);
    link.href = url;
    link.download = downloadClick;
    document.body.appendChild(link);
    link.click();
    link.remove();
    downloadClick = '';
    return downloadClick;
  }

}
