import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'; // Importation du HttpClient
import { Observable } from 'rxjs'; // Pour gérer les réponses asynchrones

@Injectable({
  providedIn: 'root'
})
export class MouvementService {

  private apiUrl = 'http://127.0.0.1:3003/api/mouvement'; // URL de base pour votre API

  constructor(private http: HttpClient) { }

  // Méthode pour récupérer tous les mouvements
  getAllMouvements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllMouvements`);
  }

  // Méthode pour créer un mouvement
  createMouvement(mouvementData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createMouvement`, mouvementData);
  }

  // Méthode pour supprimer un mouvement
  deleteMouvement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteMouvement/${id}`);
  }

  // Méthode pour mettre à jour un mouvement
  updateMouvement(id: string, mouvementData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateMouvement/${id}`, mouvementData);
  }

  getMouvementById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/getbyid/${id}`);
  }
  
}
