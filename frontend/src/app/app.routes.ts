import { Routes } from '@angular/router';
import { AccountComponent } from './account/account.component';
import { LoginComponent } from './account/login.component';
import { RegisterComponent } from './account/register.component';

export const routes: Routes = [
    {
        path: 'account',
        component: AccountComponent,
        children: [
            {
                path: 'login',
                component: LoginComponent,
            },
            {
                path: 'register',
                component: RegisterComponent,
            },
        ],
    },
];
