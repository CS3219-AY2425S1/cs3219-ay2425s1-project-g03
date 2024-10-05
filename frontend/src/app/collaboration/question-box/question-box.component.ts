import { Component, OnInit } from '@angular/core';
import { Question } from '../../questions/question.model';
import { QuestionService } from '../../../_services/question.service';
import { ChipModule } from 'primeng/chip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DifficultyLevels } from '../../questions/difficulty-levels.enum';
import { MessageService } from 'primeng/api';

@Component({
    selector: 'app-question-box',
    standalone: true,
    imports: [ChipModule, ScrollPanelModule],
    providers: [QuestionService, MessageService],
    templateUrl: './question-box.component.html',
    styleUrl: './question-box.component.css',
})
export class QuestionBoxComponent implements OnInit {
    question!: Question;

    // TODO: Retrieve questionId from session after player gets a match
    questionId = 1;

    difficultyLevels = DifficultyLevels;

    constructor(
        private questionService: QuestionService,
        private messageService: MessageService,
    ) {}

    ngOnInit() {
        this.setQuestion();
    }

    setQuestion() {
        this.questionService.getQuestionByID(this.questionId).subscribe({
            next: response => {
                console.log(response.data);
                this.question = response.data || [];
            },
            error: errorMessage => {
                this.question = {} as Question;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: errorMessage,
                    life: 3000,
                });
            },
        });
    }
}
