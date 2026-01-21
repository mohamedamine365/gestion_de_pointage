import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private router: Router) {}

  // Vérifie si l'utilisateur est connecté (ex: via un token)
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token'); // Vérifie si un token est stocké
  }

  // Déconnexion de l'utilisateur
  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}
