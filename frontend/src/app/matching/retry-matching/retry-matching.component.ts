import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

@Component({
    selector: 'app-retry-matching',
    standalone: true,
    imports: [DialogModule, ButtonModule],
    templateUrl: './retry-matching.component.html',
    styleUrl: './retry-matching.component.css',
})
export class RetryMatchingComponent {
    @Input() isVisible = false;

    @Output() dialogClose = new EventEmitter<void>();
    @Output() retryMatch = new EventEmitter<void>();

    closeDialog() {
        this.dialogClose.emit();
    }

    onRetryMatch() {
        this.retryMatch.emit();
    }
}
