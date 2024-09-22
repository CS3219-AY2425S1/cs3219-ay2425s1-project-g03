import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, ToastModule],
    providers: [MessageService],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    constructor(private router: Router, private messageService: MessageService) {}

    user = {
        username: '',
        password: '',
    };

    stateOptions: { label: string; value: string }[] = [
        { label: 'Log In', value: 'login' },
        { label: 'Register', value: 'register' },
    ];
    authState: 'login' | 'register' = 'login';

    isProcessingLogin = false;

    onOptionChange(event: SelectButtonChangeEvent) {
        if (event.value == 'register') {
            this.router.navigate(['/account/register']);
        }
    }

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
