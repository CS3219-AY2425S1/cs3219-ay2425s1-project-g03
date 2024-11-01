import { Component, OnInit } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DifficultyLevels } from '../questions/difficulty-levels.enum';
import { ChipModule } from 'primeng/chip';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CollabService } from '../../_services/collab.service';
import { RoomData, CollabUser } from '../collaboration/collab.model';
import { ToastModule } from 'primeng/toast';
import { AuthenticationService } from '../../_services/authentication.service';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [TableModule, ButtonModule, ChipModule, ToastModule, ProgressSpinnerModule],
    providers: [CollabService, MessageService],
    templateUrl: './home.component.html',
    styleUrl: './home.component.css',
})
export class HomeComponent implements OnInit {
    loading = true;
    activeSessions: RoomData[] = [];
    difficultyLevels = DifficultyLevels;
    userId!: string;

    constructor(
        private collabService: CollabService,
        private messageService: MessageService,
        private authService: AuthenticationService,
        private router: Router,
    ) {}

    ngOnInit() {
        this.getActiveSessions();
        this.userId = this.authService.userValue!.id;
    }

    goToCollab(roomId: string) {
        this.router.navigate(['/collab'], { queryParams: { roomId } });
    }

    goToMatch() {
        this.router.navigate(['/matching']);
    }

    getPeer(users: CollabUser[]) {
        return users.find(user => user.id !== this.userId)?.username;
    }

    getActiveSessions() {
        this.collabService.getRoomsWithQuery(true).subscribe({
            next: response => {
                this.activeSessions = response.data;
            },
            error: () => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to retrieve room data',
                    life: 3000,
                });
            },
            complete: () => {
                this.loading = false;
            },
        });
    }
}
