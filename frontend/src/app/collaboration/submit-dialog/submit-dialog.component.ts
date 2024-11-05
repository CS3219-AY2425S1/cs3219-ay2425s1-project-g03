import { Component, EventEmitter, Input, Output, Inject, AfterViewInit } from '@angular/core';
import { AuthenticationService } from '../../../_services/authentication.service';
import { DOCUMENT } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressBarModule } from 'primeng/progressbar';
import { Router } from '@angular/router';
import { CollabService } from '../../../_services/collab.service';
import * as Y from 'yjs';

@Component({
    selector: 'app-submit-dialog',
    standalone: true,
    imports: [DialogModule, ButtonModule, ProgressBarModule],
    templateUrl: './submit-dialog.component.html',
    styleUrl: './submit-dialog.component.css',
})
export class SubmitDialogComponent implements AfterViewInit {
    @Input() isVisible = false;
    @Input() isInitiator = false;
    @Input() roomId!: string;
    @Input() numUniqueUsers!: number;
    @Input() ydoc!: Y.Doc;

    @Output() dialogClose = new EventEmitter<number>();
    @Output() successfulSubmit = new EventEmitter<void>();

    message!: string;
    numForfeit = 0;
    yshow!: Y.Map<boolean>;
    ysubmit!: Y.Map<boolean>;
    yforfeit!: Y.Map<boolean>;
    userId!: string;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private authService: AuthenticationService,
        private collabService: CollabService,
        private router: Router,
    ) {}

    ngAfterViewInit() {
        this.getUserId();
        this.initDoc();
        this.initDocListener();
    }

    initDoc() {
        this.ysubmit = this.ydoc.getMap('submit');
        this.yforfeit = this.ydoc.getMap('forfeit');
        this.yshow = this.ydoc.getMap('cancel');
    }

    getUserId() {
        this.userId = this.authService.userValue?.id || '';
    }

    initDocListener() {
        this.ysubmit.observe(() => {
            const firstEntry = this.ysubmit.entries().next().value;

            if (firstEntry && firstEntry[0] !== undefined) {
                this.isInitiator = firstEntry[0] === this.userId;
            }

            const counter = this.ysubmit.size;
            if (this.ysubmit.size > 0) {
                this.showSubmitDialog();
                this.checkVoteOutcome(counter);
            }
        });

        this.yforfeit.observe(() => {
            this.numForfeit = this.yforfeit.size;
        });

        this.yshow.observe(() => {
            const isShow = this.yshow.get('show');
            if (isShow) {
                this.isVisible = true;
            } else {
                this.dialogClose.emit(this.numForfeit);
                this.isVisible = false;
                this.isInitiator = false;
                this.ysubmit.clear();
            }
        });
    }

    onDialogShow() {
        if (this.isInitiator) {
            this.yshow.set('show', true);
            if (this.numForfeit == 0 && this.numUniqueUsers == 2) {
                this.message = "Waiting for the other user's decision...";
                this.ysubmit.set(this.userId!, true);
            } else if (this.numForfeit == 0 && this.numUniqueUsers == 1) {
                this.message =
                    'Are you sure you want to submit?\n\n If you submit now, while your peer is disconnected, both of your submissions will be finalised.';
            } else {
                this.message = 'Are you sure you want to submit?';
            }
        } else {
            this.message = 'Your peer has initiated a submission.\n\nDo you agree?';
        }
    }

    agreeSubmit() {
        const userId = this.authService.userValue?.id;
        if (userId) {
            this.ysubmit.set(userId, true);
        }
    }

    checkVoteOutcome(counter: number) {
        const isConsent = counter == this.numUniqueUsers;

        if (!isConsent) {
            return;
        }

        this.successfulSubmit.emit();

        if (this.isInitiator) {
            this.collabService.closeRoom(this.roomId).subscribe({
                next: () => {
                    this.message = 'Successfully submitted. \n\n Redirecting you to homepage...';
                    setTimeout(() => {
                        this.router.navigate(['/home']);
                    }, 1500);
                },
            });
        }

        setTimeout(() => {
            this.router.navigate(['/home']);
        }, 1500);
    }

    cancel() {
        this.yshow.set('show', false);
        this.ysubmit.clear();
        this.isInitiator = false;
    }

    showSubmitDialog() {
        this.isVisible = true;
    }
}
