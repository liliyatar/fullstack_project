import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { User } from '../interfaces';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    public token: string;
    constructor(private http: HttpClient) {

    }

    public register(user: User): Observable<User> {
        return this.http.post<User>('api/auth/register', user);
    }

    public login(user: User): Observable<{token: string}> {
        return this.http.post<{token: string}>('/api/auth/login', user)
            .pipe(
                tap(({token}) => {
                    localStorage.setItem('auth-token', token);
                    this.setToken(token);
                })
            );
    }

    public setToken(token: string) {
        this.token = token;
    }

    public getToken(): string {
        return this.token;
    }

    public isAuthenticated(): boolean {
        return !!this.token;
    }

    public logout() {
        this.setToken(null);
        localStorage.clear();
    }
}
