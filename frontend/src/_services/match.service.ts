import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { MatchRequest, MatchResponse } from '../app/matching/match.model';

@Injectable({
    providedIn: 'root',
})
export class MatchService extends ApiService {
    protected apiPath = 'match/request';

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(private http: HttpClient) {
        super();
    }

    /**
     * Creates a match request with the provided details. The match request will
     * be valid for one minute.
     */
    createMatchRequest(matchRequest: MatchRequest) {
        return this.http.post<MatchResponse>(this.apiUrl, matchRequest, this.httpOptions);
    }

    /**
     * Retrieves the match request and its current status
     */
    retrieveMatchRequest(id: string) {
        return this.http.get<MatchResponse>(this.apiUrl + '/' + id);
    }

    /**
     * Deletes the match request
     */
    deleteMatchRequest(id: string) {
        return this.http.delete<MatchResponse>(this.apiUrl + '/' + id);
    }
}
