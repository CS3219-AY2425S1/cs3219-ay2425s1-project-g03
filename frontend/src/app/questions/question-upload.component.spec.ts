import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionUploadComponent } from './question-upload.component';

describe('QuestionUploadComponent', () => {
    let component: QuestionUploadComponent;
    let fixture: ComponentFixture<QuestionUploadComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [QuestionUploadComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(QuestionUploadComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
