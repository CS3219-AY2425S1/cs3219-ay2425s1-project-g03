import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetryMatchingComponent } from './retry-matching.component';

describe('RetryMatchingComponent', () => {
    let component: RetryMatchingComponent;
    let fixture: ComponentFixture<RetryMatchingComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RetryMatchingComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RetryMatchingComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
