import { CompileShallowModuleMetadata } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { interval } from 'rxjs';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  num: number;

  constructor() { }

  ngOnInit(): void {
    this.obs();
    this.prom();
  }

  obs(){
    const obserable = interval(1000);

    obserable.subscribe(
      (num: number) => {
        this.num = num;
      }
    )
  }

  prom(){
    const promise = new Promise( (resolve, reject) => {
      setTimeout( () => {
        resolve('ok');
      }, 3000);
    } );

    promise.then(() => {
      console.log('promise resolved');
    }).catch( () => {
      console.log('promise rejected');
    });

  }

}
