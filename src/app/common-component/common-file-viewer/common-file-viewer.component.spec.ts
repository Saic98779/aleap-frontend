import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommonFileViewerComponent } from './common-file-viewer.component';

describe('CommonFileViewerComponent', () => {
  let component: CommonFileViewerComponent;
  let fixture: ComponentFixture<CommonFileViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommonFileViewerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommonFileViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
