import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { SingleQuestionResponse, QuestionResponse, QuestionBody } from '../app/questions/question.model';
import { TopicResponse } from '../app/questions/topic.model';
import { ApiService } from './api.service';

@Injectable({
    providedIn: 'root',
})
export class QuestionService {
    private baseUrl = API_CONFIG.baseUrl;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
        }),
    };

    constructor(private http: HttpClient) {
        super();
    }

    getQuestions(
        title?: string,
        description?: string,
        topics?: string[],
        difficulty?: string,
    ): Observable<QuestionResponse> {
        let params = new HttpParams();

        if (title) {
            params = params.append('title', title);
        }
        if (description) {
            params = params.append('description', description);
        }
        if (topics && topics.length > 0) {
            params = params.append('topics', topics.join(','));
        }
        if (difficulty) {
            params = params.append('difficulty', difficulty);
        }

        // send request
        return this.http.get<QuestionResponse>(this.baseUrl + '/questions', { params });
    }

    getQuestionByID(id: number): Observable<SingleQuestionResponse> {
        return this.http.get<SingleQuestionResponse>(this.baseUrl + '/questions/' + id);
    }

    getQuestionByParam(topics: string[], difficulty: string, limit?: number): Observable<QuestionResponse> {
        let params = new HttpParams();

        if (limit) {
            params = params.append('limit', limit);
        }
        params = params.append('topics', topics.join(',')).append('difficulty', difficulty);

        return this.http.get<QuestionResponse>(this.baseUrl + '/questions/search', { params });
    }

    getTopics(): Observable<TopicResponse> {
        return this.http.get<TopicResponse>(this.baseUrl + '/questions/topics');
    }

    addQuestion(question: QuestionBody): Observable<SingleQuestionResponse> {
        return this.http
            .post<SingleQuestionResponse>(this.baseUrl + '/questions', question, this.httpOptions)
            .pipe(catchError(this.handleError));
    }

    updateQuestion(id: number, question: QuestionBody): Observable<SingleQuestionResponse> {
        return this.http
            .put<SingleQuestionResponse>(this.baseUrl + '/questions/' + id, question, this.httpOptions)
            .pipe(catchError(this.handleError));
    }

    deleteQuestion(id: number): Observable<SingleQuestionResponse> {
        return this.http
            .delete<SingleQuestionResponse>(this.baseUrl + '/questions/' + id)
            .pipe(catchError(this.handleError));
    }

    handleError(error: HttpErrorResponse) {
        return throwError(error);
    }
}
