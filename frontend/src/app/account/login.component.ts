import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectButtonChangeEvent, SelectButtonModule } from 'primeng/selectbutton';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [FormsModule, InputTextModule, ButtonModule, SelectButtonModule, PasswordModule, DividerModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.css',
})
export class LoginComponent {
    user = {
        username: '',
        password: '',
    };

    stateOptions: { label: string; value: string }[] = [
        { label: 'Login', value: 'login' },
        { label: 'Register', value: 'register' },
    ];
    authState: 'login' | 'register' = 'login';

    isProcessingLogin = false;

    constructor(private router: Router) {}

    onOptionChange(event: SelectButtonChangeEvent) {
        if (event.value == 'register') {
            this.router.navigate(['/account/register']);
        }
    }

    onSubmit() {
        if (this.user.username && this.user.password) {
            this.isProcessingLogin = true;

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
