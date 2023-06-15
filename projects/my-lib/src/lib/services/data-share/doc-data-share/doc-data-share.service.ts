import { Injectable,EventEmitter } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DocDataShareService {


  docData:Subject<any>= new BehaviorSubject<any>(null);
  vdrData:Subject<any>= new BehaviorSubject<any>(null);
  moveFolderData:Subject<any>= new BehaviorSubject<any>(null);
  moveFolderChild:Subject<any>= new BehaviorSubject<any>(null);
  uploadResponce:Subject<any>= new BehaviorSubject<any>(null);
  createFolderData:Subject<any>= new BehaviorSubject<any>(null);
  docAudit:Subject<any>= new BehaviorSubject<any>(null);
  docFiledownloadLink:Subject<any>= new BehaviorSubject<any>(null);
  docFileViewLink:Subject<any>= new BehaviorSubject<any>(null);
  docDeleteResponce:Subject<any>= new BehaviorSubject<any>(null);
  docShareResponce:Subject<any>= new BehaviorSubject<any>(null);
  folder:Subject<any>= new BehaviorSubject<any>(null);
  vdrPermission:Subject<any>= new BehaviorSubject<any>(null);


  // docData:Subject<any> = new Subject<any>();
  // vdrData:Subject<any>= new Subject<any>();
  // moveFolderData:Subject<any>= new Subject<any>();
  // moveFolderChild:Subject<any>= new Subject<any>();
  // uploadResponce:Subject<any>= new Subject<any>();
  // createFolderData:Subject<any>= new Subject<any>();
  // docAudit:Subject<any>= new Subject<any>();
  // docFiledownloadLink:Subject<any>= new Subject<any>();
  // docFileViewLink:Subject<any>= new Subject<any>();
  // docDeleteResponce:Subject<any>= new Subject<any>();
  // docShareResponce:Subject<any> = new Subject<any>();
  // folder:Subject<any> = new Subject<any>();
  // vdrPermission:Subject<any> = new Subject<any>();

  constructor() { }

  setDocData(data:object){
    this.docData.next(data);
  }
  setVdrData(vdrData:object){
    this.vdrData.next(vdrData);
  }
  setMoveFolderData(moveData:object){
    this.moveFolderData.next(moveData)
  }
  setMoveFolderChildData(moveChildData:object){
    this.moveFolderChild.next(moveChildData)
  }
  setDocUploadResponce(responce:object){
    this.uploadResponce.next(responce);
  }
  setCreateFolder(createFolderData:object){
    this.createFolderData.next(createFolderData);
  }
  setDocAudit(data:object){
    this.docAudit.next(data);
  }
  setDocFileDownloadLink(responce:string){
    this.docFiledownloadLink.next(responce);
  }
  setDocFileViewLink(responce:object){
    this.docFileViewLink.next(responce);
  }
  setDocDeleteResponce(responce:any){
    this.docDeleteResponce.next(responce);
  }
  setDocShareResponce(responce:object){
    this.docShareResponce.next(responce);
  }
  setFolderData(responce:object){
    this.folder.next(responce);
  }
  setVdrPermissionData(vdrData:object){
    this.vdrPermission.next(vdrData);
  }
}
