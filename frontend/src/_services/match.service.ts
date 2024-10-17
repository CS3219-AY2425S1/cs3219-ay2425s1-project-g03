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

    createMatchRequest(matchRequest: MatchRequest) {
        return this.http.post<MatchResponse>(this.apiUrl, matchRequest, this.httpOptions);
    }

    retrieveMatchRequest(id: string) {
        return this.http.get<MatchResponse>(this.apiUrl + '/' + id);
    }

    updateMatchRequest(id: string, matchRequest: MatchRequest) {
        return this.http.put<MatchResponse>(this.apiUrl + '/' + id, matchRequest, this.httpOptions);
    }

    deleteMatchRequest(id: string) {
        return this.http.delete<MatchResponse>(this.apiUrl + '/' + id);
    }
}
