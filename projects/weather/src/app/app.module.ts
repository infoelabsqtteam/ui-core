import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MyLibModule } from '@core/service-lib';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    MyLibModule.forRoot(environment)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
