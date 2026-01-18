import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Tgtpc4NtReportComponent } from './tgtpc4-nt-report.component';

describe('Tgtpc4NtReportComponent', () => {
  let component: Tgtpc4NtReportComponent;
  let fixture: ComponentFixture<Tgtpc4NtReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Tgtpc4NtReportComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Tgtpc4NtReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
