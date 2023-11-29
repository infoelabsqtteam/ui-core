import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ApiCallService } from '../api/api-call/api-call.service';
import { CheckIfService } from '../check-if/check-if.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  constructor(
    @Inject(DOCUMENT) document:any,
    private checkIfService:CheckIfService,
    private apiCallService:ApiCallService,
    private storageService:StorageService
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

  exportCsv(tempNme:any,headElements:any[],tab:any,currentMenu:any,userInfo:any,filterForm: FormGroup){
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

}
