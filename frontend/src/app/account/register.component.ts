import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PASSWORD_WEAK, STRONG_PASSWORD_REGEX, weakPasswordValidator } from './_validators/weak-password.validator';
import { mismatchPasswordValidator, PASSWORD_MISMATCH } from './_validators/mismatch-password.validator';
import { invalidUsernameValidator, USERNAME_INVALID } from './_validators/invalid-username.validator';
import { invalidPasswordValidator, PASSWORD_INVALID } from './_validators/invalid-password.validator';
import { AuthenticationService } from '../../_services/authentication.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        RouterLink,
        FormsModule,
        InputTextModule,
        ButtonModule,
        SelectButtonModule,
        PasswordModule,
        DividerModule,
        ToastModule,
        ReactiveFormsModule,
    ],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './account.component.css',
})
export class RegisterComponent {
    constructor(
        private messageService: MessageService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.userValue) {
            this.router.navigate(['/']);
        }
    }

    userForm: FormGroup = new FormGroup(
        {
            username: new FormControl('', [Validators.required, invalidUsernameValidator()]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [Validators.required, weakPasswordValidator(), invalidPasswordValidator()]),
            confirmPassword: new FormControl('', [Validators.required]),
        },
        {
            validators: mismatchPasswordValidator('password', 'confirmPassword'),
        },
    );
    isProcessingRegistration = false;

    strongPasswordRegex = STRONG_PASSWORD_REGEX.source;

    get isUsernameInvalid(): boolean {
        const usernameControl = this.userForm.controls['username'];
        return usernameControl.dirty && usernameControl.hasError(USERNAME_INVALID);
    }

    get isEmailInvalid(): boolean {
        const emailControl = this.userForm.controls['email'];
        return emailControl.dirty && emailControl.invalid;
    }

    get isPasswordWeak(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.dirty && passwordControl.hasError(PASSWORD_WEAK);
    }

    get isPasswordInvalid(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.dirty && passwordControl.hasError(PASSWORD_INVALID);
    }

    get hasPasswordMismatch(): boolean {
        const passwordControl = this.userForm.controls['password'];
        const confirmPasswordControl = this.userForm.controls['confirmPassword'];
        return passwordControl.valid && confirmPasswordControl.dirty && this.userForm.hasError(PASSWORD_MISMATCH);
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Registration Error', detail: 'Missing Details' });
    }

    onSubmit() {
        if (this.userForm.valid) {
            this.isProcessingRegistration = true;

            this.authenticationService
                .createAccount(this.userForm.value.username, this.userForm.value.email, this.userForm.value.password)
                .pipe()
                .subscribe({
                    next: () => {
                        // get return url from route parameters or default to '/'
                        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
                        this.router.navigate([returnUrl]);
                    },
                    // error handling for registration because we assume there will be no errors with auto login
                    error: error => {
                        this.isProcessingRegistration = false;
                        const status = error.cause.status;
                        let errorMessage = 'An unknown error occurred';
                        if (status === 400) {
                            errorMessage = 'Missing Fields';
                        } else if (status === 409) {
                            errorMessage = 'Username or Password already exists';
                        } else if (status === 500) {
                            errorMessage = 'Database Server Error';
                        }
                        this.messageService.add({ severity: 'error', summary: 'Log In Error', detail: errorMessage });
                    },
                });
        } else {
            console.log('Invalid form');
        }
    }
}
