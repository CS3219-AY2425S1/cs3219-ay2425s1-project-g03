import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmitDialogComponent } from './submit-dialog.component';

describe('SubmitDialogComponent', () => {
    let component: SubmitDialogComponent;
    let fixture: ComponentFixture<SubmitDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SubmitDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SubmitDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
