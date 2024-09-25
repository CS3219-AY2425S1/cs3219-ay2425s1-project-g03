import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PASSWORD_WEAK, weakPasswordValidator } from '../_validators/weak-password.validator';
import { mismatchPasswordValidator, PASSWORD_MISMATCH } from '../_validators/mismatch-password.validator';

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
    constructor(private messageService: MessageService) {}

    userForm: FormGroup = new FormGroup(
        {
            username: new FormControl(''),
            email: new FormControl(''),
            password: new FormControl('', [Validators.required, weakPasswordValidator()]),
            confirmPassword: new FormControl(''),
        },
        {
            validators: mismatchPasswordValidator('password', 'confirmPassword'),
        },
    );
    isProcessingRegistration = false;

    get isEmailInvalid(): boolean {
        const emailControl = this.userForm.controls['email'];
        return emailControl.dirty && emailControl.invalid;
    }

    get isPasswordWeak(): boolean {
        const passwordControl = this.userForm.controls['password'];
        return passwordControl.dirty && passwordControl.hasError(PASSWORD_WEAK);
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
            this.showError();
            setTimeout(() => {
                this.isProcessingRegistration = false;
                console.log('Form Submitted', this.userForm);
            }, 3000);
        } else {
            console.log('Invalid form');
        }
    }
}
