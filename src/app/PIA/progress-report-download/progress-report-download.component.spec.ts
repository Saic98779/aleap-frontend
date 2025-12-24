import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressReportDownloadComponent } from './progress-report-download.component';

describe('ProgressReportDownloadComponent', () => {
  let component: ProgressReportDownloadComponent;
  let fixture: ComponentFixture<ProgressReportDownloadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgressReportDownloadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgressReportDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
