import { Routes } from '@angular/router';
import { QuestionsComponent } from './questions/questions.component';
import { MatchingComponent } from './matching/matching.component';
import { AuthGuardService } from '../_services/auth.guard.service';

const accountModule = () => import('./account/account.module').then(x => x.AccountModule);

export const routes: Routes = [
    {
        path: 'account',
        loadChildren: accountModule,
    },
    {
        path: 'questions',
        component: QuestionsComponent,
        canActivate: [AuthGuardService],
    },
    {
        path: 'matching',
        component: MatchingComponent,
    },
];
