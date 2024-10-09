import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionBoxComponent } from './question-box.component';

describe('QuestionBoxComponent', () => {
    let component: QuestionBoxComponent;
    let fixture: ComponentFixture<QuestionBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuestionBoxComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
