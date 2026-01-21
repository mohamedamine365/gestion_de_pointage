import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EtablissementService {

  private apiUrl = 'http://127.0.0.1:3003/api/etablissement';  // URL de l'API

  constructor(private http: HttpClient) { }

  // Créer un nouvel établissement
  createEtablissement(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/createEtablissement`, data);
  }

  // Récupérer tous les établissements
  getAllEtablissements(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAllEtablissements`);
  }

  // Supprimer un établissement par ID
  deleteEtablissement(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteEtablissement/${id}`);
  }

  // Mettre à jour un établissement par ID
  updateEtablissement(id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/updateEtablissement/${id}`, data);
  }
}
