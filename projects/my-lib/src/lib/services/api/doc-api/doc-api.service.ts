import { Injectable } from '@angular/core';
import { EnvService } from '../../env/env.service';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { DocDataShareService } from '../../data-share/doc-data-share/doc-data-share.service';

@Injectable({
  providedIn: 'root'
})
export class DocApiService {

  constructor(
    private http:HttpClient,
    private envService:EnvService,
    private docDataShare:DocDataShareService
  ) { }

  SearchDocData(payload:object){
    let api = this.envService.getApi('GET_CUSTOM_TEMPLATE');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setDocData(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  // GetHomeVdr(payload){
  //   let api = this.envService.getApi('GET_VDR_DATA');
  //   this.http.post(api + '/' + payload.appId+ '/' + payload.refCode, payload.log).subscribe(
  //     (respData) =>{
  //       if(respData['success']){
  //         this.docDataShare.setVdrData(respData['success']);
  //         this.docDataShare.setMoveFolderData(respData['success']);
  //       }
  //     },
  //     (error)=>{
  //       console.log(error);
  //     }
  //   )
  // }


  GetHomeVdr(payload:any){
    let api = this.envService.getApi('GET_GRID_DATA');
    this.http.post(api + '/' + payload.path, payload.data).subscribe(
      (respData:any) =>{
        if(respData['success']){
          this.docDataShare.setVdrData(respData['success']);
          this.docDataShare.setMoveFolderData(respData['success']);
        }
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  
  GetHomeVdrBack(payload:any){
    let api = this.envService.getApi('GET_VDR_DATA');
    this.http.post(api + '/' + payload.appId+ '/' + payload.refCode, payload.log, payload.crList).subscribe(
      (respData:any) =>{
        if(respData['success']){
          this.docDataShare.setMoveFolderData(respData['success']);
        }
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  GetMoveFolderData(payload:object){
    let api = this.envService.getApi('GET_VDR_DATA');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setMoveFolderData(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  GetMoveFolderChild(payload:object){
    let api = this.envService.getApi('MOVE_FOLDER_CHILD');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setMoveFolderChildData(respData);
        this.docDataShare.setMoveFolderData(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  SaveUploadFile(payload:object){
    let api = this.envService.getApi('INSERT_FILE_AFTER_UPLOAD');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setDocUploadResponce(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  CreateFolder(payload:object){
    let api = this.envService.getApi('CREATE_FOLDER');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setCreateFolder(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  GetFolderChild(payload:object){
    let api = this.envService.getApi('MOVE_FOLDER_CHILD');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setVdrData(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }

  GetFolderChild1(payload:any){
    let api = this.envService.getApi('GET_GRID_DATA');
    this.http.post(api + '/' + payload.path, payload.data).subscribe(
      (respData) => {
        this.docDataShare.setVdrData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 

    // let api = this.envService.getApi('MOVE_FOLDER_CHILD');
    // this.http.post(api, payload).subscribe(
    //   (respData) =>{
    //     this.docDataShare.setVdrData(respData);
    //   },
    //   (error)=>{
    //     console.log(error);
    //   }
    // )
  }

  GetFolderByKey(payload:object){
    let api = this.envService.getApi('GET_CHILD_FOLDER_BY_KEY');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        this.docDataShare.setVdrData(respData['success']);        
      },
      (error)=>{
        console.log(error);
      }
    )
  }



  
  GetDocAudit(payload:object){
    let api = this.envService.getApi('GET_DOC_AUDIT');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setDocAudit(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  ResetAudit(){
    this.docDataShare.setDocAudit([]);
  }
  DocFileDownload(payload:object){
    let api = this.envService.getApi('DOC_FILE_DOWNLOAD');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        this.docDataShare.setDocFileDownloadLink(respData['success']);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  SetDocFileAutditAfterDownload(payload:object){    
    let api = this.envService.getApi('SET_DOC_FILE_AUDIT_AFTER_DOWNLOAD');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        this.docDataShare.setDocFileDownloadLink(respData['success']);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  ResetDownloadLink(){
    this.docDataShare.setDocFileDownloadLink('');
  }
  GetDocFileViewLink(payload:object){
    let api = this.envService.getApi('DOC_FILE_VIEW');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        const data = respData['success'];
        this.docDataShare.setDocFileViewLink(data);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  DocDelete(payload:any){
    let api = this.envService.getApi('DOC_DELETE');
    this.http.post(api + payload.action + "/" + payload.projectMod, payload.data).subscribe(
      (respData) =>{
        this.docDataShare.setDocDeleteResponce(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  ResetDeleteDocResponce(){
    this.docDataShare.setDocDeleteResponce(null);
  }
  GetBackFoldersByKey(payload:object){
    let api = this.envService.getApi('GET_CHILD_FOLDER_BY_KEY');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        this.docDataShare.setMoveFolderChildData(respData);
        this.docDataShare.setMoveFolderData(respData['success']);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  GetBackHomeVdr(payload:object){
    let api = this.envService.getApi('GET_VDR_DATA');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setMoveFolderChildData(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  toShare(payload:object){
    let api = this.envService.getApi('DOC_SHARE');
    this.http.post(api, payload).subscribe(
      (respData) =>{
        this.docDataShare.setDocShareResponce(respData);
      },
      (error)=>{
        console.log(error);
      }
    )
  }
  getFoderByKey(payload:object){
    let api = this.envService.getApi('GET_FOLDER_BY_KEY');
    this.http.post(api, payload).subscribe(
      (respData:any) =>{
        this.docDataShare.setFolderData(respData['success']);
      },
      (error)=>{
        console.log(error);
      }
    )
  }



  SetDocPermission(payload:object){
    let api = this.envService.getApi('DOC_PERMISSION');
    this.http.post(api, payload).subscribe(
      (respData) => {
        this.docDataShare.setVdrPermissionData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }







}
