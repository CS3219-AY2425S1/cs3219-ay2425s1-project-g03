import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForfeitDialogComponent } from './forfeit-dialog.component';

describe('ForfeitDialogComponent', () => {
    let component: ForfeitDialogComponent;
    let fixture: ComponentFixture<ForfeitDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ForfeitDialogComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(ForfeitDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
