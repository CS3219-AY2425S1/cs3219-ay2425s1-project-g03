import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of, combineLatest } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CollabService } from './collab.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
    providedIn: 'root',
})
export class CollabGuardService implements CanActivate {
    constructor(
        private collabService: CollabService,
        private router: Router,
        private authService: AuthenticationService,
    ) {}

    canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
        const roomId$ = of(route.queryParamMap.get('roomId') || '');
        const user$ = this.authService.user$;

        return combineLatest([roomId$, user$]).pipe(
            switchMap(([roomId, user]) => {
                if (!roomId || !user) {
                    this.router.navigate(['/matching']);
                    return of(false);
                }

                return this.collabService.getRoomDetails(roomId).pipe(
                    map(response => {
                        const isFound = response.data.users.some(roomUser => roomUser?.id === user.id);
                        const isOpen = response.data.room_status;
                        const isForfeit = response.data.users.find(roomUser => roomUser?.id === user.id)?.isForfeit;

                        if (!isFound || !isOpen || isForfeit) {
                            this.router.navigate(['/matching']);
                            return false;
                        }
                        return true;
                    }),
                    catchError(() => {
                        this.router.navigate(['/matching']);
                        return of(false);
                    }),
                );
            }),
        );
    }
}
