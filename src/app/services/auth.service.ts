import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthData } from '../models/authData.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../environments/environments';

const BACKEND_URL = environment.apiUrl + '/user/';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private token: string | undefined;
  private authStatusListener = new Subject<boolean>();
  private tokenTimer: any;
  private isAuthenticated = false;
  private userId: string | undefined;

  constructor(private http: HttpClient, private router: Router) { }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  createUser(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http.post( BACKEND_URL +"/signup", user).subscribe(response => {
      this.router.navigate(["/"]);
    }, error => {
      this.authStatusListener.next(false);
    })
  }

  login(email: string, password: string) {
    const user: AuthData = { email: email, password: password };
    this.http.post<{ token: string, expiresIn: number, userId: string }>(BACKEND_URL +"/login", user)
      .subscribe(response => {
        const expiresInDuration = response.expiresIn;
        const token = response.token;
        this.userId = response.userId;
        if (token) {
          this.token = token;
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          const now = new Date();
          const expirationDate = new Date(now.getTime() + expiresInDuration * 1000);
          this.saveAuthData(token, expirationDate, this.userId);
          this.setAuthTimer(expiresInDuration);
          this.router.navigate(['/']);
        }
      }, error => {
        this.authStatusListener.next(false);
      })
  }
  getUserId() {
    return this.userId;
  }

  getToken() {
    return this.token;
  }

  logout() {
    this.token = undefined;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/login']);
    this.userId = undefined;
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem("token", token);
    localStorage.setItem("expiration", expirationDate.toISOString());
    localStorage.setItem("userId", userId);
  }

  private clearAuthData() {
    localStorage.removeItem("token");
    localStorage.removeItem("expiration");
    localStorage.removeItem("userId");
  }

  private getAuthData() {
    const token = localStorage.getItem("token");
    const expirationDate = localStorage.getItem("expiration");
    const userId = localStorage.getItem("userId");
    if (!token || !expirationDate || !userId) {
      return;
    }
    return {
      token: token,
      expirationDate: new Date(expirationDate),
      userId: userId
    }
  }

  autoAuthUser() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      this.isAuthenticated = false;
      this.authStatusListener.next(false);
      return;
    }
    const now = new Date();
    const expiresIn = authInformation.expirationDate.getTime() - now.getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.userId = authInformation.userId;
    } else {
      this.isAuthenticated = false;
      this.authStatusListener.next(false);
      this.clearAuthData();
    }
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }
}
