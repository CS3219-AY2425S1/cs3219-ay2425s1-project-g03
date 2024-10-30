import { AfterViewInit, Component, ElementRef, ViewChild, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorState, Extension } from '@codemirror/state';
import { basicSetup } from 'codemirror';
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
import { Router } from '@angular/router';
import { awarenessData } from '../collab.model';

enum WebSocketCode {
    AUTH_FAILED = 4000,
    ROOM_CLOSED = 4001,
}

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
export class EditorComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChild('editor') editor!: ElementRef;
    @ViewChild(ForfeitDialogComponent) forfeitChild!: ForfeitDialogComponent;

    state!: EditorState;
    view!: EditorView;
    ydoc!: Y.Doc;
    yeditorText = new Y.Text('');
    ysubmit = new Y.Map<boolean>();
    yforfeit = new Y.Map<boolean>();
    undoManager!: Y.UndoManager;
    customTheme!: Extension;
    wsProvider!: WebsocketProvider;

    isSubmit = false;
    isInitiator = false;
    isForfeitClick = false;
    roomId!: string;
    numUniqueUsers = 0;

    constructor(
        private messageService: MessageService,
        private authService: AuthenticationService,
        private roomService: RoomService,
        private router: Router,
        private changeDetector: ChangeDetectorRef,
    ) {}

    ngOnDestroy() {
        // This lets the client to disconnect from the websocket on re-route to another page.
        this.wsProvider.destroy();
    }

    ngOnInit() {
        this.initRoomId();
        this.initConnection();
        this.getNumOfConnectedUsers();
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
        const websocketUrl = WEBSOCKET_CONFIG.baseUrl + 'collaboration/';
        this.wsProvider = new WebsocketProvider(websocketUrl, this.roomId, this.ydoc, {
            params: {
                userId: this.authService.userValue?.id as string,
            },
        });

        this.wsProvider.ws!.onclose = (event: { code: number; reason: string }) => {
            if (event.code === WebSocketCode.AUTH_FAILED || event.code === WebSocketCode.ROOM_CLOSED) {
                console.error('WebSocket authorization failed:', event.reason);
                this.router.navigate(['/matching']);
            }
        };

        this.yeditorText = this.ydoc.getText('editorText');
        this.ysubmit = this.ydoc.getMap('submit');
        this.yforfeit = this.ydoc.getMap('forfeit');
        this.undoManager = new Y.UndoManager(this.yeditorText);
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

    showSubmitDialog() {
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
            userId: this.authService.userValue?.id,
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
