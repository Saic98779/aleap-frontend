import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NonTrainingExpVerficationTrackerComponent } from './non-training-exp-verfication-tracker.component';

describe('NonTrainingExpVerficationTrackerComponent', () => {
  let component: NonTrainingExpVerficationTrackerComponent;
  let fixture: ComponentFixture<NonTrainingExpVerficationTrackerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NonTrainingExpVerficationTrackerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NonTrainingExpVerficationTrackerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
