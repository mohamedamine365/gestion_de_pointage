import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  url = 'http://127.0.0.1:3003/api';
constructor(private http:HttpClient){}
liste(){
  this.http.get(this.url+"/liste")
}

}
