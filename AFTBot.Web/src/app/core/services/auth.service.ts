import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { LoginRequest, LoginResponse, AdminUser } from '../models/auth.models';
import { ApiResponse } from '../models/chat.models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'aftbot_admin_token';
const USER_KEY = 'aftbot_admin_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly baseUrl = this.resolveBaseUrl();

  readonly currentUser = signal<AdminUser | null>(this.getStoredUser());
  readonly isAuthenticated = signal<boolean>(!!this.getToken());

  private resolveBaseUrl(): string {
    if (typeof window !== 'undefined') {
      if ((window as any).__AFTBOT_API_URL__) {
        return (window as any).__AFTBOT_API_URL__;
      }
      const params = new URLSearchParams(window.location.search);
      const queryApi = params.get('apiUrl') || params.get('api');
      if (queryApi) {
        return queryApi;
      }
    }
    return environment.apiUrl || 'http://localhost:5000/api';
  }

  login(credentials: LoginRequest): Observable<ApiResponse<LoginResponse>> {
    return this.http.post<ApiResponse<LoginResponse>>(`${this.baseUrl}/auth/login`, credentials).pipe(
      tap((res) => {
        if (res.success && res.data) {
          this.setSession(res.data);
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    }
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setSession(authResult: LoginResponse): void {
    if (typeof window === 'undefined') return;

    localStorage.setItem(TOKEN_KEY, authResult.token);
    const user: AdminUser = {
      username: authResult.username,
      displayName: authResult.displayName,
      role: 'Admin'
    };
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    this.currentUser.set(user);
    this.isAuthenticated.set(true);
  }

  private getStoredUser(): AdminUser | null {
    if (typeof window === 'undefined') return null;
    const userJson = localStorage.getItem(USER_KEY);
    if (!userJson) return null;
    try {
      return JSON.parse(userJson) as AdminUser;
    } catch {
      return null;
    }
  }
}
