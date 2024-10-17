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

@Component({
    selector: 'app-matching',
    standalone: true,
    imports: [
        FindingMatchComponent,
        RetryMatchingComponent,
        ChipModule,
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
    isProcessingMatch = false;
    isMatchFailed = false;

    constructor(
        private messageService: MessageService,
        private questionService: QuestionService,
    ) {}

    matchForm!: FormGroup;

    ngOnInit(): void {
        this.fetchTopics();
        this.matchForm = new FormGroup(
            {
                topics: new FormControl([], [Validators.minLength(1)]),
                difficulty: new FormControl('', [Validators.required]),
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

    get difficulty(): string {
        return this.matchForm.controls['difficulty'].value;
    }

    get hasNoQuestions(): boolean {
        return this.matchForm.dirty && this.matchForm.hasError(HAS_NO_QUESTIONS);
    }

    onErrorReceive(errorMessage: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
        });
    }

    onMatch() {
        console.log({
            topic: this.topics,
            difficulty: this.difficulty,
        });
        this.isProcessingMatch = true;
        // TODO: Add API request to start matching.
    }

    onMatchFailed() {
        this.isProcessingMatch = false;
        this.isMatchFailed = true;
    }

    onRetryMatchRequest() {
        this.isMatchFailed = false;
        this.isProcessingMatch = true;
        // TODO: Add API request to retry matching.
    }

    onMatchDialogClose() {
        this.isProcessingMatch = false;
    }

    onRetryMatchDialogClose() {
        this.isMatchFailed = false;
    }

    removeTopic(topic: string) {
        const topicControl = this.matchForm.controls['topics'];
        const curTopics = topicControl.value;
        const index = curTopics.findIndex((t: string) => t === topic);

        topicControl.setValue([...curTopics.slice(0, index), ...curTopics.slice(index + 1)]);
    }
}
