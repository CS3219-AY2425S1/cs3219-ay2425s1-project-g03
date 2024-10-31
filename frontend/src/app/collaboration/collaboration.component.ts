import { Component } from '@angular/core';
import { QuestionBoxComponent } from './question-box/question-box.component';
import { EditorComponent } from './editor/editor.component';
import { SplitterModule } from 'primeng/splitter';
import { ChatBoxComponent } from './chat-box/chat-box.component';

@Component({
    selector: 'app-collaboration',
    standalone: true,
    imports: [QuestionBoxComponent, EditorComponent, SplitterModule, ChatBoxComponent],
    templateUrl: './collaboration.component.html',
    styleUrl: './collaboration.component.css',
})
export class CollaborationComponent {}
