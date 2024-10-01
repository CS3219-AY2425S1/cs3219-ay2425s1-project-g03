import { Component, EventEmitter, Input, Output } from '@angular/core';
import { UserCriteria } from '../user-criteria.model';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ChipModule } from 'primeng/chip';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-finding-match',
    standalone: true,
    imports: [ChipModule, DialogModule, ButtonModule, ProgressSpinnerModule, CommonModule],
    templateUrl: './finding-match.component.html',
    styleUrl: './finding-match.component.css',
})
export class FindingMatchComponent {
    @Input() userCriteria: UserCriteria = { topics: [], difficulty: null };
    @Input() isVisible = false;

    @Output() dialogClose = new EventEmitter<void>();
    @Output() matchFailed = new EventEmitter<void>();
    @Output() matchSuccess = new EventEmitter<void>();

    isFindingMatch = true;

    closeDialog() {
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

    onDialogShow() {
        // Simulate request to API and subsequent success/failure.
        setTimeout(() => {
            if (this.isVisible) {
                // Toggle to simulate different situations.
                // this.onMatchFailed();
                this.onMatchSuccess();
            }
        }, 3000);
    }
}
