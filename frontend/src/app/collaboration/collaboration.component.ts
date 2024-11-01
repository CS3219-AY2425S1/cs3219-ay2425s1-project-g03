import { Component, OnInit, OnDestroy } from '@angular/core';
import { QuestionBoxComponent } from './question-box/question-box.component';
import { EditorComponent } from './editor/editor.component';
import { SplitterModule } from 'primeng/splitter';
import { ChatBoxComponent } from './chat-box/chat-box.component';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { WEBSOCKET_CONFIG } from '../api.config';
import { RoomService } from './room.service';
import { AuthenticationService } from '../../_services/authentication.service';
import { WebSocketCode } from './websocket-code.enum';
import { Router } from '@angular/router';

@Component({
    selector: 'app-collaboration',
    standalone: true,
    imports: [QuestionBoxComponent, EditorComponent, SplitterModule, ChatBoxComponent],
    templateUrl: './collaboration.component.html',
    styleUrl: './collaboration.component.css',
})
export class CollaborationComponent implements OnInit, OnDestroy {
    ydoc!: Y.Doc;
    roomId!: string;
    wsProvider!: WebsocketProvider;

    constructor(
        private roomService: RoomService,
        private authService: AuthenticationService,
        private router: Router,
    ) {}

    ngOnDestroy() {
        // This lets the client to disconnect from the websocket on re-route to another page.
        this.wsProvider.destroy();
    }

    ngOnInit() {
        this.initRoomId();
        this.initConnection();
    }

    initRoomId() {
        this.roomService.getRoomId().subscribe(id => {
            this.roomId = id!;
        });
    }

    initConnection() {
        this.ydoc = new Y.Doc();

        const websocketUrl = WEBSOCKET_CONFIG.baseUrl + 'collaboration/';
        this.wsProvider = new WebsocketProvider(websocketUrl, this.roomId, this.ydoc, {
            params: {
              accessToken: this.authService.userValue?.accessToken || '',
            },
        });

        this.wsProvider.ws!.onclose = (event: { code: number; reason: string }) => {
            if (event.code === WebSocketCode.AUTH_FAILED || event.code === WebSocketCode.ROOM_CLOSED) {
                console.error('WebSocket authorization failed:', event.reason);
                this.router.navigate(['/home']);
            }
        };
    }
}
