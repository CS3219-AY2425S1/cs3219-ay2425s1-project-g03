import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink, FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, ToastModule],
    providers: [MessageService, AuthenticationService],
    templateUrl: './login.component.html',
    styleUrl: './account.component.css',
})
export class LoginComponent {
    constructor(
        private messageService: MessageService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        //redirect to home if already logged in
        if (this.authenticationService.userValue) {
            this.router.navigate(['/']);
        }
    }

    userForm = {
        username: '',
        password: '',
    };

    isProcessingLogin = false;

    onSubmit() {
        if (this.userForm.username && this.userForm.password) {
            this.isProcessingLogin = true;

            // authenticationService returns an observable that we can subscribe to
            this.authenticationService
                .login(this.userForm.username, this.userForm.password)
                .pipe()
                .subscribe({
                    next: () => {
                        // get return url from route parameters or default to '/'
                        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                        this.router.navigate([returnUrl]);
                    },
                    error: error => {
                        this.isProcessingLogin = false;
                        const status = error.cause.status;
                        let errorMessage = 'An unknown error occurred';
                        if (status === 400) {
                            errorMessage = 'Missing Fields';
                        } else if (status === 401) {
                            errorMessage = 'Invalid username or password';
                        } else if (status === 500) {
                            errorMessage = 'Internal Server Error';
                        }
                        this.messageService.add({ severity: 'error', summary: 'Log In Error', detail: errorMessage });
                    },
                });
        } else {
            console.log('Invalid form');
        }
    }
}
