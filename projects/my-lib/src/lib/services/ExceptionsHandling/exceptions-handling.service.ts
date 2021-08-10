import { Injectable } from '@angular/core';
import { of, Observable } from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ExceptionsHandlingService {

  constructor() { }
  handleError<T>(operation = 'operation', result?: T){
    return (error: any) : Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }
}
