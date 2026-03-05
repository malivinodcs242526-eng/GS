import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient, private router: Router) {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        const token = localStorage.getItem('gs_token');
        const user = localStorage.getItem('gs_user');
        if (token && user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    login(credentials: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap((res) => {
                localStorage.setItem('gs_token', res.token);
                localStorage.setItem('gs_user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
            tap((res) => {
                localStorage.setItem('gs_token', res.token);
                localStorage.setItem('gs_user', JSON.stringify(res.user));
                this.currentUserSubject.next(res.user);
            })
        );
    }

    logout(): void {
        localStorage.removeItem('gs_token');
        localStorage.removeItem('gs_user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    getToken(): string | null {
        return localStorage.getItem('gs_token');
    }

    get currentUser(): User | null {
        return this.currentUserSubject.value;
    }

    get isLoggedIn(): boolean {
        return !!this.getToken() && !!this.currentUser;
    }

    get isAdmin(): boolean {
        return this.currentUser?.role === 'admin';
    }

    get isCustomer(): boolean {
        return this.currentUser?.role === 'customer';
    }

    createAdmin(): Observable<any> {
        return this.http.post(`${this.apiUrl}/create-admin`, {});
    }
}
