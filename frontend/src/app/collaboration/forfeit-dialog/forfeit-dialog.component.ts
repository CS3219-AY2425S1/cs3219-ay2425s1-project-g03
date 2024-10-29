import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';
import { CollabService } from '../../../_services/collab.service';
import { AuthenticationService } from '../../../_services/authentication.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import * as Y from 'yjs';

@Component({
    selector: 'app-forfeit-dialog',
    standalone: true,
    imports: [DialogModule, ButtonModule, ProgressSpinnerModule],

    templateUrl: './forfeit-dialog.component.html',
    styleUrl: './forfeit-dialog.component.css',
})
export class ForfeitDialogComponent implements OnInit {
    @Input() roomId!: string;
    @Input() isVisible = false;
    @Input() yforfeit!: Y.Map<boolean>;

    @Output() dialogClose = new EventEmitter<void>();

    message!: string;
    isForfeit = false;

    constructor(
        private authService: AuthenticationService,
        private collabService: CollabService,
        private router: Router,
    ) {}
    ngOnInit() {
        this.setMessage();
        this.initDocListener();
    }

    initDocListener() {
        this.yforfeit.observe(() => {
            const counter = this.yforfeit.size;

            if (counter == 1) {
                this.message = 'Are you sure you want to forfeit?';
            }
        });
    }

    setMessage() {
        this.message = 'Are you sure you want to forfeit?\n\nForfeiting would result in your peer working alone.';
    }

    onForfeit() {
        const userId = this.authService.userValue?.id;
        if (userId) {
            this.collabService.forfeit(this.roomId, userId).subscribe({
                next: () => {
                    this.yforfeit.set(userId, true);
                    this.message = 'You have forfeited. \n\n Redirecting you to homepage...';
                    this.isForfeit = true;
                    setTimeout(() => {
                        this.router.navigate(['/matching']);
                    }, 1000);
                },
            });
        }
    }

    onCancel() {
        this.dialogClose.emit();
    }
}
