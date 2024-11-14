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
import { invalidUsernameValidator } from '../../_validators/invalid-username.validator';
import { FormUtilsService } from '../../../../_services/form.utils.service';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-edit-profile-dialog',
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
    templateUrl: './edit-profile-dialog.component.html',
    styleUrls: ['../profile.component.css', './edit-profile-dialog.component.css'],
})
export class EditProfileDialogComponent {
    @Input() isVisible = false;
    @Input() user: User | null = null;

    @Output() dialogClose = new EventEmitter<void>();

    protected isProcessingEdit = false;

    constructor(
        private authenticationService: AuthenticationService,
        private messageService: MessageService,
        public formUtils: FormUtilsService,
    ) {}

    protected editProfileForm: FormGroup = new FormGroup({
        username: new FormControl('', [Validators.required, invalidUsernameValidator()]),
        email: new FormControl('', [Validators.required, Validators.email]),
        password: new FormControl('', [Validators.required]),
    });

    onDialogShow() {
        this.editProfileForm.get('username')?.setValue(this.user?.username ?? '');
        this.editProfileForm.get('email')?.setValue(this.user?.email ?? '');
    }

    closeDialog() {
        this.isProcessingEdit = false;
        this.editProfileForm.reset();
        this.dialogClose.emit();
    }

    onEditSubmit() {
        if (!this.editProfileForm.valid) {
            return;
        }

        this.isProcessingEdit = true;

        this.authenticationService
            .updateUsernameAndEmail(
                this.editProfileForm.get('username')?.value,
                this.editProfileForm.get('email')?.value,
                this.editProfileForm.get('password')?.value,
            )
            .subscribe({
                next: () => {
                    this.closeDialog();

                    this.messageService.add({
                        severity: 'success',
                        summary: 'Profile Updated',
                        detail: 'Your profile has been updated successfully!',
                    });
                },
                error: error => {
                    this.isProcessingEdit = false;
                    const status = error.cause.status;
                    let errorMessage = 'An unknown error occurred';
                    if (status === 401) {
                        errorMessage = 'Your session has expired. Please log out and log back in.';
                    } else if (status === 409) {
                        errorMessage = 'The username or email already exists.';
                    }
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Editing Profile Erorr',
                        detail: errorMessage,
                    });
                },
            });
    }
}
