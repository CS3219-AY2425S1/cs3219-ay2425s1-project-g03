import { Component, OnInit, ViewChild, HostListener, Renderer2 } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { MenubarModule } from 'primeng/menubar';
import { AuthenticationService } from '../../_services/authentication.service';
import { User } from '../../_models/user.model';
import { Menu, MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [MenubarModule, CommonModule, MenuModule, ButtonModule],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.css',
})
export class NavigationBarComponent implements OnInit {
    @ViewChild('menu') menu!: Menu;
    items: MenuItem[] | undefined;
    user: User | null = null;

    constructor(
        private authService: AuthenticationService,
        private renderer: Renderer2,
    ) {}

    ngOnInit() {
        this.setMenuItems();
        this.authService.user$.subscribe(() => {
            this.setMenuItems();
            this.user = this.authService.userValue as User;
        });
    }

    @HostListener('window:scroll', [])
    hideMenuOnScroll() {
        if (this.menu && this.menu.overlayVisible) {
            this.menu.hide();
            // This makes hiding instant
            this.renderer.setStyle(this.menu.container, 'display', 'none');
        }
    }

    setMenuItems() {
        if (this.authService.isLoggedIn) {
            this.items = [
                {
                    label: 'Home',
                    icon: 'pi pi-home',
                    routerLink: '/home',
                    class: 'p-submenu-list',
                },
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
                    label: 'Match History',
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
