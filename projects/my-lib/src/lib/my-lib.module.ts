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

//import { AppRoutingModule } from './app-routing.module';
//import { AppComponent } from './app.component';
import { WeatherComponent } from './weather/weather.component';
import { WeatherDetailComponent } from './weather/weather-detail/weather-detail.component';
import { TestComponent } from './test/test.component';
import { CitySearchComponent } from './city-search/city-search.component';
import { EnvService } from './services/env/env.service';


@NgModule({
  declarations: [
//    MyLibComponent
    WeatherComponent,
    WeatherDetailComponent,
    TestComponent,
    CitySearchComponent
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
  WeatherComponent,
  WeatherDetailComponent,
  TestComponent,
  CitySearchComponent,
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
 
