//import { MyLibComponent } from './my-lib.component';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule,ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { EnvService } from './services/env/env.service';


@NgModule({
  declarations: [
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSnackBarModule
  ],
  exports: [
  //  MyLibComponent
  CommonModule,
  BrowserModule,
    HttpClientModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSnackBarModule
  ]
})
export class MyLibModule {
  public static forRoot(environment: any): ModuleWithProviders<MyLibModule> {
        return {
            ngModule: MyLibModule,
            providers: [
                {
                    provide: 'env', // you can also use InjectionToken
                    useValue: environment
                }
            ]
        };
    }
 }
 
