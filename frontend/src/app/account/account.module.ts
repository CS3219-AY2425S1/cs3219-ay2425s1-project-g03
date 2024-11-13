import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { LayoutComponent } from './layout.component';
import { AccountRoutingModule } from './account.component';
import { ProfileComponent } from './profile/profile.component';
import { HistoryComponent } from './history/history.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AccountRoutingModule,
        LayoutComponent,
        LoginComponent,
        RegisterComponent,
        ProfileComponent,
        HistoryComponent,
    ],
})
export class AccountModule {}
