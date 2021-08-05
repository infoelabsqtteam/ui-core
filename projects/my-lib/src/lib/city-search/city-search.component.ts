import { Component, OnInit } from '@angular/core';
import { WeatherOwm } from '../shared/weather-own.modal';
import { WeatherService } from '../shared/weather.service';

@Component({
  selector: 'app-city-search',
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.scss']
})
export class CitySearchComponent implements OnInit {

  cityName: string;
  city: WeatherOwm;


  constructor(private weatherService: WeatherService) { }

  ngOnInit(): void {
  }

  getWeatherByCity(){
    this.weatherService.getWeatherByCity(this.cityName)
      .subscribe( (data: any) => {
        this.city = data;
      });
  }

}
