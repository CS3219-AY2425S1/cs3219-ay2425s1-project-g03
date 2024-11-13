import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { lowercasePasswordValidator } from '../_validators/lowercase-password';
import { uppercasePasswordValidator } from '../_validators/uppercase-password';
import { numericPasswordValidator } from '../_validators/numeric-password';
import { specialPasswordValidator } from '../_validators/special-password';
import { shortPasswordValidator } from '../_validators/short-password';
import { weakPasswordValidator } from '../_validators/weak-password.validator';
import { mismatchPasswordValidator } from '../_validators/mismatch-password.validator';
import { invalidUsernameValidator } from '../_validators/invalid-username.validator';
import { invalidPasswordValidator } from '../_validators/invalid-password.validator';
import { AuthenticationService } from '../../../_services/authentication.service';
import { FormUtilsService } from '../../../_services/form.utils.service';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [
        CommonModule,
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
    styleUrl: '../account.component.css',
})
export class RegisterComponent {
    constructor(
        private messageService: MessageService,
        private authenticationService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        public formUtils: FormUtilsService,
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.userValue) {
            this.router.navigate(['/home']);
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
                weakPasswordValidator(),
            ]),
            confirmPassword: new FormControl('', [Validators.required]),
        },
        {
            validators: mismatchPasswordValidator('password', 'confirmPassword'),
        },
    );

    passwordRequirements = [
        { msg: 'At least one lowercase', check: () => this.formUtils.passwordHasNoLowercase(this.userForm) },
        { msg: 'At least one uppercase', check: () => this.formUtils.passwordHasNoUppercase(this.userForm) },
        { msg: 'At least one numeric', check: () => this.formUtils.passwordHasNoNumeric(this.userForm) },
        { msg: 'At least one special character', check: () => this.formUtils.passwordHasNoSpecial(this.userForm) },
        { msg: 'Minimum 8 characters', check: () => this.formUtils.isPasswordShort(this.userForm) },
    ];

    isProcessingRegistration = false;

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
                        this.router.navigate(['/home']);
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
