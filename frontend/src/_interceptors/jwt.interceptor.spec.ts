import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS, HttpClient } from '@angular/common/http';
import { JwtInterceptor } from './jwt.interceptor';
import { AuthenticationService } from '../_services/authentication.service';
import { environment } from '../environments/environment.development';

describe('JwtInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let mockAuthService: jasmine.SpyObj<AuthenticationService>;

    beforeEach(() => {
        mockAuthService = jasmine.createSpyObj('AuthenticationService', ['userValue'], {
            userValue: { accessToken: 'fake-jwt-token' },
        });

        TestBed.configureTestingModule({
            imports: [HttpClient],
            providers: [
                { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
                { provide: AuthenticationService, useValue: mockAuthService },
                provideHttpClientTesting(),
            ],
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
    });

    afterEach(() => {
        // Check if all Http requests were handled
        httpMock.verify();
    });

    it('should add an Authorization header', () => {
        httpClient.get(`${environment.apiUrl}/user/test`).subscribe();

        const httpRequest = httpMock.expectOne(`${environment.apiUrl}/user/test`);

        expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
        expect(httpRequest.request.headers.get('Authorization')).toBe('Bearer fake-jwt-token');
    });

    it('should not add an Authorization header if the user is not logged in', () => {
        mockAuthService = jasmine.createSpyObj('AuthenticationService', ['userValue'], {
            userValue: {},
        });

        httpClient.get(`${environment.apiUrl}/user/test`).subscribe();

        const httpRequest = httpMock.expectOne(`${environment.apiUrl}/user/test`);

        expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
    });

    it('should not add an Authorization header for non-API URLs', () => {
        httpClient.get('https://example.com/test').subscribe();

        const httpRequest = httpMock.expectOne('https://example.com/test');

        expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();
    });
});
