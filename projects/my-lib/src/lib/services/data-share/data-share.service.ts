import { Injectable,EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DataShareService {
  sharedData:Subject<any> = new Subject();
  currentPage: Subject<any> = new Subject();
  currentpage:string = '';
  serverHostname : Subject<any> = new BehaviorSubject<any>(null);
  serverEndPoint : Subject<any> = new BehaviorSubject<any>(null);
  staticData: Subject<any> = new BehaviorSubject<any>(null);
  setStaticData={};
  gridCountData: Subject<any> = new BehaviorSubject<any>(null);
  setGridCountData={};
  gridData: Subject<any> = new BehaviorSubject<any>(null);
  menu:Subject<any> = new BehaviorSubject<any>(null);
  tempData:Subject<any> = new BehaviorSubject<any>(null);
  tempStoreData:any;
  saveFromDataRsponce:string='';
  deleteGridRowDataRsponce:string='';
  saveResponceData:Subject<any>= new BehaviorSubject<any>(null);
  deleteGridRowResponceData:Subject<any>= new BehaviorSubject<any>(null);
  gridFilterData:Subject<any>= new BehaviorSubject<any>(null);
  typeAheadData:Subject<any>= new BehaviorSubject<any>(null);
  form:Subject<any>= new BehaviorSubject<any>(null);
  dinamicForm={};
  docData:Subject<any>= new BehaviorSubject<any>(null);
  nestedForm:Subject<any>= new BehaviorSubject<any>(null);
  hostData:Subject<any> = new Subject<any>();
  dashletData:Subject<any> = new Subject<any>();
  DashLetData:any={};
  appName:Subject<any> = new Subject<any>();
  navigationData:Subject<any> = new Subject<any>();
  permissionData:Subject<any> = new Subject<any>();
  quoteData:Subject<any> = new Subject<any>();
  departmentData:Subject<any> = new Subject<any>();
  categoryData:Subject<any> = new Subject<any>();
  productData:Subject<any> = new Subject<any>();
  testParameters:Subject<any> = new Subject<any>();
  exportExcelLink:Subject<any> = new Subject<any>();
  exportCVSLink:Subject<any> = new Subject<any>();
  getProductList:Subject<any> = new Subject<any>();
  previewHtml:Subject<any> = new Subject<any>();
  updateProductBranch:Subject<any> = new Subject<any>();
  getJobSchedulesData:Subject<any> = new Subject<any>();
  downloadPdfData:Subject<any> = new Subject<any>();
  getfileData:Subject<any> = new Subject<any>();
  fileDownloadUrl:Subject<any> = new Subject<any>();
  chartData:Subject<any> = new Subject<any>();
  applicationSetting:Subject<any> = new Subject<any>();
  themeSetting:Subject<any> = new Subject<any>();
  fieldDinamicResponce:Subject<any> = new Subject<any>();
  checkValidation:Subject<any> = new Subject<any>();
  dashletMaster:Subject<any> = new Subject<any>();
  DashletMaster:any = [];
  gitVirsion:Subject<any> = new Subject<any>();
  nextFormData:Subject<any> = new Subject<any>();
  getReportLoadData:Subject<any> = new Subject<any>();
  getIsGridSelectionOpen:Subject<any> = new Subject<any>();
  chartModelShowHide:Subject<any> = new Subject<any>();
  auditHistoryList:Subject<any> = new Subject<any>();
  auditVersionList:Subject<any> = new Subject<any>();
  applicationSettings:Subject<any> = new Subject<any>();
  userNotification:Subject<any> = new Subject<any>();
  userNotificationSetting:Subject<any> = new Subject<any>();
  userPreference:Subject<any> = new Subject<any>();
  moduleIndex:Subject<any> = new Subject<any>();
  menuIndexs:Subject<any> = new Subject<any>();
  pModuleIndex:any=-1;
  menuOrSubmenuIndex:any={};
  headerMenu:Subject<any> = new Subject<any>();
  requestResponce:Subject<boolean> = new Subject<boolean>();
  mongoDbChartList:Subject<any> = new Subject<any>();
  MongoDbChartList:any = [];
  mongoDashbordList:Subject<any> = new Subject<any>();
  pdfFileName:Subject<string> = new Subject<string>();
  S3Url:Subject<string> = new Subject<string>();
  printData:Subject<any> = new Subject<any>();
  setClientName:Subject<any> = new Subject<any>();
  gridRunningData: Subject<any> = new Subject<any>();
  collectiondata:Subject<any> = new Subject<any>();
  childGrid:Subject<any> = new Subject<any>();
  childgridfields:any;
  roleChange:Subject<any> = new Subject<any>();
  dashbordSerchKey:Subject<any> = new Subject<any>();
  addAndUpdateResponce:Subject<any> = new Subject<any>();
  private selectedRowIndexSource = new BehaviorSubject<number | null>(null);
  selectedRowIndex$ = this.selectedRowIndexSource.asObservable();

  constructor() { }

  sendCurrentPage(responce:any) {
    if(responce != undefined && responce != null){
      this.currentPage.next(responce);
      this.currentpage = responce;
    }else{
      this.currentPage.next('HOME');
      this.currentpage = 'HOME';
    }
  }
  getCurrentPage(){
    return this.currentpage;
  }
  shareData(responce:any){
    this.sharedData.next(responce);
  }
  shareStaticData(staticData:any,data:any){
    this.staticData.next(data);
    this.setStaticData = staticData;
  }
  getStatiData(){
    return this.setStaticData;
  }
  shareGridCountData(responce:any){
    this.gridCountData.next(responce.count);
    this.setGridCountData = responce.gridCountData;
  }
  getGridCountData(){
    return this.setGridCountData;
  }
  shareGridData(gridData:any){
    this.gridData.next(gridData);
  }
  shareDashletMaster(responce:any){
    this.dashletMaster.next(responce);
    this.DashletMaster = responce;
  }
  getDashletMaster(){
    return this.DashletMaster;
  }
  shareMongoChart(chartData:any){
    this.mongoDbChartList.next(chartData);
    this.MongoDbChartList = chartData;
  }
  getMongoChart(){
    return this.MongoDbChartList;
  }
  shareMongoDashbord(responce:any){
    this.mongoDashbordList.next(responce)
  }
  shareMenuData(menuData:any){
    this.menu.next(menuData);
  }
  shareTempData(tempData:any){
    this.tempData.next(tempData);
    this.tempStoreData = tempData;
  }
  getTempData(){
    return this.tempStoreData;
  }
  setSaveResponce(responce:any){
    this.saveResponceData.next(responce);
    this.saveFromDataRsponce = responce;
  }
  getSaveResponce(){
    return this.saveFromDataRsponce;
  }

  setDeleteGridRowResponce(responce:any){
    this.deleteGridRowResponceData.next(responce);
    this.deleteGridRowDataRsponce = responce;
  }
  getDeleteRowDataResponce(){
    return this.deleteGridRowDataRsponce;
  }

  setGridFilterData(responce:any){
    this.gridFilterData.next(responce);
  }
  setTypeAheadData(responce:any){
    this.typeAheadData.next(responce);
  }
  setForm(form:any){
    this.form.next(form);
    this.dinamicForm = form;
  }
  getDinamicForm(){
    return this.dinamicForm;
  }
  setNestedForm(form:any){
    this.nestedForm.next(form)
  }
  setHostData(data:any){
    this.hostData.next(data);
  }
  setDashletData(dashletData:any){
    this.dashletData.next(dashletData);
    this.DashLetData = dashletData;
  }
  getDashletData(){
    return this.DashLetData
  }
  resetDashletData(){
    this.DashLetData = {};
  }
  resetDashletDataByKey(keyName:any){
    delete this.DashLetData[keyName];
    this.dashletData.next(this.DashLetData);
  }
  setAppName(response:any){
    this.appName.next(response);
  }
  setNavigationData(responce:any){
    this.navigationData.next(responce);
  }
  setPermissionData(responce:any){
    this.permissionData.next(responce);
  }
  setQuoteData(responce:any){
    this.quoteData.next(responce);
  }
  setDepartmentData(responce:any){
    this.departmentData.next(responce);
  }
  setCategoryData(responce:any){
    this.categoryData.next(responce);
  }
  setProductData(responce:any){
    this.productData.next(responce);
  }
  setTestParameter(responce:any){
    this.testParameters.next(responce);
  }
  setExportExcelLink(responce:any){
    this.exportExcelLink.next(responce);
  }
  setExportCVSLink(responce:any){
    this.exportCVSLink.next(responce);
  }
  setProductList(responce:any){
    this.getProductList.next(responce)
  }
  setPreviewHtml(responce:any){
    this.previewHtml.next(responce);
  }
  setUpdateProductBranch(responce:any){
    this.updateProductBranch.next(responce);
  }
  setJobScheduleData(responce:any){
    this.getJobSchedulesData.next(responce);
  }
  setDownloadPdfData(responce:any){
    this.downloadPdfData.next(responce);
  }
  setFileData(responce:any){
    this.getfileData.next(responce);
  }
  setPrintTemplate(responce:any){
    this.printData.next(responce);
  }
  setFileDownloadUrl(responce:any){
    this.fileDownloadUrl.next(responce)
  }
  setChartData(responce:any){
    this.chartData.next(responce)
  }
  setThemeSetting(responce:any){
    this.themeSetting.next(responce)
  }
  setApplicationSetting(responce:any){
    this.applicationSetting.next(responce);
  }
  resetThemeSetting(responce:any){
    this.themeSetting.next(responce);
  }
  resetApplicationSetting(responce:any){
    this.applicationSetting.next(responce);
  }
  setFieldDinamicApiResponce(responce:any){
    this.fieldDinamicResponce.next(responce);
  }
  setValidationCondition(responce:any){
    this.checkValidation.next(responce);
  }
  setGitVersion(responce:any){
    this.gitVirsion.next(responce);
  }
  setNextFormData(responce:any){
    this.nextFormData.next(responce);
  }
  setReportLoadGridData(responce:any){
    this.getReportLoadData.next(responce);
  }
  setIsGridSelectionOpenOrNot(check:boolean){
    this.getIsGridSelectionOpen.next(check);
  }
  setChartModelShowHide(value:any){
    this.chartModelShowHide.next(value);
  }
  setAuditHistoryData(data:any){
    this.auditHistoryList.next(data);
  }

  setAuditVersionList(data:any){
    this.auditVersionList.next(data);
  }

  shareUserNotification(responce:any){
    this.userNotification.next(responce);
  }
  shareUserNotificationSetting(responce:any){
    this.userNotificationSetting.next(responce);
  }
  setUserPreference(userPreference:any){
    this.userPreference.next(userPreference);
  }
  subscribeTemeSetting(responce:any){
    this.applicationSettings.next(responce);
  }
  setModuleIndex(index:any){
    this.moduleIndex.next(index);
    this.pModuleIndex = index;
  }
  setMenuIndexs(indexs:any){
    this.menuIndexs.next(indexs);
    this.menuOrSubmenuIndex = indexs;
  }
  getProjectModuleIndex(){
    return this.pModuleIndex;
  }
  getMenuOrSubmenuIndexs(){
    return this.menuOrSubmenuIndex;
  }
  setReqResponce(responce:boolean){
    this.requestResponce.next(responce)
  }
  resetHeaderMenu(responce:any){
    this.headerMenu.next(responce);
  }
  sharePdfFileName(fileName:any){
    this.pdfFileName.next(fileName);
  }

  sharePublicUrlFromS3(url:any){
    this.S3Url.next(url);
  }

  shareGridRunningData(responce:any){
    this.gridRunningData.next(responce);
  }
  shareServerHostName(serverHostname:any){
    this.serverHostname.next(serverHostname);
  }
  getServerEndPoint(req:boolean){
    this.serverEndPoint.next(req);
  }
   //For App
  collectionData(responce:any){
    this.collectiondata.next(responce);
  }
  setChildGrid(responce:any){
    this.childGrid.next(responce);
    this.childgridfields = responce;
  }
  getChildGrid(){
    return this.childgridfields;
  }
  shareRoleChange(role:any){
    this.roleChange.next(role);
  }
  shareDashbordSerach(key:string){
    this.dashbordSerchKey.next(key);
  }
  shareAddAndUpdateResponce(responce:string){
    this.addAndUpdateResponce.next(responce);
  }
  updateSelectedRowIndex(index: number) {
    this.selectedRowIndexSource.next(index);
  }
  //End For App

}
