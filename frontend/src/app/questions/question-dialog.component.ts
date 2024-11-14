import { Component, EventEmitter, Input, Output, OnInit, ViewChild } from '@angular/core';
import { Question, QuestionBody, SingleQuestionResponse } from './question.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { QuestionService } from '../../_services/question.service';
import { Difficulty } from './difficulty.model';
import { Topic } from './topic.model';
import { HttpErrorResponse } from '@angular/common/http';
import { DifficultyLevels } from './difficulty-levels.enum';

@Component({
    selector: 'app-question-dialog',
    standalone: true,
    imports: [
        ButtonModule,
        DialogModule,
        ButtonModule,
        ReactiveFormsModule,
        MultiSelectModule,
        DropdownModule,
        QuestionDialogComponent,
    ],
    providers: [QuestionService, ConfirmationService, MessageService],
    templateUrl: './question-dialog.component.html',
    styleUrl: './question-dialog.component.css',
})
export class QuestionDialogComponent implements OnInit {
    @ViewChild('topicSelector') topicSelector!: MultiSelect;
    @Input() question!: Question;
    @Input() isDialogVisible = false;
    @Output() dialogClose = new EventEmitter<void>();
    @Output() questionUpdate = new EventEmitter<Question>();
    @Output() questionAdd = new EventEmitter<Question>();
    @Output() errorReceive = new EventEmitter<string>();
    @Output() successfulRequest = new EventEmitter<string>();

    questionFormGroup!: FormGroup;
    submitted = false;

    topicSearchValue = '';

    headerMessage = '';

    topics!: Topic[];

    difficulties!: Difficulty[];

    filteredTopics: Topic[] = [];

    hasNoResultsFound = false;

    constructor(private questionService: QuestionService) {}

    ngOnInit(): void {
        this.initFormGroup();

        this.initDifficulties();

        this.initTopics();
    }

    get topicControl(): FormControl {
        return this.questionFormGroup.controls['topics'] as FormControl;
    }

    get isTitleInvalid(): boolean {
        const titleControl = this.questionFormGroup.controls['title'];
        return titleControl.dirty && titleControl.invalid;
    }

    get isDescriptionInvalid(): boolean {
        const descriptionControl = this.questionFormGroup.controls['description'];
        return descriptionControl.dirty && descriptionControl.invalid;
    }

    get isDifficultyInvalid(): boolean {
        const difficultyControl = this.questionFormGroup.controls['difficulty'];
        return difficultyControl.dirty && difficultyControl.invalid;
    }

    get isTopicsInvalid(): boolean {
        const topicsControl = this.questionFormGroup.controls['topics'];
        return topicsControl.dirty && topicsControl.invalid;
    }

    saveQuestion() {
        this.submitted = true;

        if (!this.questionFormGroup.valid) {
            return;
        }

        if (this.question.id) {
            // update
            this.handleEditQuestionResponse(this.question.id, this.questionFormGroup.value);
        } else {
            // add
            this.handleAddQuestionResponse();
        }

        this.dialogClose.emit();
    }

    cancel() {
        this.resetFormGroup();
        this.dialogClose.emit();
    }

    show() {
        this.setFormValue();
        this.setHeaderMessage();
    }

    setHeaderMessage() {
        if (this.question.id) {
            this.headerMessage = 'Edit Question';
        } else {
            this.submitted = false;
            this.headerMessage = 'Create new question';
        }
    }

    handleEditQuestionResponse(id: number, question: QuestionBody) {
        this.questionService.updateQuestion(id, question).subscribe({
            next: (response: SingleQuestionResponse) => {
                this.questionUpdate.emit(response.data);
            },
            error: (error: HttpErrorResponse) => {
                this.errorReceive.emit(error.message);
            },
            complete: () => {
                this.question = {} as Question;
                this.successfulRequest.emit('Question has been updated successfully');
            },
        });
    }

    handleAddQuestionResponse() {
        this.questionService.addQuestion(this.questionFormGroup.value).subscribe({
            next: (response: SingleQuestionResponse) => {
                this.questionAdd.emit(response.data);
            },
            error: (error: HttpErrorResponse) => {
                this.errorReceive.emit('Failed to add new question. ' + error.message);
            },
            complete: () => {
                this.question = {} as Question;
                this.successfulRequest.emit('New Question Added');
            },
        });
    }

    initFormGroup() {
        this.questionFormGroup = new FormGroup({
            topics: new FormControl<string[] | null>([], [Validators.required]),
            difficulty: new FormControl<Difficulty[] | null>([], [Validators.required]),
            title: new FormControl<string | null>('', [Validators.required]),
            description: new FormControl<string | null>('', [Validators.required]),
        });
    }

    initDifficulties() {
        this.difficulties = [
            { label: DifficultyLevels.EASY, value: DifficultyLevels.EASY },
            { label: DifficultyLevels.MEDIUM, value: DifficultyLevels.MEDIUM },
            { label: DifficultyLevels.HARD, value: DifficultyLevels.HARD },
        ];
    }

    initTopics() {
        this.questionService.getTopics().subscribe({
            next: response => {
                this.topics =
                    response.data?.map(topic => ({
                        label: topic,
                        value: topic,
                    })) || [];
            },
            error: (error: HttpErrorResponse) => {
                this.topics = [];
                this.errorReceive.emit('Failed to load topics. ' + error.message);
            },
        });
    }

    setFormValue() {
        this.questionFormGroup.patchValue({
            title: this.question.title,
            description: this.question.description,
            topics: this.question.topics,
            difficulty: this.question.difficulty,
        });
    }

    resetFormGroup() {
        this.questionFormGroup.reset({
            topics: [],
            difficulty: '',
            title: '',
            description: '',
        });
    }

    onFilterTopics(event: { filter: string }) {
        this.topicSearchValue = event.filter;
        this.hasNoResultsFound = !this.topics.some(topic =>
            topic.label.toLowerCase().includes(this.topicSearchValue.toLowerCase()),
        );
    }

    addNewTopic() {
        const newTopic = this.topicSearchValue;
        const newValue: Topic = {
            label: newTopic,
            value: newTopic,
        };

        const topicExists = this.topics.map(t => t.label).some(l => l.toLowerCase() === newTopic.toLowerCase());

        if (topicExists) {
            return;
        }

        this.topics.push(newValue);

        // Immediately add the new topic, and clear the search filter
        this.topicControl.setValue(this.topicControl.value?.concat([newTopic]) ?? [newTopic]);
        this.topicSelector.resetFilter();
        this.hasNoResultsFound = false;
    }
}
