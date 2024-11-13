import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { AuthenticationService } from '../../../_services/authentication.service';
import { User } from '../../../_models/user.model';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FormUtilsService } from '../../../_services/form.utils.service';
import { EditProfileDialogComponent } from './edit-profile-dialog/edit-profile-dialog.component';
import { EditPasswordDialogComponent } from './edit-password-dialog/edit-password-dialog.component';

@Component({
    standalone: true,
    imports: [
        EditProfileDialogComponent,
        EditPasswordDialogComponent,
        CommonModule,
        ButtonModule,
        PasswordModule,
        ToastModule,
        DividerModule,
        InputTextModule,
        EditProfileDialogComponent,
    ],
    providers: [MessageService],
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
    user: User | null = null;
    showEditProfile = false;
    showEditPassword = false;

    constructor(
        private authenticationService: AuthenticationService,
        public formUtils: FormUtilsService,
    ) {}

    ngOnInit() {
        this.authenticationService.user$.subscribe(() => {
            this.user = this.authenticationService.userValue as User;
        });
    }

    onUpdateProfile() {
        this.showEditProfile = true;
        this.showEditPassword = false;
    }

    onUpdatePassword() {
        this.showEditProfile = false;
        this.showEditPassword = true;
    }

    onEditProfileDialogClose() {
        this.showEditProfile = false;
    }

    onEditPasswordDialogClose() {
        this.showEditPassword = false;
    }
}
