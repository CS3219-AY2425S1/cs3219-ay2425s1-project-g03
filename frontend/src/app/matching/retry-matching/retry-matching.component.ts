import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MatchService } from '../../../_services/match.service';
import { MessageService } from 'primeng/api';
import { MatchRequest } from '../match.model';

@Component({
    selector: 'app-retry-matching',
    standalone: true,
    imports: [DialogModule, ButtonModule],
    templateUrl: './retry-matching.component.html',
    styleUrl: './retry-matching.component.css',
})
export class RetryMatchingComponent {
    @Input() isVisible = false;
    @Input({required: true}) matchRequest!: MatchRequest;

    @Output() dialogClose = new EventEmitter<void>();
    @Output() retryMatch = new EventEmitter<string>();

    constructor(
        private matchService: MatchService,
        private messageService: MessageService,
    ) {}

    closeDialog() {
        this.dialogClose.emit();
    }

    onRetryMatch() {
        this.matchService.createMatchRequest(this.matchRequest).subscribe({
            next: response => this.retryMatch.emit(response.data._id),
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Something went wrong while matching.`,
                    life: 3000,
                });
                this.closeDialog();
            },
        });
    }
}
