import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';
import { ChipModule } from 'primeng/chip';
import { UserCriteria } from './user-criteria.model';

@Component({
    selector: 'app-matching',
    standalone: true,
    imports: [
        ChipModule,
        MultiSelectModule,
        PanelModule,
        DropdownModule,
        RadioButtonModule,
        AccordionModule,
        ButtonModule,
        FormsModule,
        CommonModule,
    ],
    templateUrl: './matching.component.html',
    styleUrl: './matching.component.css',
})
export class MatchingComponent implements OnInit {
    userCriteria: UserCriteria = {
        topics: null,
        difficulty: null,
    };

    topics: string[] = [];

    difficulties = [
        { label: 'Easy', value: 'easy' },
        { label: 'Medium', value: 'easy' },
        { label: 'Hard', value: 'hard' },
    ];

    programmingLanguages: string[] = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'];
    selectedProgrammingLanguages: string[] | null = null;

    isProcessingMatch = false;

    ngOnInit(): void {
        this.fetchTopics();
    }

    fetchTopics() {
        this.topics = ['Algorithms', 'Data Structures', 'Database Design', 'Machine Learning', 'Web Development'];
    }

    onMatch() {
        console.log({
            topic: this.userCriteria.topics,
            difficulty: this.userCriteria.difficulty,
            programmingLanguage: this.selectedProgrammingLanguages,
        });
    }

    removeTopic(index: number) {
        if (this.userCriteria.topics == null) {
            return;
        }
        this.userCriteria.topics = [
            ...this.userCriteria.topics.slice(0, index),
            ...this.userCriteria.topics.slice(index + 1),
        ];
    }

    removeLanguage(index: number) {
        if (this.selectedProgrammingLanguages == null) {
            return;
        }
        this.selectedProgrammingLanguages = [
            ...this.selectedProgrammingLanguages.slice(0, index),
            ...this.selectedProgrammingLanguages.slice(index + 1),
        ];
    }
}
