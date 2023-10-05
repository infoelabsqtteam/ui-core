import { DatePipe } from '@angular/common';
import { Injectable,EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  filterRest:EventEmitter<any> = new EventEmitter<any>(false);
  constructor(
    private datePipe:DatePipe
  ) { }

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
            const val = obj[key]
            if(val && val.constructor && val.constructor.name == "Date"){
              const format = object.dateFormat ? object.dateFormat : 'dd/MM/yyyy';
              modifyObj[value] = this.datePipe.transform(val,format);
            }else{
              modifyObj[value] = obj[key];
            }
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
  resetChartFilter(){
    this.filterRest.emit(true);
  }
  getFilterData(dashbord:any,formValue:any){
    let fields = dashbord.fields && dashbord.fields.length > 0 ? dashbord.fields : [];
    let filterValue = this.getMongochartFilterValue(fields,formValue);
    let filterData = this.getMongodbFilterObject(filterValue);
    return filterData;
  }
  getMongochartFilterValue(fields:any,object:any){
    let modifyObject:any = {};
    let objectCopy = JSON.parse(JSON.stringify(object));
    if(fields && fields.length > 0 && Object.keys(objectCopy).length > 0){
      fields.forEach((field:any) => {
        let key = field.field_name;
        if(object && object[key] && object[key] != ''){
          let newDateObjec:any = {};
          let date = new Date();
          switch (field.type) {
            case 'typeahead':
              if(objectCopy[key] && typeof objectCopy[key] == 'object'){
                modifyObject[key+'._id'] = objectCopy[key]._id;
              }else{
                modifyObject[key] = objectCopy[key];
              }
              break;
            case 'dropdown':
              if(field.datatype == "object"){
                if(field.multi_select){
                  let idList:any = [];
                  if(object[key] && object[key].length > 0){
                    object[key].forEach((data:any) => {
                      idList.push(data._id);
                    });
                  }
                  if(idList && idList.length > 0){
                    modifyObject[key+'._id'] = idList;
                  }
                }else{
                  modifyObject[key+'._id'] = objectCopy[key]._id;
                }
              }else{
                modifyObject[key] = objectCopy[key];
              }
              break;
            case 'date':
              let formateDate:any = this.datePipe.transform(objectCopy[key], 'yyyy-MM-dd');
              let selectedDate = new Date(formateDate);
              selectedDate.setTime(selectedDate.getTime()+(24*3600000));
              newDateObjec = {};
              date = new Date(formateDate);
              newDateObjec['$gt'] = date;
              newDateObjec['$lte'] = selectedDate;
              modifyObject[key] =  newDateObjec;
              break;
            case 'daterange':
              if(object[key].start && object[key].end && object[key].start != '' && object[key].end != ''){
                let startDate:any = this.datePipe.transform(object[key].start,'yyyy-MM-dd');
                let endDate:any = this.datePipe.transform(object[key].end,'yyyy-MM-dd');
                let modifyEndDate = new Date(endDate);
                modifyEndDate.setTime(modifyEndDate.getTime()+(24*3600000));
                newDateObjec = {};
                newDateObjec['$gt'] = new Date(startDate);
                newDateObjec['$lte'] = new Date(modifyEndDate);
                modifyObject[key] =  newDateObjec;
              }
              break;
            default:
              modifyObject[key] = objectCopy[key];
              break;
          }
        }
      });
    }
    return modifyObject;
  }
  getMongodbFilterObject(data:any){
    let object:any = {};
    if(Object.keys(data).length > 0){
      Object.keys(data).forEach(key => {
        if(data[key] && data[key] != ''){
          object[key] = data[key];
        }
      });
    }
    return object;
  }
}
