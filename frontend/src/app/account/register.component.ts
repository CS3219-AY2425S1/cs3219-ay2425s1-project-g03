import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

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
    ],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './account.component.css',
})
export class RegisterComponent {
    constructor(private messageService: MessageService) {}
    
    PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

    user = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    };
    isProcessingRegistration = false;

    get hasValidPassword() {
        return this.PASSWORD_REGEX.test(this.user.password);
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Registration Error', detail: 'Missing Details' });
    }

    onSubmit() {
        if (this.user.username && this.user.password) {
            this.isProcessingRegistration = true;
            this.showError();
            setTimeout(() => {
                this.isProcessingRegistration = false;
                console.log('Form Submitted', this.user);
            }, 3000);
        } else {
            console.log('Invalid form');
        }
    }
}
