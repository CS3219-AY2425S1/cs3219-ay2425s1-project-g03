import { AfterViewInit, Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { DOCUMENT } from '@angular/common';
import { EditorView } from 'codemirror';
import { java } from '@codemirror/lang-java';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { ButtonModule } from 'primeng/button';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { yCollab } from 'y-codemirror.next';
import * as prettier from 'prettier';
import * as prettierPluginEstree from 'prettier/plugins/estree';

// The 'prettier-plugin-java' package does not provide TypeScript declaration files.
// We are using '@ts-ignore' to bypass TypeScript's missing type declaration error.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prettierPluginJava from 'prettier-plugin-java';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [ScrollPanelModule, ButtonModule, ConfirmDialogModule, ToastModule],
    providers: [ConfirmationService, MessageService],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css',
})
export class EditorComponent implements AfterViewInit {
    @ViewChild('editor') editor!: ElementRef;

    state!: EditorState;

    view!: EditorView;

    customTheme!: Extension;

    isSubmit = false;

    ydoc!: Y.Doc;

    ytext = new Y.Text('# type your code here\n');

    yarray!: Y.Array<string>;

    undoManager!: Y.UndoManager;

    wsProvider!: WebsocketProvider;

    usercolors = [
        { color: '#30bced', light: '#30bced33' },
        { color: '#6eeb83', light: '#6eeb8333' },
        { color: '#ffbc42', light: '#ffbc4233' },
        { color: '#ecd444', light: '#ecd44433' },
        { color: '#ee6352', light: '#ee635233' },
        { color: '#9ac2c9', light: '#9ac2c933' },
        { color: '#8acb88', light: '#8acb8833' },
        { color: '#1be7ff', light: '#1be7ff33' },
    ];

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
    ) {}

    ngAfterViewInit() {
        this.setTheme();
        this.initConnection();
        this.setProvider();
        this.setEditorState();
        this.setEditorView();
        // this.setCursorPosition();
    }

    initConnection() {
        this.ydoc = new Y.Doc();
        // TODO: replace hardcoded connection
        this.wsProvider = new WebsocketProvider('ws://localhost:8084', 'my-room', this.ydoc);
        this.ytext = this.ydoc.getText('sharedArray');
        this.undoManager = new Y.UndoManager(this.ytext);
    }

    async format() {
        try {
            const currentCode = this.view.state.doc.toString();

            const formattedCode = prettier.format(currentCode, {
                parser: 'java',
                plugins: [prettierPluginJava, prettierPluginEstree], // Add necessary plugins
            });
            console.log(formattedCode);

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

    setProvider() {
        this.wsProvider.awareness.setLocalStateField('user', {
            name: 'Anonymous ' + Math.floor(Math.random() * 100),
            color: this.usercolors[0].color,
            colorLight: this.usercolors[0].light,
        });
    }

    setEditorState() {
        const undoManager = this.undoManager;
        const myExt: Extension = [
            basicSetup,
            java(),
            this.customTheme,
            oneDark,
            yCollab(this.ytext, this.wsProvider.awareness, { undoManager }),
        ];

        this.state = EditorState.create({
            doc: this.ytext.toString(),
            extensions: myExt,
        });
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
        const cursorPosition = this.state.doc.line(2).from;

        this.view.dispatch({
            selection: {
                anchor: cursorPosition,
                head: cursorPosition,
            },
        });

        this.view.focus();
    }

    submit() {
        this.isSubmit = true;

        this.confirmationService.confirm({
            header: 'Submit?',
            message: 'Please confirm to submit.',
            accept: () => {
                console.log('Submitted');
            },
        });
    }

    forfeit() {
        this.isSubmit = false;

        this.confirmationService.confirm({
            header: 'Forfeit?',
            message: 'Please confirm to forfeit.',
            accept: () => {
                console.log('Forfeited');
            },
        });
    }
}
