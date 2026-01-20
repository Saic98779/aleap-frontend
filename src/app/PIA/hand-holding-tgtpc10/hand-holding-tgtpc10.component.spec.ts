import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HandHoldingTgtpc10Component } from './hand-holding-tgtpc10.component';

describe('HandHoldingTgtpc10Component', () => {
  let component: HandHoldingTgtpc10Component;
  let fixture: ComponentFixture<HandHoldingTgtpc10Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HandHoldingTgtpc10Component ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HandHoldingTgtpc10Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
