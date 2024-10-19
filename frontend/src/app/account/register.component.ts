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
import { PASSWORD_LOWERCASE, lowercasePasswordValidator } from './_validators/lowercase-password';
import { PASSWORD_UPPERCASE, uppercasePasswordValidator } from './_validators/uppercase-password';
import { PASSWORD_NUMERIC, numericPasswordValidator } from './_validators/numeric-password';
import { PASSWORD_SPECIAL, specialPasswordValidator } from './_validators/special-password';
import { PASSWORD_SHORT, shortPasswordValidator } from './_validators/short-password';
import { PASSWORD_WEAK, weakPasswordValidator } from './_validators/weak-password.validator';
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
            this.router.navigate(['/matching']);
        }
    }

    userForm: FormGroup = new FormGroup(
        {
            username: new FormControl('', [Validators.required, invalidUsernameValidator()]),
            email: new FormControl('', [Validators.required, Validators.email]),
            password: new FormControl('', [
                Validators.required,
                invalidPasswordValidator(),
                lowercasePasswordValidator(),
                uppercasePasswordValidator(),
                numericPasswordValidator(),
                specialPasswordValidator(),
                shortPasswordValidator(),
                weakPasswordValidator()
            ]),
            confirmPassword: new FormControl('', [Validators.required]),
        },
        {
            validators: mismatchPasswordValidator('password', 'confirmPassword'),
        },
    );
    isProcessingRegistration = false;

    get isUsernameInvalid(): boolean {
        const usernameControl = this.userForm.controls['username'];
        return usernameControl.dirty && usernameControl.hasError(USERNAME_INVALID);
    }

    get isEmailInvalid(): boolean {
        const emailControl = this.userForm.controls['email'];
        return emailControl.dirty && emailControl.invalid;
    }

    get isPasswordLowercase(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.pristine || passwordControl.hasError(PASSWORD_LOWERCASE);
    }

    get isPasswordUppercase(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.pristine || passwordControl.hasError(PASSWORD_UPPERCASE);
    }

    get isPasswordNumeric(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.pristine || passwordControl.hasError(PASSWORD_NUMERIC);
    }

    get isPasswordSpecial(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.pristine || passwordControl.hasError(PASSWORD_SPECIAL);
    }

    get isPasswordShort(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.pristine || passwordControl.hasError(PASSWORD_SHORT);
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
                        this.router.navigate(['/matching']);
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
                        this.messageService.add({
                            severity: 'error',
                            summary: 'Registration Error',
                            detail: errorMessage,
                        });
                    },
                });
        } else {
            console.log('Invalid form');
        }
    }
}
