import { Injectable } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class RoomService {
    constructor(private route: ActivatedRoute) {}

    getRoomId(): Observable<string | null> {
        return this.route.queryParams.pipe(map(params => params['roomId'] || null));
    }
}
