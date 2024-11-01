import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DifficultyLevels } from '../questions/difficulty-levels.enum';
import { ChipModule } from 'primeng/chip';
import { ActiveSession } from './active-sessions.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [TableModule, ButtonModule, ChipModule],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
    activeSessions!: ActiveSession[];
    difficultyLevels = DifficultyLevels;

    ngOnInit() {
        this.getActiveSessions();
    }

    getActiveSessions() {
        this.activeSessions = [
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.EASY, peer: 'testadasdas' },
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.HARD, peer: 'testadasdas' },
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.EASY, peer: 'testadasdas' },
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.HARD, peer: 'testadasdas' },
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.EASY, peer: 'testadasdas' },
            { questionTitle: 'dasda', difficulty: this.difficultyLevels.HARD, peer: 'testadasdas' },
        ];
    }
}
