import { AfterViewInit, Component, ElementRef, Inject, ViewChild, OnInit } from '@angular/core';
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
import { usercolors } from './user-colors';
import { WEBSOCKET_CONFIG } from '../../api.config';
import { AuthenticationService } from '../../../_services/authentication.service';
import { RoomService } from '../room.service';
// The 'prettier-plugin-java' package does not provide TypeScript declaration files.
// We are using '@ts-ignore' to bypass TypeScript's missing type declaration error.

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import prettierPluginJava from 'prettier-plugin-java';
import { SubmitDialogComponent } from '../submit-dialog/submit-dialog.component';
import { ForfeitDialogComponent } from '../forfeit-dialog/forfeit-dialog.component';

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
    providers: [ConfirmationService, MessageService],
    templateUrl: './editor.component.html',
    styleUrl: './editor.component.css',
})
export class EditorComponent implements AfterViewInit, OnInit {
    @ViewChild('editor') editor!: ElementRef;

    state!: EditorState;

    view!: EditorView;

    customTheme!: Extension;

    isSubmit = false;

    ydoc!: Y.Doc;

    yeditorText = new Y.Text('');

    ysubmit = new Y.Map<boolean>();

    isInitiator = false;

    undoManager!: Y.UndoManager;

    wsProvider!: WebsocketProvider;

    roomId!: string;

    constructor(
        @Inject(DOCUMENT) private document: Document,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private authService: AuthenticationService,
        private roomService: RoomService,
    ) {}

    ngOnInit() {
        this.initRoomId();
        this.initConnection();
    }

    ngAfterViewInit() {
        this.setTheme();
        this.setProvider();
        this.setEditorState();
        this.setEditorView();
        this.setCursorPosition();
    }

    initConnection() {
        this.ydoc = new Y.Doc();
        this.wsProvider = new WebsocketProvider(WEBSOCKET_CONFIG.baseUrl, this.roomId, this.ydoc, {
            params: {
                userId: this.authService.userValue?.id as string,
            },
        });
        this.yeditorText = this.ydoc.getText('editorText');
        this.ysubmit = this.ydoc.getMap('submit');
        this.undoManager = new Y.UndoManager(this.yeditorText);
    }

    showTest() {
        this.isSubmit = true;
        this.isInitiator = true;
    }

    initRoomId() {
        this.roomService.getRoomId().subscribe(id => {
            this.roomId = id!;
        });
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

    setProvider() {
        const randomIndex = Math.floor(Math.random() * usercolors.length);

        this.wsProvider.awareness.setLocalStateField('user', {
            name: this.authService.userValue?.username,
            color: usercolors[randomIndex].color,
            colorLight: usercolors[randomIndex].light,
        });
    }

    setEditorState() {
        const undoManager = this.undoManager;
        const myExt: Extension = [
            basicSetup,
            java(),
            this.customTheme,
            oneDark,
            yCollab(this.yeditorText, this.wsProvider.awareness, { undoManager }),
        ];

        this.state = EditorState.create({
            doc: this.yeditorText.toString(),
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
        const cursorPosition = this.state.doc.line(1).from;

        this.view.dispatch({
            selection: {
                anchor: cursorPosition,
                head: cursorPosition,
            },
        });

        this.view.focus();
    }

    onSubmitDialogClose() {
        this.messageService.add({
            severity: 'error',
            summary: 'Fail',
            detail: 'Submission failed: Not all participants agreed. Please try again.',
        });
        this.isSubmit = false;
        this.isInitiator = false;
    }

    onSuccess() {
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'You have successfully submitted!',
        });
        this.isSubmit = false;
        this.isInitiator = false;
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
