import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from "@angular/router";
import { Injectable } from '@angular/core';
import { map, take } from 'rxjs/operators';
import { AuthService } from "./auth.service";
import { StorageService } from "../../storage/storage.service";


@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate{
    
    constructor(
      private storageService:StorageService,
      private router: Router,
      private authService:AuthService
      ){

    }
    
    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Promise<boolean>{
      // return this.dataShareService.getAuthentication().pipe(
      //   map((data:boolean) =>{
      //     return data;
      //   })
      // );
      const childWindowUrl = this.storageService.getChildWindowUrl();
      if(state.url.startsWith("/browse") && (childWindowUrl == undefined || childWindowUrl == '/')){
        this.storageService.setRedirectUrl(state.url);
      }
      var isAuthenticated = this.authService.checkIdTokenStatus().status;
      if (!isAuthenticated) {        
        this.authService.redirectToSignPage();
      }
      return isAuthenticated;
    }
}