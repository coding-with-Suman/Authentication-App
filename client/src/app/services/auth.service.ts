
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { LoginRequest } from '../interfaces/login-request';
import { Observable, map } from 'rxjs';
import { AuthResponse } from '../interfaces/auth-response';
import { HttpClient } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { RegisterRequest } from '../interfaces/register-request';
import { UserProfile } from '../interfaces/user-profile';
import { ResetPasswordRequest } from '../interfaces/reset-password-request';
import { ChangePassword } from '../interfaces/change-password';
import { RefreshToken } from '../interfaces/refresh-token';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  apiUrl: string = environment.apiUrl;
  private userKey : string = 'user';

  constructor(private http: HttpClient) {}

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}account/login`, data)
      .pipe(
        map((response) => {
          if (response.isSuccess) {
            localStorage.setItem(this.userKey, JSON.stringify(response));
          }
          return response;
        })
      );
  };

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}account/register`, data);
         
  };

  getUserProfile = () : Observable<UserProfile> => {
    return this.http.get<UserProfile>(`${this.apiUrl}Account/Details`);
  }

  getUserDetail = () => {
    const token = this.getToken();
    if (!token) return null;
    const decodedToken: any = jwtDecode(token);
    const userDetail = {
      id: decodedToken.nameid,
      fullName: decodedToken.name,
      email: decodedToken.email,
      roles: decodedToken.role || [],
    };

    return userDetail;
  };

  getUsers = () : Observable<UserProfile[]> => {
    return this.http.get<UserProfile[]>(`${this.apiUrl}Account/Users`);
  }

  getRoles = () : string[] | null => {
    const token = this.getToken();

    if(!token) return null;

    const decodedToken : any = jwtDecode(token);

    return decodedToken.role || null ;
  }

  forgotPassword = (email : string) : Observable<AuthResponse> => {
    return this.http.post<AuthResponse>(`${this.apiUrl}Account/ForgotPassword`, {email});
  }

  resetPassword = (data : ResetPasswordRequest) : Observable<AuthResponse> => {
    return this.http.post<AuthResponse>(`${this.apiUrl}Account/ResetPassword`, data);
  }

  changePassword = (data : ChangePassword) : Observable<AuthResponse> => {
    return this.http.post<AuthResponse>(`${this.apiUrl}Account/ChangePassword`, data);
  }

  refreshToken = (data : RefreshToken) : Observable<AuthResponse> => {
    return this.http.post<AuthResponse>(`${this.apiUrl}Account/RefreshToken`, data);
  }

  isLoggedIn = (): boolean => {
    const token = this.getToken();
    if (!token) return false;
    return !this.isTokenExpired();
  };

  private isTokenExpired() {
    const token = this.getToken();
    if (!token) return true;
    const decoded = jwtDecode(token);
    const isTokenExpired = Date.now() >= decoded['exp']! * 1000;
    // if (isTokenExpired) this.logout();
    return isTokenExpired;
  }

  logout = (): void => {
    localStorage.removeItem(this.tokenKey);
  };

  getToken = (): string | null => {
    const user = localStorage.getItem(this.userKey);
    if(!user) return null;
    const userDetail : AuthResponse = JSON.parse(user);
    return userDetail.token;
  }

  getRefreshToken = (): string | null => {
    const user = localStorage.getItem(this.userKey);
    if(!user) return null;
    const userDetail : AuthResponse = JSON.parse(user);
    return userDetail.refreshToken;
  }
    
}
