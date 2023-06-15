import { Component,OnInit } from '@angular/core';
import { CoreUtilityService,StorageService } from '@core/service-lib';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'weather';
  apiname:any="Swatantra Kumar";

  constructor(private storageService:StorageService,private coreUtilityService:CoreUtilityService){

  }
  ngOnInit(){
    this.storageService.setAppId(this.apiname);
    this.apiname = this.storageService.getAppId();
    console.log("Storage Set"+this.storageService.SetIdToken("fasdfa1548485dfsad1f848df1sa85f4178sdf1"))
    console.log("Storage Set"+this.storageService.GetIdToken())
    const endpoint = "SAVE_PARAMETER_LIST";
    // console.log("api"+this.coreUtilityService.publicBaseUrl("https://sitserverpharmalinkage.pharmalinkage.com/rest/",EndPoint.GET_PUBLIC_PDF))
    // ;
    // console.log("api-diynamic"+this.coreUtilityService.publicBaseUrl("https://sitserverpharmalinkage.pharmalinkage.com/rest/",(<any>EndPoint)["SAVE_PARAMETER_LIST"]))
  }

  setApiName(name:string){
    this.storageService.setAppId(name);
    this.apiname = this.storageService.getAppId();
  }
  setToken(token:string){
    this.storageService.SetIdToken(token)
  }

}
