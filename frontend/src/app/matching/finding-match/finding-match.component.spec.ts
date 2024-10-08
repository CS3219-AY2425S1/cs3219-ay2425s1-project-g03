import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FindingMatchComponent } from './finding-match.component';

describe('FindingMatchComponent', () => {
    let component: FindingMatchComponent;
    let fixture: ComponentFixture<FindingMatchComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [FindingMatchComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(FindingMatchComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
