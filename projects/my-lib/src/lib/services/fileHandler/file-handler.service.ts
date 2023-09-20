import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FileHandlerService {

  constructor() { }


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


}
