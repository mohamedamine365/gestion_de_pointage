import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AthService {
  url = 'http://127.0.0.1:3003/api/users/';  // Adjust the URL to match your backend routes

  constructor(private http: HttpClient) { }

  // Login method to authenticate the user
  login(data: any) {
    return this.http.post(this.url + 'signin', data);
  }

  // Register method to create a new user
  register(data: any) {
    return this.http.post(this.url + 'createUser', data); // Adjust the URL to match createUser route
  }

  // Create a user (using the 'createUser' Express route)
  createUser(data: any) {
    return this.http.post(this.url + 'createUser', data); // Adjust the URL to match createUser route
  }

  // Delete a user by ID (using the 'deleteUser' Express route)
  deleteUser(userId: string) {
    return this.http.delete(this.url + 'deleteUser/' + userId); // Adjust URL to match deleteUser route
  }

  // Update a user by ID (using the 'updateUser' Express route)
  updateUser(userId: string, data: any) {
    return this.http.put(this.url + 'updateUser/' + userId, data); // Adjust URL to match updateUser route
  }

    // Récupérer l'utilisateur par ID
    getUserById(id: string) {
      return this.http.get(this.url + 'getUserById/' + id);
    }

    getAllusers(){
      return this.http.get(this.url + 'getAllUsers');
    }

    sendEmail(emailData: any): Observable<any> {
      return this.http.post(`http://127.0.0.1:3003/api/email/send`, emailData);
    }
    recupererUser(userId: string): Observable<any> {
      return this.http.put(this.url + 'recupererUser/'+ `${userId}`, {});
    }

  // Check if the user is logged in (token presence in localStorage)
  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    console.log('Raw token from storage:', token);
    return token !== '' && token !== 'undefined' && token !== null;
  }

  // Get user data from the token by decoding it
  getUserDataFromToken() {
    let token = localStorage.getItem('token');
    if (token) {
      let codedData = token.split('.')[1];
      let decodedData = window.atob(codedData);
      return JSON.parse(decodedData);
    }
    return null; // Return null if no token is found
  }
}
