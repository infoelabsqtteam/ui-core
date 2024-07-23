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

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

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


  download(url:any,fileName:any){
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
    let downloadLink = "";
    let totalGridData:number = this.storageService.getApplicationSetting()?.totalGridData;
    if(!totalGridData) {
      totalGridData = 50000;
    }
    if(total && totalGridData > 0 && total < totalGridData) {
      this.modalService.open('download-progress-modal', {});
      let tempNme = menuName.name;
      if(this.permissionService.checkPermission(tempNme,'export')){
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
        const getExportData = {
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
        downloadLink = fileName + '-' + new Date().toLocaleDateString();
        this.apiService.GetExportExclLink(getExportData);
      }else{
        this.permissionService.checkTokenStatusForPermission();
        //this.notificationService.notify("bg-danger", "Permission denied !!!");
      }
    }else {
      this.notificationService.notify("bg-danger", `Kindly filter data as download record size is : ${totalGridData} not ${total}`);
    }
    return downloadLink;
  }
  downloadExcelFromLink(exportExcelLink:any,downloadClick:string){
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
    this.apiService.resetGetExportExclLink();
    this.modalService.close('download-progress-modal');
    return downloadClick;
  }

}
