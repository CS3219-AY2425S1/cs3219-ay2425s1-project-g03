import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, DividerModule],
    templateUrl: './register.component.html',
    styleUrl: './login.component.css',
})
export class RegisterComponent {
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

    constructor(private router: Router) {}

    onOptionChange(event: SelectButtonChangeEvent) {
        if (event.value == 'login') {
            this.router.navigate(['/account/login']);
        }
    }

    onSubmit() {
        if (this.user.username && this.user.password) {
            this.isProcessingRegistration = true;
            setTimeout(() => {
                this.isProcessingRegistration = false;
                console.log('Form Submitted', this.user);
            }, 3000); 
        } else {
            console.log('Invalid form');
        }
    }
}
