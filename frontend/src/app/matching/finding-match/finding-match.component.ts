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
    @Input() userCriteria: UserCriteria = { topics: null, difficulty: null };
    @Input() isVisible = false;

    @Output() close = new EventEmitter<void>();

    closeDialog() {
        this.isVisible = false;
        this.close.emit();
    }
}
