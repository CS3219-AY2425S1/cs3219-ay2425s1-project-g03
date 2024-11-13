import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoryStatus, MatchingHistory } from './history.model';
import { HistoryService } from '../../../_services/history.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { languageMap } from '../../collaboration/editor/languages';
import { ToastModule } from 'primeng/toast';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    imports: [TableModule, CommonModule, InputTextModule, ButtonModule, IconFieldModule, InputIconModule, ToastModule],
    providers: [MessageService, DatePipe],
    templateUrl: './history.component.html',
    styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
    @ViewChild('editor') editor!: ElementRef;

    histories: MatchingHistory[] = [];
    loading = true;
    isPanelVisible = false;
    panelHistory: MatchingHistory | null = null;
    editorView: EditorView | null = null;

    constructor(
        private historyService: HistoryService,
        private messageService: MessageService,
        private datePipe: DatePipe,
        private router: Router,
    ) {}

    ngOnInit() {
        this.historyService.getHistories().subscribe({
            next: data => {
                this.histories = data.map(history => ({
                    ...history,
                    time: this.datePipe.transform(history.time, 'short'), // Pipe to format date for searching
                }));
                this.loading = false;
            },
            error: () => {
                this.histories = [];
                this.loading = false;
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to load data. Please try again later.',
                    life: 3000,
                });
            },
        });
    }

    onRowSelect(history: MatchingHistory) {
        this.panelHistory = history;
        if (history.status != HistoryStatus.IN_PROGRESS) {
            this.isPanelVisible = true;
            this.initializeEditor(history.code as string, history.language as string);
        } else {
            this.redirectToCollab(history.roomId);
        }
    }

    closePanel() {
        this.isPanelVisible = false;
        this.panelHistory = null;
    }

    initializeEditor(code: string, language: string) {
        if (this.editorView) {
            this.editorView.destroy();
        }

        const languageExtension = languageMap[language] || languageMap['java'];
        const state = EditorState.create({
            doc: code,
            extensions: [basicSetup, languageExtension, oneDark, EditorView.editable.of(false)],
        });

        this.editorView = new EditorView({
            state,
            parent: this.editor.nativeElement,
        });
    }

    redirectToCollab(collabId: string) {
        this.router.navigate(['/collab'], {
            queryParams: {
                roomId: collabId,
            },
        });
    }
}
