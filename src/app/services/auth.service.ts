import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from '../models/authData.model';
import { Subject } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | undefined;
  private authStatusListener = new Subject<boolean>();

  constructor(private http: HttpClient) { }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http.post("http://localhost:3000/api/user/signup", user)
      .subscribe(response => {
        console.log(response)
      })
  }

  login(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http.post<{token: string}>("http://localhost:3000/api/user/login", user)
      .subscribe(response => {
        const token = response.token;
        this.token = token;
        this.authStatusListener.next(true);
      })
  }

  getToken() {
    return this.token;
  }

  logout() {
    this.token = undefined;
    this.authStatusListener.next(false);
  }
}
