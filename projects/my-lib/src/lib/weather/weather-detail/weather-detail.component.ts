import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Weather } from '../../shared/weather.modal';

@Component({
  selector: 'app-weather-detail',
  templateUrl: './weather-detail.component.html',
  styleUrls: ['./weather-detail.component.scss']
})
export class WeatherDetailComponent implements OnInit {

  @Input() selectedCity: Weather;
  @Output() homeCity = new EventEmitter();

  constructor() { }


  ngOnInit(): void {
  }

  setHome(){
    this.selectedCity.home = true;
    this.homeCity.emit(this.selectedCity);
  }
}
