import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tgtpc4NtHandholdingComponent } from './tgtpc4-nt-handholding.component';

describe('Tgtpc4NtHandholdingComponent', () => {
  let component: Tgtpc4NtHandholdingComponent;
  let fixture: ComponentFixture<Tgtpc4NtHandholdingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Tgtpc4NtHandholdingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tgtpc4NtHandholdingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
