import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { AuthenticationService } from '../_services/authentication.service';
import { MessageService } from 'primeng/api';
@Component({
    selector: 'app-root',
    standalone: true,
    imports: [NavigationBarComponent, RouterOutlet, ButtonModule, PasswordModule, ToastModule],
    providers: [MessageService],
    templateUrl: './app.component.html',
    styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
    title = 'frontend';

    constructor(private authService: AuthenticationService) {}
    ngOnInit() {
        this.authService.startTokenExpiryCheck();
    }
}
