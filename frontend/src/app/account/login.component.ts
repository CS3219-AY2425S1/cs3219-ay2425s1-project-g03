import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [RouterLink, FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, ToastModule],
    providers: [MessageService],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    constructor(private messageService: MessageService) {}

    user = {
        username: '',
        password: '',
    };

    isProcessingLogin = false;

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Log In Error', detail: 'Missing Details' })
    }

    onSubmit() {
        if (this.user.username && this.user.password) {
            this.isProcessingLogin = true;
            this.showError();
            // Simulate API request
            setTimeout(() => {
                this.isProcessingLogin = false;
                console.log('Form Submitted', this.user);
            }, 3000); 
        } else {
            console.log('Invalid form');
        }
    }
}
