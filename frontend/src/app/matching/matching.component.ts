import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { FindingMatchComponent } from './finding-match/finding-match.component';
import { RetryMatchingComponent } from './retry-matching/retry-matching.component';
import { QuestionService } from '../../_services/question.service';
import { MessageService } from 'primeng/api';
import { HAS_NO_QUESTIONS, hasQuestionsValidator } from './_validators/has-questions.validator';
import { Difficulty } from './user-criteria.model';
import { ToastModule } from 'primeng/toast';
import { MatchService } from '../../_services/match.service';
import { MatchRequest } from './match.model';

@Component({
    selector: 'app-matching',
    standalone: true,
    imports: [
        FindingMatchComponent,
        RetryMatchingComponent,
        ChipModule,
        ToastModule,
        MultiSelectModule,
        PanelModule,
        DropdownModule,
        RadioButtonModule,
        AccordionModule,
        ButtonModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
    ],
    providers: [QuestionService, MessageService],
    templateUrl: './matching.component.html',
    styleUrl: './matching.component.css',
})
export class MatchingComponent implements OnInit {
    availableTopics: string[] = [];
    availableDifficulties = ['Easy', 'Medium', 'Hard'];

    isLoadingTopics = true;
    isInitiatingMatch = false;
    isProcessingMatch = false;
    isMatchTimeout = false;
    matchId!: string;

    constructor(
        private messageService: MessageService,
        private questionService: QuestionService,
        private matchService: MatchService,
    ) {}

    matchForm!: FormGroup;

    ngOnInit(): void {
        this.fetchTopics();
        this.matchForm = new FormGroup(
            {
                topics: new FormControl([], [Validators.required, Validators.minLength(1)]),
                difficulty: new FormControl<Difficulty | null>(null, [Validators.required]),
            },
            {
                asyncValidators: hasQuestionsValidator(this.questionService),
            },
        );
    }

    fetchTopics() {
        this.questionService.getTopics().subscribe({
            next: response => {
                this.availableTopics = response.data || [];
            },
            error: () => {
                this.availableTopics = [];
                this.onErrorReceive('Failed to load topics. Please try again later.');
            },
            complete: () => {
                this.isLoadingTopics = false;
            },
        });
    }

    get topicControl(): AbstractControl {
        return this.matchForm.controls['topics'];
    }

    get topics(): string[] {
        return this.matchForm.controls['topics'].value;
    }

    get difficulty(): Difficulty {
        return this.matchForm.controls['difficulty'].value;
    }

    get hasNoQuestions(): boolean {
        return this.matchForm.dirty && this.matchForm.hasError(HAS_NO_QUESTIONS);
    }

    get matchRequest(): MatchRequest {
        return { topics: this.topics, difficulty: this.difficulty };
    }

    onErrorReceive(errorMessage: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
        });
    }

    onMatch() {
        this.isInitiatingMatch = true;
        this.matchService.createMatchRequest(this.matchRequest).subscribe({
            next: response => {
                this.matchId = response.data._id;
            },
            error: () => {
                this.onErrorReceive('Failed to create a match. Please try again later.');
            },
            complete: () => {
                this.isInitiatingMatch = false;
                this.isProcessingMatch = true;
            },
        });
    }

    onMatchTimeout() {
        this.isProcessingMatch = false;
        this.isMatchTimeout = true;
    }

    onRetryMatchRequest(matchId: string) {
        this.matchId = matchId;
        this.isMatchTimeout = false;
        this.isProcessingMatch = true;
    }

    onMatchDialogClose() {
        this.isProcessingMatch = false;
    }

    onRetryMatchDialogClose() {
        this.isMatchTimeout = false;
    }

    removeTopic(topic: string) {
        const topicControl = this.matchForm.controls['topics'];
        const curTopics = topicControl.value;
        const index = curTopics.findIndex((t: string) => t === topic);

        topicControl.setValue([...curTopics.slice(0, index), ...curTopics.slice(index + 1)]);
    }
}
