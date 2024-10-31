import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as Y from 'yjs';
import { AuthenticationService } from '../../../_services/authentication.service';
import { WebsocketProvider } from 'y-websocket';
import { NgForOf } from '@angular/common';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [NgForOf],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements OnInit, AfterViewInit {
  @Input() ydoc!: Y.Doc;
  @Input() wsProvider!: WebsocketProvider;
  @Input() roomId!: string;

  @ViewChild('chatInput') chatInput!: ElementRef;

  messages: string[] = [];
  yChatArray!: Y.Array<string>;
  userId!: string;

  constructor(private authService: AuthenticationService) {}

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    this.getUserId();
    this.initYdoc();
    this.initArrayListener();
  }

  getUserId() {
    this.userId = this.authService.userValue?.id || 'Guest';
  }

  initYdoc() {
    this.yChatArray = this.ydoc.getArray<string>('chatMessages');
  }

  initArrayListener() {
    this.yChatArray.observe(() => {
      this.messages = this.yChatArray.toArray();
    });
  }

  sendMessage() {
    const message = this.chatInput.nativeElement.value.trim();
    if (message) {
      const formattedMessage = `${this.userId}: ${message}`;

      this.yChatArray.push([formattedMessage]);

      this.chatInput.nativeElement.value = '';
    }
  }
}
