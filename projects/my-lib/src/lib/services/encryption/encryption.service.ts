import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  encryptRequest(obj:any) {
    return btoa(JSON.stringify(obj));
  }

}
