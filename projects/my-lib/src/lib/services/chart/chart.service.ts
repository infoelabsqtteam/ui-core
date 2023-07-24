import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor() { }

  async getDownloadData(chart:any,object:any){
    let DataList:any = [];
    let fileName = object.name;
    let blobUrl :any = '';
    await chart.getData().then((chartdata: any) => {      
      let data = chartdata.documents;
      let fields = chartdata.fields;
      if(data && data.length > 0){
        data.forEach((obj:any) => {          
          let modifyObj:any = {};
          Object.keys(fields).forEach((key) => {
            const value = fields[key];
            modifyObj[value] = obj[key];
          });
          DataList.push(modifyObj);
        });
      }      
      if(DataList && DataList.length > 0){      
        blobUrl = this.downloadFile(DataList);
      }
    });
    return {
      url: blobUrl,
      name: fileName
    }
    
  }
  downloadFile(data: any) {
    const replacer = (key:any, value:any) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row:any) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    return  blob;
  }
  downlodBlobData(blob:any,fileName:string){
    const a = document.createElement('a');
    const url = window.URL.createObjectURL(blob);  
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
  }

}
