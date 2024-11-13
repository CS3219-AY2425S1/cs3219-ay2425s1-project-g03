import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../../../_services/authentication.service';
import { User } from '../../../../_models/user.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { mismatchPasswordValidator } from '../../_validators/mismatch-password.validator';
import { invalidPasswordValidator } from '../../_validators/invalid-password.validator';
import { lowercasePasswordValidator } from '../../_validators/lowercase-password';
import { uppercasePasswordValidator } from '../../_validators/uppercase-password';
import { numericPasswordValidator } from '../../_validators/numeric-password';
import { specialPasswordValidator } from '../../_validators/special-password';
import { shortPasswordValidator } from '../../_validators/short-password';
import { weakPasswordValidator } from '../../_validators/weak-password.validator';
import { FormUtilsService } from '../../../../_services/form.utils.service';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-edit-password-dialog',
    standalone: true,
    imports: [
        DialogModule,
        ButtonModule,
        CommonModule,
        ReactiveFormsModule,
        PasswordModule,
        ToastModule,
        DividerModule,
        InputTextModule,
    ],
    templateUrl: './edit-password-dialog.component.html',
    styleUrls: ['../profile.component.css', './edit-password-dialog.component.css'],
})
export class EditPasswordDialogComponent {
    @Input() isVisible = false;
    @Input() user: User | null = null;

    @Output() dialogClose = new EventEmitter<void>();

    protected isProcessingPassword = false;

    constructor(
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        public formUtils: FormUtilsService,
    ) {}

    editPasswordForm: FormGroup = new FormGroup(
        {
            oldPassword: new FormControl('', [Validators.required]),
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
        { msg: 'At least one lowercase', check: () => this.formUtils.passwordHasNoLowercase(this.editPasswordForm) },
        { msg: 'At least one uppercase', check: () => this.formUtils.passwordHasNoUppercase(this.editPasswordForm) },
        { msg: 'At least one numeric', check: () => this.formUtils.passwordHasNoNumeric(this.editPasswordForm) },
        {
            msg: 'At least one special character',
            check: () => this.formUtils.passwordHasNoSpecial(this.editPasswordForm),
        },
        { msg: 'Minimum 8 characters', check: () => this.formUtils.isPasswordShort(this.editPasswordForm) },
    ];

    closeDialog() {
        this.isProcessingPassword = false;
        this.editPasswordForm.reset();
        this.dialogClose.emit();
    }

    onPasswordSubmit() {
        if (!this.editPasswordForm.valid) {
            return;
        }

        this.isProcessingPassword = true;

        this.authenticationService
            .updatePassword(
                this.user!.username,
                this.editPasswordForm.get('oldPassword')?.value,
                this.editPasswordForm.get('password')?.value,
            )
            .subscribe({
                next: () => {
                    // Reset states and forms on success
                    this.closeDialog();

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Password Updated',
                        detail: 'Your password has been updated successfully!',
                    });
                },
                error: error => {
                    this.isProcessingPassword = false;
                    const status = error.cause.status;
                    let errorMessage = 'An unknown error occurred';
                    if (status === 401) {
                        errorMessage = 'Try loging out and log back in. Expired token';
                    } else if (status === 404) {
                        errorMessage = 'Try loging out and log back in. User ID Not Found';
                    } else if (status === 409) {
                        errorMessage = 'Username or Email already exists';
                    } else if (status === 500) {
                        errorMessage = 'Internal Server Error';
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Editing Password Erorr',
                        detail: errorMessage,
                    });
                },
            });
    }
}
