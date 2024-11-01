import { Component, OnInit } from '@angular/core';
import { Question } from '../../questions/question.model';
import { QuestionService } from '../../../_services/question.service';
import { ChipModule } from 'primeng/chip';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { DifficultyLevels } from '../../questions/difficulty-levels.enum';
import { MessageService } from 'primeng/api';
import { CollabService } from '../../../_services/collab.service';
import { RoomService } from '../room.service';

@Component({
    selector: 'app-question-box',
    standalone: true,
    imports: [ChipModule, ScrollPanelModule],
    providers: [QuestionService, MessageService],
    templateUrl: './question-box.component.html',
    styleUrl: './question-box.component.css',
})
export class QuestionBoxComponent implements OnInit {
    question = {} as Question;
    difficultyLevels = DifficultyLevels;
    roomId!: string;

    constructor(
        private collabService: CollabService,
        private messageService: MessageService,
        private roomService: RoomService,
    ) {}

    ngOnInit() {
        this.initRoomId();
        this.initQuestion();
    }

    initRoomId() {
        this.roomService.getRoomId().subscribe(id => {
            this.roomId = id!;
        });
    }

    initQuestion() {
        this.collabService.getRoomDetails(this.roomId).subscribe({
            next: response => {
                this.question = response.data.question;
            },
            error: () => {
                this.question = {} as Question;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to retrieve room details',
                    life: 3000,
                });
            },
        });
    }
}
