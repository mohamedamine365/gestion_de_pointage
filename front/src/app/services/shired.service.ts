import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShiredService {
  url = 'http://127.0.0.1:3003/api';
constructor(private http:HttpClient){}
liste(){
  return this.http.get(this.url+"/liste")
}
}