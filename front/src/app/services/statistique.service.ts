import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StatistiqueService {
  private apiUrl = 'http://localhost:3003/api/statistique';

  constructor(private http: HttpClient) { }

  getAccessStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/access-stats`);
  }

  getTotalUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/total-users`);
  }

  getMouvementStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/mouvement-stats`);
  }

  getUserPrivilegeStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/user-privilege-stats`);
  }
  getTopUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/top-users`);
  }
}