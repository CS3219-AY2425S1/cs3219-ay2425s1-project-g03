import { Component, Input, OnInit } from '@angular/core';
import * as Y from 'yjs';

@Component({
    selector: 'app-chat-box',
    standalone: true,
    imports: [],
    templateUrl: './chat-box.component.html',
    styleUrl: './chat-box.component.css',
})
export class ChatBoxComponent implements OnInit {
    @Input() ydoc!: Y.Doc;

    // TODO change this type accordingly
    ychat = new Y.Array<string>();

    ngOnInit() {
        this.initDoc();
    }

    initDoc() {
        this.ychat = this.ydoc.getArray('chat');
    }
}
