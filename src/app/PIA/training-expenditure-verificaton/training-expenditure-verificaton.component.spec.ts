import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingExpenditureVerificatonComponent } from './training-expenditure-verificaton.component';

describe('TrainingExpenditureVerificatonComponent', () => {
  let component: TrainingExpenditureVerificatonComponent;
  let fixture: ComponentFixture<TrainingExpenditureVerificatonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrainingExpenditureVerificatonComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingExpenditureVerificatonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
