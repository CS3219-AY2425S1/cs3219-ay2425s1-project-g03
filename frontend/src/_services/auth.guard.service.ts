import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { UServRes } from '../_models/user.service.model';
import { ApiService } from './api.service';

@Injectable()
export class AuthGuardService extends ApiService implements CanActivate {
    protected apiPath = 'user';
    constructor(
        private authenticationService: AuthenticationService,
        private http: HttpClient,
        private router: Router,
    ) {
        super();
    }

    canActivate(): Observable<boolean> {
        return this.authenticationService.user$.pipe(
            filter(user => user !== undefined),
            switchMap(user => {
                // switchMap to flatten the observable from http.get
                if (user === null) {
                    // not logged in so redirect to login page with the return url
                    this.router.navigate(['/account/login']);
                    return of(false); // of() to return an observable to be flattened
                }
                // call to user service endpoint '/users/{user_id}' to check user is still valid
                return this.http.get<UServRes>(`${this.apiUrl}/users/${user.id}`, { observe: 'response' }).pipe(
                    map(response => {
                        if (response.status === 200) {
                            return true;
                        }
                        return false;
                    }),
                );
            }),
        );
    }
}
