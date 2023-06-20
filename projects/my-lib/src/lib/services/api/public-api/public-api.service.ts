import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { EnvService } from '../../env/env.service';
import { PublicDataShareService } from '../../data-share/public-data-share/public-data-share.service';

@Injectable({
  providedIn: 'root'
})
export class PublicApiService {

  constructor(
    private publicDataShare:PublicDataShareService,
    private http:HttpClient,
    private envService:EnvService,
  ) { }

  SaveContactUs(payload:any){
    let api = this.envService.getApi('PATAINT_REPORT');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.publicDataShare.setContactUsData(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }
  SaveCareerWithUs(payload:any){
    let api = this.envService.getApi('SAVE_CAREER_WITH_US');
    this.http.post(api, payload).subscribe(
      (respData) => {
          this.publicDataShare.setCarrerwithUs(respData);
        },
      (error) => {
          console.log(error);
        }
    ) 
  }

}
