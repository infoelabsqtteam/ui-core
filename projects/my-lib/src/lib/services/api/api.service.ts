import { CoreFunctionService } from './../common-utils/core-function/core-function.service';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { map, tap, switchMap, mergeMap, catchError } from 'rxjs/operators';
import { from, of, Observable } from 'rxjs';//fromPromise
import { DataShareService } from '../data-share/data-share.service';
import { EnvService } from '../env/env.service';
import { ModelService } from '../model/model.service';
import { StorageService } from '../storage/storage.service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  serverReq:boolean = false;

constructor(
  private dataShareService: DataShareService,
  private http:HttpClient,
  private envService: EnvService,
  private modalService: ModelService,
  private stroageService: StorageService,
  private coreFunctionService:CoreFunctionService
 ) { }

getStatiData(payloads:any){
  this.dataShareService.setReqResponce(true);
  let reqLength = payloads.length;
  let responceCount = 0;
  from(payloads)
  .pipe(
    mergeMap((payload)=>
      this.staticDataCall([payload]))
    )
    .subscribe(
      (res:any) => {
        this.setStaticData(res['success'])
        responceCount = responceCount + 1;
        if(responceCount == reqLength){
          this.dataShareService.setReqResponce(false);
        }
      },
      (error)=>{
        console.log(error);
      }
  )
}
staticDataCall(payload:object){
  let api = this.envService.getApi('GET_STATIC_DATA');
  return this.http.post(api, payload)
}
setStaticData(data:any){
  const staticData:any = this.dataShareService.getStatiData();
  const currentData:any = {};
  if(data && data.length > 0){
    data.forEach((element:any) => {
      if(element.adkeys){
          if(element.adkeys.totalRows && element.adkeys.totalRows != ''){
              staticData[element.field] = [];
              currentData[element.field] = [];
              for (let index = 0; index < element.adkeys.totalRows; index++) {
                  staticData[element.field].push(element.data);
                  currentData[element.field].push(element.data);
              }
          }
          if(element.adkeys.index && element.adkeys.index != ''){
              if(staticData[element.field] && staticData[element.field].length > 0){
                  const index = element.adkeys.index;
                  staticData[element.field][index] = element.data;
                  currentData[element.field][index] = element.data;
              }
          }
      }else{
          staticData[element.field] = element.data;
          currentData[element.field] = element.data;
      }
    });
  }
  if(data && data['staticDataMessgae'] != null && data['staticDataMessgae'] != ''){
    staticData['staticDataMessgae'] = data['staticDataMessgae'];
    currentData['staticDataMessgae'] = data['staticDataMessgae'];
  }
  this.dataShareService.shareStaticData(staticData,currentData);
}

ResetStaticData(keyName:any){
  let staticData:any = this.dataShareService.getStatiData();
  staticData[keyName.field] = null;
  this.dataShareService.shareStaticData(staticData,{});
}

resetStaticAllData(){
  this.dataShareService.shareStaticData({},{})
}

getGridCountData(payloads:string){
  from(payloads)
  .pipe(
    mergeMap((payload)=>
      this.gridCountDataCall([payload]))
    )
    .subscribe(
      (res:any) => {
        this.setGridCountData(res['success'])
      },
      (error)=>{
        console.log(error);
      }
  )
}
getTabCountData(payloads:any){
  let api = this.envService.getApi('GET_COUNT_DATA');
  this.http.post(api, payloads).subscribe(
    (respData:any) => {
      this.setGridCountData(respData['success'])
      },
    (error) => {
        console.log(error);
      }
  )
}

gridCountDataCall(payload:object){
  let api = this.envService.getApi('GET_COUNT_DATA');
  return this.http.post(api, payload)
}

setGridCountData(data:any){
  const localGridCount:any = this.stroageService.GetTabCounts();
  const gridCountData:any = this.dataShareService.getGridCountData();
  const count:any = {};
  const dataCount:any = {};
  if(data.length > 0){
    data.forEach((element:any) => {
      gridCountData[element.field] = element.data_size;
      count[element.field] = element.data_size;
      localGridCount[element.field] = element.data_size;
    });
  }
  dataCount['gridCountData'] = gridCountData;
  dataCount['count'] = count;
  this.stroageService.SetTabCounts(localGridCount)
  this.dataShareService.shareGridCountData(dataCount);
}
resetGridCountAllData(){
  this.dataShareService.shareGridCountData({ count: {}, gridCountData: {}})
}
getGridData(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareGridData(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}

resetGridData(){
  this.dataShareService.shareGridData([])
}
getDashletMster(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareDashletMaster(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
getMongoDashletMster(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareMongoChart(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
getMongoDashbord(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareMongoDashbord(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}

GetTempMenu(payload:any){
  let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
  this.http.post(api, payload).subscribe(
    (respData) => {
        this.dataShareService.shareMenuData(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
resetMenuData(){
  this.dataShareService.shareMenuData([])
}
GetTempData(payload:any){
  let moduleName = payload['module'];
  let name = this.coreFunctionService.getTempNameFromPayload(payload);
  let template = this.stroageService.getTemplate(name,moduleName);
  if(template){
    this.dataShareService.shareTempData([template]);
  }else{
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.dataShareService.shareTempData(respData);
          let preparedTempList = this.coreFunctionService.prepareTemplate(respData,moduleName);
          this.stroageService.storeAllTemplate(preparedTempList)
        },
      (error) => {
          console.log(error);
        }
    )
  }
}
resetTempData(){
  this.dataShareService.shareTempData([])
}
deleteGridRow(payload:any){
  let api = this.envService.getApi('DELETE_GRID_ROW');
  this.http.post(api+ '/' + payload.curTemp,payload).subscribe(
    (response) => {
      this.dataShareService.setDeleteGridRowResponce(response);
    }
  )
}

SaveFormData(payload:any){
  let api = this.envService.getApi('SAVE_FORM_DATA');
  this.saveCall(api+ '/' + payload.curTemp,payload)
}
SendEmail(payload:any){
  let api = this.envService.getApi('SEND_EMAIL');
  this.saveCall(api+ '/' + payload.curTemp,payload)
}
DynamicApiCall(payload:any){
  let api = this.envService.getBaseUrl();
  let list = payload.path.split("/");
  let callName = list[list.length-1];
  switch(callName){
    case "gsd":
      this.getStatiData(payload.data);
    break;
    default:
      this.saveCall(api+payload.path,payload)
  }

}
saveCall(api:string,payload:any){
  this.http.post(api, payload.data).subscribe(
    (respData) => {
        this.dataShareService.setSaveResponce(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
ResetSaveResponce(){
  this.dataShareService.setSaveResponce('')
}
GetFilterGridData(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareGridData(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
GetTypeaheadData(payload:any){
  let api = this.envService.getApi('GET_STATIC_DATA');
  this.http.post(api, payload).subscribe(
    (respData:any) => {
      let currentstaticData:any=[];
      let result =[];
      currentstaticData=respData['success'];
      if(currentstaticData.length > 0){
          result = currentstaticData[0].data
       }
        this.dataShareService.setTypeAheadData(result)
      },
    (error) => {
        console.log(error);
      }
  )
}
clearTypeaheadData(){
  this.dataShareService.setTypeAheadData([])
}
GetForm(payload:any){
  let endPoint = '';
  if(this.envService.getRequestType() == 'PUBLIC'){
    endPoint = 'GET_FORM_PUBLIC';
  }else{
    endPoint = 'GET_FORM';
  }
  let api = this.envService.getApi(endPoint);
  if(payload._id && payload._id != undefined && payload._id != null &&payload._id != ''){
      api = api + '/' + payload._id;
  }
  this.http.post(api, payload.data).subscribe(
    (respData:any) => {
      let dinamicForm;
      if(respData && respData['success'] != null){
          const object = JSON.parse(JSON.stringify(respData['success']));
          object['view_mode'] = "inlineFormView";
          dinamicForm = {
              DINAMIC_FORM : object
          }
      }
        this.dataShareService.setForm(dinamicForm)
      },
    (error) => {
        console.log(error);
      }
  )
}

GetNestedForm(payload:any){
  let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
  this.http.post(api, payload).subscribe(
    (respData:any) => {
        this.dataShareService.setNestedForm(respData[0]);
      },
    (error) => {
        console.log(error);
      }
  )
}

GetHostName(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData:any) => {
        this.dataShareService.setHostData(respData['data'])
      },
    (error) => {
        console.log(error);
      }
  )
}
GetDashletData(payloads:any){
  //this.dataShareService.setDashletData({});
  from(payloads)
  .pipe(
    mergeMap((payload)=>
      this.dashletDataCall(payload))
    )
    .subscribe(
      (res) => {
        this.SetDashletData(res)
      },
      (error)=>{
        console.log(error);
      }
  )
}
dashletDataCall(payload:any){
  let api = this.envService.getApi('GET_DASHLET_DATA');
  return this.http.post(api + '/' + payload._id, payload.data);
}
SetDashletData(respData:any){
  let currentStaticData=[];
  let getDashletData = this.dataShareService.getDashletData();
  const dashletData = JSON.parse(JSON.stringify(getDashletData));
  currentStaticData.push(respData);
  if(currentStaticData.length > 0){
      currentStaticData.forEach(element => {
          if(element && element.field != undefined && element.field != null){
              dashletData[element.field] = element.data
          }
      });

  }
  this.dataShareService.setDashletData(dashletData);
}

GetExportExclLink(payload:any){
  let api = this.envService.getApi('EXPORT_GRID_DATA');
  this.http.post(api, payload.data, payload.responce).subscribe(
    (respData) => {
        this.dataShareService.setExportExcelLink(respData)
      },
    (error) => {
      this.modalService.close('download-progress-modal');
        console.log(error);
      }
  )
}
GetExportCVSLink(payload:any){
  let api = this.envService.getApi('CSV_EXPORT_GRID_DATA');
  this.http.post(api, payload.data, payload.responce).subscribe(
    (respData) => {
        this.dataShareService.setExportCVSLink(respData)
      },
    (error) => {
      this.modalService.close('download-progress-modal');
        console.log(error);
      }
  )
}

resetGetExportExclLink(){
  this.dataShareService.setExportExcelLink('');
}
GetProductList(payload:any){
  let api = this.envService.getApi('GET_PARAMETER_LIST');
  this.http.post(api, payload).subscribe(
    (respData) => {
        this.dataShareService.setProductList(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
GetPreviewHtml(payload:any){
  let api = this.envService.getApi('GET_PREVIEW_HTML');
  this.http.post(api + '/' + payload._id, payload.data).subscribe(
    (respData:any) => {
        this.dataShareService.setPreviewHtml(respData['success']);
      },
    (error) => {
        console.log(error);
      }
  )
}
resetPreviewHtml(){
  this.dataShareService.setPreviewHtml('');
}
UpdateProductBranch(payload:any){
  let api = this.envService.getApi('SAVE_PARAMETER_LIST');
  this.http.post(api + '/' + payload._id, payload.data).subscribe(
    (respData) => {
        this.dataShareService.setUpdateProductBranch(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}
GetJobSchedules(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload._id, payload.data).subscribe(
    (respData) => {
        this.dataShareService.setJobScheduleData(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}
GetPdfData(payload:any){
  let api = this.envService.getApi('GET_PDF');
  this.http.post<HttpResponse<any>>(api + '/' + payload._id, payload.data, { responseType: 'arraybuffer' as 'json', observe: 'response' as 'body' }).subscribe(
    (respData) => {
        var contentDisposition:any = respData.headers.get('Content-Disposition');
        var filename = "";
        let matches = /filename="(.*?)"/g.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
            filename = filename.substring(filename.indexOf("=") + 1, filename.length)
        }
        this.dataShareService.setDownloadPdfData({ data: respData.body, filename: filename });
      },
    (error) => {
        console.log(error);
      }
  )
}
ResetPdfData(){
  this.dataShareService.setDownloadPdfData('');
}
GetFileData(payload:any){
  let api = this.envService.getApi('GET_FILE');
  this.http.post<HttpResponse<any>>(api + '/' + payload._id, payload.data, { responseType: 'arraybuffer' as 'json', observe: 'response' as 'body' }).subscribe(
    (respData) => {
        var contentDisposition:any = respData.headers.get('Content-Disposition');
        var filename = "";
        let matches = /filename="(.*?)"/g.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
            filename = filename.substring(filename.indexOf("=") + 1, filename.length)
        }
        this.dataShareService.setFileData({ data: respData.body, filename: filename });
      },
    (error) => {
        console.log(error);
      }
  )
}
PrintTemplate(payload:any){
  let api = this.envService.getApi('GET_FILE');
  this.http.post<HttpResponse<any>>(api + '/' + payload._id, payload.data, { responseType: 'arraybuffer' as 'json', observe: 'response' as 'body' }).subscribe(
    (respData) => {
        var contentDisposition:any = respData.headers.get('Content-Disposition');
        var filename = "";
        let matches = /filename="(.*?)"/g.exec(contentDisposition);
        if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
            filename = filename.substring(filename.indexOf("=") + 1, filename.length)
        }
        this.dataShareService.setPrintTemplate({ data: respData.body, filename: filename });
      },
    (error) => {
        console.log(error);
      }
  )
}
ResetFileData(){
  this.dataShareService.setFileData('');
}
DownloadFile(payload:any){
  let api = this.envService.getApi('DOWNLOAD_PDF');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData:any) => {
        this.dataShareService.setFileDownloadUrl(respData['success']);
      },
    (error) => {
        console.log(error);
      }
  )
}
ResetDownloadUrl(){
  this.dataShareService.setFileDownloadUrl('');
}
FileUpload(payload:any){
  let api = this.envService.getApi('GET_PDF');
  this.http.post(api + '/' + payload._id, payload.data, payload.responce).subscribe(
    (respData) => {
        console.log(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}
GetChartData(payload:object){
  let api = this.envService.getApi('GET_CHART_DATA');
  this.http.post(api, payload).subscribe(
    (respData) => {
        this.dataShareService.setChartData(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}
GetQr(payload:any){
  let api = this.envService.getApi('GET_QR_CODE');
  this.http.post(api + payload['number'], payload,{responseType: 'blob'} ).subscribe(
    (respData) => {
      this.dataShareService.setFileData({ data: respData, filename: "qr-"+payload['from']+"-"+(payload['to']-1) });
      },
    (error) => {
        console.log(error);
      }
  )
}

getAuditVersionList(payload:any){
  let api = this.envService.getApi('AUDIT_VERSION_LIST');
  this.http.get(api +"/"+ payload).subscribe(
    (respData) => {
      this.dataShareService.setAuditVersionList(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}

getAuditHistory(payload:any){
  let api = this.envService.getApi('AUDIT_HISTORY');
  this.http.post(api +"/"+ payload['path'], payload.data).subscribe(
    (respData) => {
      this.dataShareService.setAuditHistoryData(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}

getAplicationsThemeSetting(payload:object) {
  let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
  this.http.post(api, payload).subscribe(
    (respData) => {
      if(JSON.stringify(respData) != "{}"){
        this.dataShareService.setThemeSetting(respData)
      }
      },
    (error) => {
        console.log(error);
      }
  )
}
getAplicationsSetting(payload:object) {
  let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
  this.http.post(api, payload).subscribe(
    (respData) => {
      if(JSON.stringify(respData) != "{}"){
        this.dataShareService.setApplicationSetting(respData)
      }
      },
    (error) => {
        console.log(error);
      }
  )
}
fieldDinamicApi(api:any,payload:object){
  const host = this.envService.getBaseUrl();
  this.http.post(host+api, payload).subscribe(
    (respData) => {
      this.dataShareService.setFieldDinamicApiResponce(respData)
    },
    (error) => {
        console.log(error);
      }
  )
}

getNextFormData(payload:any) {
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
      if(JSON.stringify(respData) != "{}"){
        this.dataShareService.setNextFormData(respData)
      }
      },
    (error) => {
        console.log(error);
      }
  )
}


gitVersion(payload:string) {
  let api = this.envService.getApi('GIT_VERSION');
  this.http.get<any>(api).subscribe(
    (respData) => {
      this.dataShareService.setGitVersion(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}


getReportLoadGridData(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.setReportLoadGridData(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}


getFavouriteData(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData:any) => {
        if(respData && respData['data'] && respData['data'].length > 0){
          const userPreference = respData['data'][0];
          this.stroageService.setUserPreference(userPreference);
          this.dataShareService.setUserPreference(userPreference);
        }else{
          this.dataShareService.setUserPreference(respData['data']);
        }
      },
    (error) => {
        console.log(error);
      }
  )
}

getUserNotification(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareUserNotification(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}

getUserNotificationSetting(){
  let api = this.envService.getApi('GET_NOTIFICATION_SETTING');
  this.http.post(api,{}).subscribe(
    (respData) => {
        this.dataShareService.shareUserNotificationSetting(respData)
      },
    (error) => {
        console.log(error);
      }
  )
}
resetUserNotification(){
  this.dataShareService.shareUserNotification([])
}

getDownloadManual(payload:object){
  let api = this.envService.getApi('DOWNLOAD_MANUAL');
  this.http.post(api,payload).subscribe(
    (respData:any) => {
      const url= respData.fileUrl;
      this.dataShareService.sharePublicUrlFromS3(url);
      },
    (error) => {
        console.log(error);
      }
  )
}
getGridRunningData(payload:any){
  let api = this.envService.getApi('GET_GRID_DATA');
  this.http.post(api + '/' + payload.path, payload.data).subscribe(
    (respData) => {
        this.dataShareService.shareGridRunningData(respData);
      },
    (error) => {
        console.log(error);
      }
  )
}
  // For app
  getDatabyCollectionName(payload:any){
    let api = this.envService.getApi('GET_GRID_DATA');
    this.http.post(api + '/' + payload.path, payload.data).subscribe(
      (respData) => {
          this.dataShareService.collectionData(respData);
        },
      (error) => {
          console.log(error);
        }
    )
  }
  GetChildGrid(payload:any){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData:any) => {
          this.dataShareService.setChildGrid(respData[0]);
        },
      (error) => {
          console.log(error);
        }
    )
  }
  //End For app functions


}
