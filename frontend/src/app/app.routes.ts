import { Routes } from '@angular/router';
import { QuestionsComponent } from './questions/questions.component';
import { CollaborationComponent } from './collaboration/collaboration.component';

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
        path: 'collab',
        component: CollaborationComponent,
        canActivate: [AuthGuardService, CollabGuardService],
    },
    {
        path: 'matching',
        component: MatchingComponent,
        canActivate: [AuthGuardService],
    },
    {
        path: 'start',
        component: CollaborationComponent,
    },
];
