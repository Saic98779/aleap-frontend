import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tgtpc10HandholdingComponent } from './tgtpc10-handholding.component';

describe('Tgtpc10HandholdingComponent', () => {
  let component: Tgtpc10HandholdingComponent;
  let fixture: ComponentFixture<Tgtpc10HandholdingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Tgtpc10HandholdingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tgtpc10HandholdingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
