import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthenticationService } from '../_services/authentication.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authenticationService: AuthenticationService) {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const currentUser = this.authenticationService.userValue;
        if (currentUser) {
            const accessToken = currentUser.accessToken;
            request = request.clone({
                headers: request.headers.set('Authorization', `Bearer ${accessToken}`),
            });
        }
        return next.handle(request);
    }
}
