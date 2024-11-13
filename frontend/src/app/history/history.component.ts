import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Table, TableModule } from 'primeng/table';
import { CommonModule, DatePipe } from '@angular/common';
import { HistoryStatus, MatchingHistory } from './history.model';
import { HistoryService } from '../../_services/history.service';
import { MessageService, SortEvent } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Extension } from '@codemirror/state';
import { EditorView, basicSetup } from 'codemirror';
import { languageMap } from '../collaboration/editor/languages';
import { ToastModule } from 'primeng/toast';
import { SidebarModule } from 'primeng/sidebar';
import { Router } from '@angular/router';

@Component({
    standalone: true,
    imports: [
        SidebarModule,
        TableModule,
        CommonModule,
        InputTextModule,
        ButtonModule,
        IconFieldModule,
        InputIconModule,
        ToastModule,
    ],
    providers: [MessageService, DatePipe],
    templateUrl: './history.component.html',
    styleUrl: './history.component.css',
})
export class HistoryComponent implements OnInit {
    @ViewChild('editor') editor!: ElementRef;
    @ViewChild('dt') dt!: Table;

    histories: MatchingHistory[] = [];
    initialValue: MatchingHistory[] = [];
    loading = true;
    isPanelVisible = false;
    panelHistory: MatchingHistory | null = null;
    editorView: EditorView | null = null;
    customTheme!: Extension;
    isSorted: null | undefined | boolean;

    constructor(
        private historyService: HistoryService,
        private messageService: MessageService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.historyService.getHistories().subscribe({
            next: data => {
                this.histories = data;
                this.initialValue = [...data];
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

    customSort(event: Required<SortEvent>) {
        event.data?.sort((data1, data2) => {
            const value1 = data1[event.field];
            const value2 = data2[event.field];
            let result = 0;

            // Null checks
            if (value1 === null && value2 !== null) {
                result = -1;
            } else if (value1 !== null && value2 === null) {
                result = 1;
            } else if (value1 === null && value2 === null) {
                result = 0;
            } else if (event.field == 'time') {
                result = new Date(value1) >= new Date(value2) ? 1 : -1;
            } else if (typeof value1 === 'string' && typeof value2 === 'string') {
                // String comparison
                result = value1.localeCompare(value2);
            } else {
                // Generic comparison for numbers and other types
                result = value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
            }

            return event.order * result;
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

        const customTheme = EditorView.theme(
            {
                '&': {
                    backgroundColor: 'var(--surface-section)',
                },
                '.cm-gutters': {
                    backgroundColor: 'var(--surface-section)',
                },
            },
            { dark: true },
        );

        const languageExtension = languageMap[language] || languageMap['java'];
        const state = EditorState.create({
            doc: code,
            extensions: [
                basicSetup,
                languageExtension,
                customTheme,
                oneDark,
                EditorView.lineWrapping,
                EditorView.editable.of(false),
            ],
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
