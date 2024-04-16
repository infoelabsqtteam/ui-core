import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarHorizontalPosition, MatSnackBarVerticalPosition } from '@angular/material/snack-bar';
import { ApiService } from '../api/api.service';
@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  horizontalPosition: MatSnackBarHorizontalPosition = 'right';
  verticalPosition: MatSnackBarVerticalPosition = 'top';

  constructor(
    private _snackBar: MatSnackBar,
    private apiService: ApiService,
  ) { }


  notify(className:string,message:string) { 
    if(className !=null && message !=null){
      this._snackBar.open(message, 'Dismiss', {
        duration: 5000,
        panelClass: className,
        horizontalPosition: this.horizontalPosition,
        verticalPosition: this.verticalPosition
      });
    }
  }

  markUsRead(data:any){
    if (data.notificationStatus === 'UNREAD') {
        data.notificationStatus = 'READ';
        const payload = {
            curTemp: 'user_notification_master',
            data: data
        };
        this.apiService.SaveFormData(payload);
    }    
  }

}
