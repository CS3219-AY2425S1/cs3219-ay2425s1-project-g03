import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as Y from 'yjs';
import { AuthenticationService } from '../../../_services/authentication.service';
import { WebsocketProvider } from 'y-websocket';
import {NgClass, NgForOf} from '@angular/common';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [NgForOf, NgClass],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements AfterViewInit {
  @Input() ydoc!: Y.Doc;
  @Input() wsProvider!: WebsocketProvider;
  @Input() roomId!: string;

  @ViewChild('chatInput') chatInput!: ElementRef;
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;

  messages: { text: string; sender: string }[] = [];
  yChatArray!: Y.Array<{ text: string; sender: string }>;
  username!: string;

  constructor(private authService: AuthenticationService) {}

  ngAfterViewInit() {
    this.getUsername();
    this.initYdoc();
    this.initArrayListener();
  }

  getUsername() {
    this.username = this.authService.userValue?.username || 'Guest';
  }

  initYdoc() {
    this.yChatArray = this.ydoc.getArray('chatMessages');
  }

  initArrayListener() {
    this.yChatArray.observe(() => {
      this.messages = this.yChatArray.toArray();
      this.scrollToBottom();
    });
  }

  sendMessage() {
    const message = this.chatInput.nativeElement.value.trim();
    if (message) {
      const newMessage = { text: message, sender: this.username };
      this.yChatArray.push([newMessage]);
      this.chatInput.nativeElement.value = '';
      this.scrollToBottom();
    }
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
    }, 100);
  }
}
