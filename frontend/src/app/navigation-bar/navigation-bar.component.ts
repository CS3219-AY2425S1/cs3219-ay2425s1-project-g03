import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { CommonModule, NgFor } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [MenubarModule, CommonModule, NgFor],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.css',
})
export class NavigationBarComponent implements OnInit {
    items: MenuItem[] | undefined;

    isLoggedIn = true;

    dummyUserName = 'User_1';

    constructor(private router: Router) {}

    ngOnInit() {
        // TODO: Subscribe to auth service to know if user is logged in.
        //       Call setMenuItems() inside to ensure menu items are dynamically
        //       updated according to login status.

        this.setMenuItems();
    }

    setMenuItems() {
        if (this.isLoggedIn) {
            this.items = [
                {
                    label: this.dummyUserName,
                    icon: 'pi pi-user',
                    route: '/profile',
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
                            route: 'account/login',
                            class: 'p-submenu-list',
                            command: () => this.logout(),
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

    navigateHome() {
        this.router.navigate(['/account/login']);
    }

    logout() {
        console.log('log out');
    }
}
