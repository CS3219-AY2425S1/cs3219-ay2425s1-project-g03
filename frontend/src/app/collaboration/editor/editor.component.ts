import {
    AfterViewInit,
    Component,
    ElementRef,
    Inject,
    ViewChild,
    OnInit,
    ChangeDetectorRef,
    Input,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import * as prettier from 'prettier';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import { usercolors } from './user-colors';
import { AuthenticationService } from '../../../_services/authentication.service';
// The 'prettier-plugin-java' package does not provide TypeScript declaration files.
// We are using '@ts-ignore' to bypass TypeScript's missing type declaration error.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prettierPluginJava from 'prettier-plugin-java';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prettierPluginPhp from '@prettier/plugin-php';
import prettierPluginXml from '@prettier/plugin-xml';
import * as prettierPluginRust from 'prettier-plugin-rust';
import prettierPluginSql from 'prettier-plugin-sql';
import parserBabel from 'prettier/plugins/babel';
import * as prettier from 'prettier';
import * as prettierPluginEstree from 'prettier/plugins/estree';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Extension, StateEffect } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { EditorView } from 'codemirror';
import { yCollab } from 'y-codemirror.next';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';
import { ForfeitDialogComponent } from '../forfeit-dialog/forfeit-dialog.component';
import { Router } from '@angular/router';
import { awarenessData } from '../collab.model';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [
        ScrollPanelModule,
        ButtonModule,
        ConfirmDialogModule,
        ToastModule,
        SubmitDialogComponent,
        ForfeitDialogComponent,
    ],
    providers: [MessageService],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css',
})
export class EditorComponent implements AfterViewInit, OnInit {
    @ViewChild('editor') editor!: ElementRef;
    @ViewChild(ForfeitDialogComponent) forfeitChild!: ForfeitDialogComponent;

    @Input() ydoc!: Y.Doc;
    @Input() wsProvider!: WebsocketProvider;
    @Input() roomId!: string;

    state!: EditorState;
    view!: EditorView;
    yeditorText = new Y.Text('');
    ysubmit = new Y.Map<boolean>();
    yforfeit = new Y.Map<boolean>();
    ylanguage = new Y.Map<string>();
    undoManager!: Y.UndoManager;
    customTheme!: Extension;

    isSubmit = false;
    isInitiator = false;
    isForfeitClick = false;
    numUniqueUsers = 0;
    selectedLanguage!: string;
    languages: LanguageOption[] = [];

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private messageService: MessageService,
        private authService: AuthenticationService,
        private changeDetector: ChangeDetectorRef,
    ) {}

    ngOnInit() {
        this.initYdoc();
        this.getNumOfConnectedUsers();
        this.populateLanguages();
    }

    ngAfterViewInit() {
        this.setTheme();
        this.setProvider();
        this.setEditorState(this.selectedLanguage);
        this.setEditorView();
        this.setCursorPosition();
    }

    initYdoc() {
        this.yeditorText = this.ydoc.getText('editorText');
        this.ysubmit = this.ydoc.getMap('submit');
        this.yforfeit = this.ydoc.getMap('forfeit');
        this.ylanguage = this.ydoc.getMap('language');
        this.undoManager = new Y.UndoManager(this.yeditorText);

    getNumOfConnectedUsers() {
        this.wsProvider.awareness.on('change', () => {
            const data = Array.from(this.wsProvider.awareness.getStates().values());
            const uniqueIds = new Set(
                data
                    .map(x => (x as awarenessData).user?.userId)
                    .filter((userId): userId is string => userId !== undefined),
            );

            this.numUniqueUsers = uniqueIds.size;

            this.changeDetector.detectChanges();
        });
    }

    showSubmitDialog() {
        this.isSubmit = true;
        this.isInitiator = true;
    }

    async format() {
        try {
            const currentCode = this.view.state.doc.toString();

            const formattedCode = prettier.format(currentCode, {
                parser: 'java',
                plugins: [prettierPluginJava, prettierPluginEstree], // Add necessary plugins
            });

            this.view.dispatch({
                changes: {
                    from: 0,
                    to: this.view.state.doc.length,
                    insert: await formattedCode,
                },
            });

            this.view.focus();
        } catch (e) {
            console.error('Error formatting code:', e);
            this.messageService.add({ severity: 'error', summary: 'Formatting Error' });
        }
    }

    initDoctListener() {
        this.ylanguage.observe(ymapEvent => {
            ymapEvent.changes.keys.forEach((change, key) => {
                if (change.action === 'update') {
                    this.selectedLanguage = this.ylanguage.get(key)!;
                    const languageExtension = languageMap[this.selectedLanguage];

                    if (languageExtension) {
                        this.updateLanguageExtension(this.selectedLanguage);
                    }
                }
            });
        });
    }

    setProvider() {
        const randomIndex = Math.floor(Math.random() * usercolors.length);

        this.wsProvider.awareness.setLocalStateField('user', {
            userId: this.authService.userValue?.id,
            name: this.authService.userValue?.username,
            color: usercolors[randomIndex].color,
            colorLight: usercolors[randomIndex].light,
        });
    }

    setEditorState(language: string) {
        this.state = EditorState.create({
            doc: this.yeditorText.toString(),
            extensions: this.getEditorExtensions(language),
        });
    }

    getEditorExtensions(language: string): Extension[] {
        return [
            EditorView.lineWrapping,
            basicSetup,
            languageMap[language],
            this.customTheme,
            oneDark,
            yCollab(this.yeditorText, this.wsProvider.awareness, { undoManager: this.undoManager }),
        ];
    }

    setEditorView() {
        const editorElement = this.editor.nativeElement;
        const state = this.state;
        this.view = new EditorView({
            state,
            parent: editorElement,
        });
    }

    setTheme() {
        this.customTheme = EditorView.theme(
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
    }

    setCursorPosition() {
        // set new cursor position
        const cursorPosition = this.state.doc.line(1).from;

        this.view.dispatch({
            selection: {
                anchor: cursorPosition,
                head: cursorPosition,
            },
        });

        this.view.focus();
    }

    getNumOfConnectedUsers() {
        this.wsProvider.awareness.on('change', () => {
            const data = Array.from(this.wsProvider.awareness.getStates().values());
            const uniqueIds = new Set(
                data
                    .map(x => (x as awarenessData).user?.userId)
                    .filter((userId): userId is string => userId !== undefined),
            );

            this.numUniqueUsers = uniqueIds.size;

            this.changeDetector.detectChanges();
        });
    }

    async format() {
        try {
            const selectedParser = parserMap[this.selectedLanguage.toLowerCase()];

            if (selectedParser === undefined) {
                this.notifyUnsupported();
                return;
            }

            const currentCode = this.view.state.doc.toString();
            const formattedCode = this.prettierFormat(currentCode, selectedParser);

            this.view.dispatch({
                changes: {
                    from: 0,
                    to: this.view.state.doc.length,
                    insert: await formattedCode,
                },
            });

            this.view.focus();
        } catch (error) {
            if (error instanceof SyntaxError || error instanceof Error) {
                this.notifyFormattingErr(
                    "There's a syntax error in your code. Please fix it and try formatting again.",
                );
            } else {
                this.notifyFormattingErr('An error occurred while formatting. Please check your code and try again.');
            }
        }
    }

    prettierFormat(currentCode: string, selectedParser: string): Promise<string> {
        return prettier.format(currentCode, {
            parser: selectedParser,
            plugins: [
                parserBabel,
                prettierPluginJava,
                prettierPluginEstree,
                prettierPluginPhp,
                prettierPluginXml,
                prettierPluginRust,
                prettierPluginSql,
            ],
        });
    }

    notifyFormattingErr(message: string) {
        this.messageService.add({
            severity: 'warn',
            summary: 'Formatting Error',
            detail: message,
        });
    }

    notifyUnsupported() {
        this.messageService.add({
            severity: 'info',
            summary: 'Info Message',
            detail: `The selected language ${this.selectedLanguage.toLowerCase()} is currently not supported for auto formatting.`,
        });
    }

    showSubmitDialog() {
        this.isSubmit = true;
        this.isInitiator = true;
    }

    onSubmitDialogClose(numForfeit: number) {
        if (numForfeit == 0 && this.ysubmit.size > 0) {
            this.messageService.add({
                severity: 'error',
                summary: 'Fail',
                detail: 'Submission failed: Not all participants agreed. Please try again.',
            });
        }

        this.isSubmit = false;
    }

    onSuccess() {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'You have successfully submitted!',
        });
        this.isSubmit = false;
    }

    forfeit() {
        this.isForfeitClick = true;
    }

    onForfeitDialogClose() {
        this.isForfeitClick = false;
    }

    forfeitNotify() {
        this.messageService.add({
            severity: 'error',
            summary: 'Warning',
            detail: 'Your peer has chosen to forfeit the session.',
        });
    }
}
