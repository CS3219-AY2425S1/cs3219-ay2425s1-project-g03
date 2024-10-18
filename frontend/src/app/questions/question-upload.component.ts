import { Component, EventEmitter, Output } from '@angular/core';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { FileSelectEvent, FileUpload, FileUploadHandlerEvent, FileUploadModule } from 'primeng/fileupload';
import { Question, UploadQuestionsResponse } from './question.model';
import { QuestionService } from '../../_services/question.service';
import { HttpErrorResponse } from '@angular/common/http';
import { finalize } from 'rxjs';

@Component({
    selector: 'app-question-upload',
    standalone: true,
    imports: [DialogModule, FileUploadModule],
    templateUrl: './question-upload.component.html',
    styleUrl: './question-upload.component.css',
})
export class QuestionUploadComponent {
    @Output() questionsUpsert = new EventEmitter<Question[]>();
    public isVisible = false;

    constructor(
        private messageService: MessageService,
        private questionService: QuestionService,
    ) {}

    private isValidJson(jsonString: string): boolean {
        try {
            JSON.parse(jsonString);
        } catch {
            return false;
        }
        return true;
    }

    onSelect(event: FileSelectEvent, fileUpload: FileUpload) {
        const files = event.files || [];
        for (const file of files) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;

                if (!this.isValidJson(result)) {
                    const idx = fileUpload.files.findIndex(f => f === file);
                    fileUpload.remove(event.originalEvent, idx);
                    fileUpload.cd.markForCheck();
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `The file ${file.name} is invalid!`,
                        life: 3000,
                    });
                }
            };
            reader.readAsText(file);
        }
    }

    upload(event: FileUploadHandlerEvent, fileUpload: FileUpload) {
        const file = event.files[0];
        fileUpload.uploading = true;

        this.questionService
            .uploadQuestions(file)
            .pipe(finalize(() => this.onUploadFinish(fileUpload)))
            .subscribe({
                next: (response: UploadQuestionsResponse) => {
                    this.messageService.add({
                        severity: 'success',
                        summary: 'Success',
                        detail: 'Questions added!',
                        life: 3000,
                    });
                    this.questionsUpsert.emit(response.data);
                    this.onUploadFinish(fileUpload);
                },
                error: (error: HttpErrorResponse) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: `${error.error.message}`,
                        life: 3000,
                    });
                    const data = error.error?.data || [];
                    this.questionsUpsert.emit(data);
                    this.onUploadFinish(fileUpload);
                },
            });
    }

    onUploadFinish(fileUpload: FileUpload) {
        fileUpload.uploading = false;
        fileUpload.progress = 100;
        fileUpload.cd.markForCheck();
        setTimeout(() => {
            this.isVisible = false;
            fileUpload.clear();
        }, 2000);
    }
}
