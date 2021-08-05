import { Injectable } from '@angular/core';
import {LOGS} from './mock-logs';

@Injectable({
  providedIn: 'root' // Root mean - through out available
})
export class LoggingService {

  constructor() { }

  log(message: string){
    console.log(message);
  }

  getLogs(){
    return LOGS;
  }
}
