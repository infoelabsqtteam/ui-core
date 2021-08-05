import { Component, OnInit } from '@angular/core';
import { WeatherService } from '../shared/weather.service';
import { Weather } from '../shared/weather.modal';
import { WeatherOwm } from '../shared/weather-own.modal';

@Component({
  selector: 'app-weather',
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.scss']
})
export class WeatherComponent implements OnInit {


  //weather: Weather[];
  //selectedCity: Weather;

  weather: WeatherOwm[];
  selectedCity: Weather;

  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
    this.getWeather();
    //this.getWeatherPromise();

    //this.weatherService.getHomeCity().subscribe( (res) => console.log(res));
  }

  getWeather(){
    //this.weather = this.weatherService.getWeather();
    //this.weatherService.getWeather().subscribe(
    //  (data) => this.weather = data
    //);
    this.weatherService.getWeather().subscribe(
      (data: any) => this.weather = data.list
    );
  }

  getWeatherPromise(){
      //this.weatherService.getWeatherPromise().then( (data) => {
      //  this.weather = data;
      //}  ).catch( (error) => { console.log("error occured")});
  }

  setHomeCity(event : Weather){
    console.log(event);
  }

}
