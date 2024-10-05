import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { filter, map, Observable, of, switchMap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../_environments/environment';
import { UServRes } from '../_models/user.service.response.interface';

@Injectable()
export class AuthGuardService implements CanActivate {
    constructor(
        private authenticationService: AuthenticationService,
        private http: HttpClient,
        private router: Router,
    ) {}

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
                return this.http
                    .get<UServRes>(`${environment.UserServiceApiUrl}/users/${user.id}`, { observe: 'response' })
                    .pipe(
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
