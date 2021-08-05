import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { WEATHER } from './mock-weather';
import { Weather } from './weather.modal';
import { of, Observable } from 'rxjs';
import {catchError, map, tap} from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class WeatherService {

  apiKey = 'e95e859d0eb983230be0df63a12f0196';

  baseUri = 'http://api.openweathermap.org/data/2.5/find?&cnt=10&unit=metric&appid=';

  lat = 51.5285582;
  lon = -0.2416808;



  constructor(private http: HttpClient) { }

  getWeather(){
    //return WEATHER;
    //return of(WEATHER);

    let uri = this.baseUri + this.apiKey + '&lat=' + this.lat + '&lon=' + this.lon;

    return this.http.get(uri);
  }

  getWeatherByCity(city: string){
    let uri = 'http://api.openweathermap.org/data/2.5/weather?q=' + city + '&appid=' + this.apiKey;

    return this.http.get(uri);
  }

  getWeatherPromise(){
    const weatherProm = of(WEATHER).toPromise();

    return weatherProm;
  }

  getHomeCity(){
    return of(WEATHER).pipe(
      //map( arr => arr.filter( city => city.home === true))
      tap(res => res.forEach((x) => {
        console.log(`tap : ${x.id}, city : ${x.city}`)
      })), catchError(this.handleError(`getHomeCity() failed, city=${WEATHER[0].city}`))
    );
  }

  addWeather(weather: Weather): Observable<string> {
    weather.id = WEATHER.length + 1;

    WEATHER.push(weather);

    return of(weather.city + ' added');
  }

  deleteWeather(weather: Weather): Observable<string> {
    if (WEATHER.includes(weather)) {
      WEATHER.forEach((city, i) => {
        if (city === weather) {
          WEATHER.splice(i, 1);
        }
      });
    }

    return of(weather.city + ' deleted');
  }
  private handleError<T>(operation = 'operation', result?: T){
    return (error: any) : Observable<T> => {
      console.error(error);
      console.log(`${operation} failed: ${error.message}`);
      return of(result as T);
    }
  }

  setWeather(weather : Weather){
    WEATHER.push(weather);
  }

}
