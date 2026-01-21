import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class ChartService {

  url="http://127.0.0.1:3003/routechart/data"
  constructor(private http:HttpClient) {}
  getChartData(): Observable<any> {
    return this.http.get<any>(this.url);
}
}
