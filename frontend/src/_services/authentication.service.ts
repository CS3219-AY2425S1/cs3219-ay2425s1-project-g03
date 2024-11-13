// Modified from https://jasonwatmore.com/post/2022/11/15/angular-14-jwt-authentication-example-tutorial#login-component-ts
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs/operators';
import { UServRes } from '../_models/user.service.model';
import { User } from '../_models/user.model';
import { ApiService } from './api.service';
import { ToastService } from './toast.service';

@Injectable({ providedIn: 'root' })
export class AuthenticationService extends ApiService {
    protected apiPath = 'user';

    private userSubject: BehaviorSubject<User | null>;
    public user$: Observable<User | null>;

    constructor(
        private router: Router,
        private http: HttpClient,
        private toastService: ToastService,
    ) {
        super();
        const userData = localStorage.getItem('user');
        const user: User | null = userData ? JSON.parse(userData) : null;
        this.userSubject = new BehaviorSubject(user);
        this.user$ = this.userSubject.asObservable();
    }

    public get userValue() {
        return this.userSubject.value;
    }

    public get isLoggedIn(): boolean {
        return !!this.userSubject.value;
    }

    login(username: string, password: string) {
        return this.http
            .post<UServRes>(
                `${this.apiUrl}/auth/login`,
                { username: username, password: password },
                { observe: 'response' },
            )
            .pipe(
                map(response => {
                    // store user details and jwt token in local storage to keep user logged in between page refreshes
                    let user = null;
                    if (response.body) {
                        const { id, username, email, accessToken, isAdmin, createdAt } = response.body.data;
                        user = { id, username, email, accessToken, isAdmin, createdAt };

                        // console.log('JWT Token:', accessToken);
                    }
                    localStorage.setItem('user', JSON.stringify(user));
                    this.userSubject.next(user);
                    this.startTokenExpiryCheck();

                    return user;
                }),
            );
    }

    createAccount(username: string, email: string, password: string) {
        return this.http
            .post<UServRes>(
                `${this.apiUrl}/users`,
                { username: username, email: email, password: password },
                { observe: 'response' },
            )
            .pipe(switchMap(() => this.login(username, password))); // auto login after registration
    }

    logout() {
        // remove user from local storage to log user out
        localStorage.removeItem('user');
        this.userSubject.next(null);
        this.router.navigate(['/account/login']);
    }

    // get user details from user service for authentication
    getUserDetails() {
        return this.http.get<UServRes>(`${this.apiUrl}/users/${this.userValue?.id}`, { observe: 'response' }).pipe(
            map(response => {
                if (response.status === 200) {
                    let user: User = {} as User;
                    if (response.body) {
                        const body: UServRes = response.body;
                        const data = body.data;
                        user = {
                            id: data.id,
                            username: data.username,
                            email: data.email,
                            accessToken: data.accessToken,
                            isAdmin: data.isAdmin,
                            createdAt: data.createdAt,
                        };
                    }
                    return user;
                }
                return null;
            }),
        );
    }

    displaySessionExpiryWarning(): void {
        this.toastService.showToast('Your session will expire in less than 5 minutes. Please log in again.');
    }

    public startTokenExpiryCheck(): void {
        const tokenExpirationTime = this.getTokenExpiration();
        if (!tokenExpirationTime) {
            this.logout();
            return;
        }

        const oneMinute = 60 * 1000;
        const timeLeft = tokenExpirationTime - Date.now();
        if (timeLeft > 5 * oneMinute) {
            timer(timeLeft - 5 * oneMinute)
                .pipe(takeUntilDestroyed())
                .subscribe(() => this.displaySessionExpiryWarning());
        } else {
            this.displaySessionExpiryWarning();
        }

        timer(timeLeft)
            .pipe(takeUntilDestroyed())
            .subscribe(() => {
                alert('Your session has expired. Please log in again.');
                this.logout();
            });
    }

    private getTokenExpiration() {
        const user = this.userValue;
        if (!user || !user.accessToken) return null;

        const tokenPayload = JSON.parse(atob(user.accessToken.split('.')[1]));
        return tokenPayload.exp ? tokenPayload.exp * 1000 : null;
    }
}
