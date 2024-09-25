import { Component, OnInit } from '@angular/core';
import { DropdownModule } from 'primeng/dropdown';
import { RadioButtonModule } from 'primeng/radiobutton';
import { AccordionModule } from 'primeng/accordion';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { PanelModule } from 'primeng/panel';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-matching',
  standalone: true,
  imports: [PanelModule, DropdownModule, RadioButtonModule, AccordionModule, ButtonModule, FormsModule, CommonModule],
  templateUrl: './matching.component.html',
  styleUrl: './matching.component.css'
})
export class MatchingComponent implements OnInit {
  topics: any[] = [];
  selectedTopic: string[] | null = null;
  
  difficulties = [
    { label: 'Easy', value: 'easy' }, 
    { label: 'Medium', value: 'easy' }, 
    { label: 'Hard', value: 'hard' }
  ];
  selectedDifficulty: string | null = null;

  programmingLanguages: string[] = ['JavaScript', 'Python', 'Java', 'C++', 'Ruby'];
  selectedProgrammingLanguage: string | null = null;

  isProcessingMatch = false;

  ngOnInit(): void {
    this.fetchTopics();
  }

  fetchTopics() {
    this.topics = [
      { id: 1, name: 'Algorithms' },
      { id: 2, name: 'Data Structures' },
      { id: 3, name: 'Database Design' },
      { id: 4, name: 'Machine Learning' },
      { id: 5, name: 'Web Development' }
    ];
  }

  onMatch() {
    console.log({
      topic: this.selectedTopic,
      difficulty: this.selectedDifficulty,
      programmingLanguage: this.selectedProgrammingLanguage
    });
  }
}
