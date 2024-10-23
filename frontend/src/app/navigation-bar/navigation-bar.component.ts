import { Component, OnInit, ViewChild, HostListener } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CommonModule, NgFor } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { AuthenticationService } from '../../_services/authentication.service';
import { User } from '../../_models/user.model';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [MenubarModule, CommonModule, NgFor, MenuModule, ButtonModule],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.css',
})
export class NavigationBarComponent implements OnInit {
    items: MenuItem[] | undefined;
    user: User | null = null;

    constructor(private authService: AuthenticationService) {}

    ngOnInit() {
        this.setMenuItems();
        this.authService.user$.subscribe(() => {
            this.setMenuItems();
            this.user = this.authService.userValue as User;
        });
    }

    @ViewChild('menu') menu: Menu | undefined;
    @HostListener('window:scroll', [])
    hideMenuOnScroll() {
        if (this.menu && this.menu.overlayVisible) {
            this.menu.hide();
        }

        // This makes hiding instant
        const overlay = document.querySelector('.p-menu-overlay');
        if (overlay) {
            (overlay as HTMLElement).style.display = 'none';
        }
    }

    setMenuItems() {
        if (this.authService.isLoggedIn) {
            this.items = [
                {
                    label: 'Find Match',
                    icon: 'pi pi-users',
                    routerLink: '/matching',
                    class: 'p-submenu-list',
                },
                {
                    label: 'View Questions',
                    icon: 'pi pi-file',
                    routerLink: '/questions',
                    class: 'p-submenu-list',
                },
                {
                    label: 'View Profile',
                    icon: 'pi pi-user',
                    // routerLink: '',
                    class: 'p-submenu-list',
                },
                {
                    label: 'View Match History',
                    icon: 'pi pi-trophy',
                    // routerLink: '',
                    class: 'p-submenu-list',
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-sign-out',
                    class: 'p-submenu-list',
                    command: () => {
                        this.authService.logout();
                        this.user = null;
                    },
                },
            ];
        }
    }
}
