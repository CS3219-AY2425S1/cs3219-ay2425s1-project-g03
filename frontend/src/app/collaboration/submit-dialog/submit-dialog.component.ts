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
    @Input() ysubmit!: Y.Map<boolean>;
    @Input() yforfeit!: Y.Map<boolean>;
    @Input() isVisible = false;
    @Input() isInitiator!: boolean;
    @Input() roomId!: string;

    @Output() dialogClose = new EventEmitter<void>();
    @Output() successfulSubmit = new EventEmitter<void>();

    MAX_NUM_OF_USERS = 2;
    message!: string;
    remainingUsers = this.MAX_NUM_OF_USERS;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private authService: AuthenticationService,
        private collabService: CollabService,
        private router: Router,
    ) {}

    ngAfterViewInit() {
        this.initDocListener();
    }

    initDocListener() {
        this.ysubmit.observe(() => {
            const counter = this.ysubmit.size;
            if (counter > 0) {
                this.showSubmitDialog();
                this.checkVoteOutcome(counter);
            } else {
                this.dialogClose.emit();
                this.isVisible = false;
                this.isInitiator = false;
            }
        });

        this.yforfeit.observe(() => {
            this.remainingUsers -= this.yforfeit.size;
        });
    }

    onDialogShow() {
        if (this.isInitiator) {
            this.initiateSubmit();
            this.message = "Waiting for the other user's decision...";
        } else {
            this.message = `Your peer has initiated a submission.\n\nDo you agree?`;
        }
    }

    initiateSubmit() {
        const userId = this.authService.userValue?.id;
        if (userId) {
            this.ysubmit.set(userId, true);
        }
    }

    agreeSubmit() {
        const userId = this.authService.userValue?.id;
        if (userId) {
            this.ysubmit.set(userId, true);
        }
    }

    checkVoteOutcome(counter: number) {
        console.log(counter);
        if (counter != this.remainingUsers) {
            return;
        }

        this.successfulSubmit.emit();

        if (this.isInitiator) {
            this.collabService.closeRoom(this.roomId).subscribe({
                next: () => {
                    this.message = 'Successfully submitted. \n\n Redirecting you to homepage...';
                    setTimeout(() => {
                        this.router.navigate(['/matching']);
                    }, 1000);
                },
            });
        }

        setTimeout(() => {
            this.router.navigate(['/matching']);
        }, 1000);
    }

    closeVoting() {
        this.ysubmit.clear();
    }

    showSubmitDialog() {
        this.isVisible = true;
    }
}
