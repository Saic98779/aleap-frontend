import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandHoldingAleapComponent } from './hand-holding-aleap.component';

describe('HandHoldingAleapComponent', () => {
  let component: HandHoldingAleapComponent;
  let fixture: ComponentFixture<HandHoldingAleapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandHoldingAleapComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandHoldingAleapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
