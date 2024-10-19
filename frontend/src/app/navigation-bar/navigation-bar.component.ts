import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CommonModule, NgFor } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { AuthenticationService } from '../../_services/authentication.service';
import { User } from '../../_models/user.model';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [MenubarModule, CommonModule, NgFor],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.css',
})
export class NavigationBarComponent implements OnInit {
    items: MenuItem[] | undefined;

    constructor(
        private router: Router,
        private authService: AuthenticationService,
    ) {}

    ngOnInit() {
        this.setMenuItems();
        this.authService.user$.subscribe(() => this.setMenuItems());
    }

    setMenuItems() {
        if (this.authService.isLoggedIn) {
            const user = this.authService.userValue as User;
            this.items = [
                {
                    label: user.username,
                    icon: 'pi pi-user',
                    // route: '/profile',
                    style: { 'margin-left': 'auto' },
                    items: [
                        {
                            label: 'View Profile',
                            icon: 'pi pi-user',
                            // route: '',
                            class: 'p-submenu-list',
                        },
                        {
                            label: 'View Match History',
                            icon: 'pi pi-trophy',
                            // route: '',
                            class: 'p-submenu-list',
                        },
                        {
                            label: 'Logout',
                            icon: 'pi pi-sign-out',
                            class: 'p-submenu-list',
                            command: () => this.authService.logout(),
                        },
                    ],
                },
            ];
        } else {
            this.items = [
                {
                    label: 'Login',
                    icon: 'pi pi-sign-in',
                    route: 'account/login',
                    style: { 'margin-left': 'auto' },
                },
                {
                    label: 'Sign Up',
                    icon: 'pi pi-pen-to-square',
                    route: '/account/register',
                    class: 'border',
                },
            ];
        }
    }
}
