import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ModelService {

  private modals: any[] = [];

  constructor() { }  
 
  add(modal: any) {
      this.modals.push(modal);
  }

  remove(id: string) {
      this.modals = this.modals.filter(x => x.id !== id);
  }

  open(id: string,object:object) {
      let modal: any = this.modals.filter(x => x.id === id)[0];
      modal.showModal(object);
  }
  close(id: string) {
      let modal: any = this.modals.filter(x => x.id === id)[0];
      modal.close();
  }
}
