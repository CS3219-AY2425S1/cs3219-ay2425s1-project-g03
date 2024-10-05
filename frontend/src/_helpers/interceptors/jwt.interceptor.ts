import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../_environments/environment';
import { AuthenticationService } from '../../_services/authentication.service';
import { User } from '../../_models/user.model';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    private currentUser: User | null | undefined;
    constructor(private authenticationService: AuthenticationService) {
        this.authenticationService.user$.subscribe(user => {
            this.currentUser = user;
        });
    }

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const isLoggedIn = this.currentUser?.accessToken;
        const isApiUrl = request.url.startsWith(environment.UserServiceApiUrl);
        if (isLoggedIn && isApiUrl) {
            request = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${this.currentUser!.accessToken}`),
            });
        }
        return next.handle(request);
    }
}
