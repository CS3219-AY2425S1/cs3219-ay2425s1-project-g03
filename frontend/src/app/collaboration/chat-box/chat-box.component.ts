import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import * as Y from 'yjs';
import { AuthenticationService } from '../../../_services/authentication.service';
import { WebsocketProvider } from 'y-websocket';
import { NgClass, NgForOf } from '@angular/common';
import { ScrollPanelModule } from 'primeng/scrollpanel';

@Component({
    selector: 'app-chat-box',
    standalone: true,
    imports: [NgForOf, NgClass, ScrollPanelModule],
    templateUrl: './chat-box.component.html',
    styleUrls: ['./chat-box.component.css'],
})
export class ChatBoxComponent implements AfterViewInit {
    @Input() ydoc!: Y.Doc;
    @Input() wsProvider!: WebsocketProvider;
    @Input() roomId!: string;

    @ViewChild('chatInput') chatInput!: ElementRef;
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    messages: { text: string; sender: string; timestamp: string; visibleTo: boolean }[] = [];
    yChatArray!: Y.Array<{ text: string; sender: string; timestamp: string; visibleTo: boolean }>;
    yMute!: Y.Map<boolean>;
    username!: string;
    isMuted = false;

    constructor(private authService: AuthenticationService) {}

    ngAfterViewInit() {
        this.getUsername();
        this.initYdoc();
        this.initYMap();
        this.initArrayListener();
    }

    getUsername() {
        this.username = this.authService.userValue?.username || 'Guest';
    }

    initYdoc() {
        this.yChatArray = this.ydoc.getArray('chatMessages');
    }

    initYMap() {
        this.yMute = this.ydoc.getMap('muteStatus');

        if (!this.yMute.has(this.username)) {
            this.yMute.set(this.username, false);
        }

        this.yMute.observe(() => {
            this.isMuted = this.yMute.get(this.username) ?? false;
        });
    }

    initArrayListener() {
        this.yChatArray.observe(() => {
            const allMessages = this.yChatArray.toArray();
            this.messages = allMessages.filter(message => {
                return message.sender === this.username || message.visibleTo || message.sender === 'System';
            });
            this.scrollToBottom();
        });
    }

    sendMessage() {
        if (this.isMuted) return;
        const message = this.chatInput.nativeElement.value.trim();
        if (message) {
            const timestamp = new Date().toLocaleString('en-SG', {
                day: 'numeric',
                month: 'numeric',
                year: '2-digit',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
            });

            const otherUserMuted = this.yMute.get(this.getOtherUsername()) ?? false;

            const newMessage = {
                text: message,
                sender: this.username,
                timestamp,
                visibleTo: !otherUserMuted,
            };

            this.yChatArray.push([newMessage]);
            this.chatInput.nativeElement.value = '';
            this.scrollToBottom();
        }
    }

    toggleMute() {
        const timestamp = new Date().toLocaleString('en-SG', {
            day: 'numeric',
            month: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
        this.isMuted = !this.isMuted;
        this.yMute.set(this.username, this.isMuted);

        if (this.isMuted) {
            this.sendSystemMessage(`${this.username} has muted the conversation.`, timestamp);
        } else {
            this.sendSystemMessage(`${this.username} has un-muted the conversation.`, timestamp);
        }
    }

    sendSystemMessage(text: string, timestamp: string) {
        const systemMessage = {
            text,
            sender: 'System',
            timestamp,
            visibleTo: true,
        };
        this.yChatArray.push([systemMessage]);
    }

    getOtherUsername(): string {
        const allUsers = Array.from(this.yMute.keys());
        return allUsers.find(user => user !== this.username) || 'Guest';
    }

    scrollToBottom() {
        setTimeout(() => {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }, 100);
    }
}
