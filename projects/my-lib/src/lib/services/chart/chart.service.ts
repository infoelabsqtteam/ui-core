import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  constructor(
    private datePipe:DatePipe
  ) { }

  getDownloadData(chart:any,object:any){
    let DataList:any = [];
    let fileName = object.name;
    chart.getData().then((chartdata: any) => {
      let data = chartdata.documents;
      let fields = chartdata.fields;
      if(data && data.length > 0){
        data.forEach((obj:any) => {
          let modifyObj:any = {};
          Object.keys(fields).forEach((key) => {
            const value = fields[key];
            const val = obj[key]
            if(val && val.constructor && val.constructor.name == "Date"){
              modifyObj[value] = this.datePipe.transform(val,'dd/MM/yyyy');
            }else{
              modifyObj[value] = obj[key];
            }
          });
          DataList.push(modifyObj);
        });
      }
      if(DataList && DataList.length > 0){
        this.downloadFile(DataList,fileName);
      }
    });

  }
  downloadFile(data: any,fileName:any) {
    const replacer = (key:any, value:any) => (value === null ? '' : value); // specify how you want to handle null values here
    const header = Object.keys(data[0]);
    const csv = data.map((row:any) =>
      header
        .map((fieldName) => JSON.stringify(row[fieldName], replacer))
        .join(',')
    );
    csv.unshift(header.join(','));
    const csvArray = csv.join('\r\n');

    const a = document.createElement('a');
    const blob = new Blob([csvArray], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);

    a.href = url;
    a.download = fileName;
    a.click();
    window.URL.revokeObjectURL(url);
    a.remove();
  }

}
