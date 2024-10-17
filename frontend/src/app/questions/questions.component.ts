import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { CommonModule, NgFor } from '@angular/common';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Question } from './question.model';
import { QuestionService } from '../../_services/question.service';
import { HttpErrorResponse } from '@angular/common/http';
import { QuestionDialogComponent } from './question-dialog.component';
import { Column } from './column.model';

@Component({
    selector: 'app-questions',
    standalone: true,
    imports: [
        TableModule,
        NgFor,
        CommonModule,
        FormsModule,
        ToastModule,
        ToolbarModule,
        ButtonModule,
        ConfirmDialogModule,
        DialogModule,
        ButtonModule,
        ReactiveFormsModule,
        MultiSelectModule,
        DropdownModule,
        ProgressSpinnerModule,
        QuestionDialogComponent,
    ],
    providers: [QuestionService, ConfirmationService, MessageService],
    templateUrl: './questions.component.html',
    styleUrl: './questions.component.css',
})
export class QuestionsComponent implements OnInit {
    loading = true;

    questions: Question[] = [];

    cols: Column[] = [];

    question!: Question;

    selectedQuestions!: Question[] | null;

    isDialogVisible = false;

    constructor(
        private questionService: QuestionService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}

    ngOnInit() {
        // two way binding for forms is not working for some reason unless question is initialised with empty values
        this.initQuestion();

        // fetch data from API call
        this.handleInitData();
    }

    openNewQuestion() {
        this.question = {} as Question;
        this.isDialogVisible = true;
    }

    editQuestion(question: Question) {
        this.question = question;
        this.isDialogVisible = true;
    }

    deleteSelectedQuestions() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete the selected questions?',
            header: 'Delete Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: () => this.handleDeleteQuestionsResponse(),
        });
    }

    initQuestion() {
        this.question = {
            id: -1,
            title: '',
            topics: [],
            description: '',
            difficulty: '',
        };
    }

    handleDeleteQuestionsResponse() {
        const ids = this.selectedQuestions?.map(q => q.id) || [];
        this.questionService.deleteQuestions(ids).subscribe({
            next: () => {
                this.questions = this.questions?.filter(q => !ids.includes(q.id));
                this.selectedQuestions = null;
            },
            error: (error: HttpErrorResponse) => this.onErrorReceive(error.error.message),
            complete: () => this.onSuccessfulRequest('Question(s) Deleted'),
        });
    }

    handleInitData() {
        this.questionService.getQuestions().subscribe({
            next: response => {
                this.questions = response.data || [];
            },
            error: () => {
                this.questions = [];
                this.onErrorReceive('Failed to load data. Please try again later.');
            },
            complete: () => {
                this.loading = false;
            },
        });
    }

    onDialogClose() {
        this.isDialogVisible = false;
    }

    onQuestionUpdate(question: Question) {
        this.questions[this.questions.findIndex(x => x.id == question.id)] = question;
        this.questions = [...this.questions];
    }

    onQuestionAdd(question: Question) {
        this.questions = [...this.questions, question];
    }

    onErrorReceive(errorMessage: string) {
        this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: errorMessage,
            life: 3000,
        });
    }

    onSuccessfulRequest(successMessage: string) {
        this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: successMessage,
            life: 3000,
        });
    }
}
