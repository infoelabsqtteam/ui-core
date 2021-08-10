import { Injectable,Inject } from '@angular/core';
import { from, of, Observable } from 'rxjs';//fromPromise

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  environment:any;
  constructor(@Inject('env') private env:any) { }
  

  load(): Observable<any>{
    return this.env;
  }

  getBaseUrl(){
    return this.env.serverhost;
  }
  getAppName(){
    return this.env.appName;
  }
  getAppId(){
    return this.env.appId;
  }
  
}
