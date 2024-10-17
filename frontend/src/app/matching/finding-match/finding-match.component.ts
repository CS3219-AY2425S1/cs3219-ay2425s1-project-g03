import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserCriteria } from '../user-criteria.model';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';
import { catchError, delay, filter, map, Observable, of, repeat, Subject, Subscription, switchMap, take, takeUntil, takeWhile, tap, timer, UnsubscriptionError } from 'rxjs';
import { QuestionService } from '../../../_services/question.service';
import { TopicResponse } from '../../questions/topic.model';
import { MessageService } from 'primeng/api';
import { MatchService } from '../../../_services/match.service';
import { MatchResponse, MatchStatus } from '../match.model';

@Component({
    selector: 'app-finding-match',
    standalone: true,
    imports: [ChipModule, DialogModule, ButtonModule, ProgressSpinnerModule, CommonModule],
    templateUrl: './finding-match.component.html',
    styleUrl: './finding-match.component.css',
})
export class FindingMatchComponent {
    @Input() userCriteria!: UserCriteria;
    @Input() matchId!: string;
    @Input() isVisible = false;

    @Output() dialogClose = new EventEmitter<void>();
    @Output() matchFailed = new EventEmitter<void>();
    @Output() matchSuccess = new EventEmitter<void>();

    isFindingMatch = true;

    matchPoll!: Subscription;

    constructor(
        private matchService: MatchService,
        private messageService: MessageService
    ) {}

    closeDialog() {
        this.matchPoll.unsubscribe();
        this.dialogClose.emit();
    }

    onMatchFailed() {
        this.matchFailed.emit();
    }

    onMatchSuccess() {
        this.isFindingMatch = false;
        this.matchSuccess.emit();
        // Possible to handle routing to workspace here.
    }

    stopPolling$ = new EventEmitter();

    requestData() {
        return this.matchService.retrieveMatchRequest(this.matchId).pipe(
            tap((response: MatchResponse) => {
                console.log(response);
                const status: MatchStatus = response.data.status || MatchStatus.PENDING
                switch(status) {
                    case MatchStatus.MATCH_FOUND:
                        this.onMatchSuccess();
                        break;
                    case MatchStatus.TIME_OUT:
                        this.stopPolling$.next(false);
                        this.onMatchFailed();
                        break;
                    // TODO: Add case for MatchStatus.COLLAB_CREATED
                }
            }),
            catchError(
                _ => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `Something went wrong while matching.`,
                        life: 3000,
                    });
                    this.closeDialog();
                    return of(null);
                }
            )
        )
    }

    startPolling(interval: number): Observable<MatchResponse | null> {
        return timer(0, interval)
            .pipe(
                switchMap(_ => this.requestData())
            );
    }

    onDialogShow() {
        this.matchPoll = this.startPolling(5000).pipe(
            tap(),
            takeUntil(this.stopPolling$),
        ).subscribe();
    }
}
