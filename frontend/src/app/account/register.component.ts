import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, DividerModule, ToastModule],
    providers: [MessageService],
    templateUrl: './register.component.html',
    styleUrl: './login.component.css',
})
export class RegisterComponent {
    constructor(private router: Router, private messageService: MessageService) {}

    user = {
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    };

    stateOptions: { label: string; value: string }[] = [
        { label: 'Login', value: 'login' },
        { label: 'Register', value: 'register' },
    ];
    authState: 'login' | 'register' = 'register';

    isProcessingRegistration = false;

    onOptionChange(event: SelectButtonChangeEvent) {
        if (event.value == 'login') {
            this.router.navigate(['/account/login']);
        }
    }

    showError() {
        this.messageService.add({ severity: 'error', summary: 'Registration Error', detail: 'Missing Details' })
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
