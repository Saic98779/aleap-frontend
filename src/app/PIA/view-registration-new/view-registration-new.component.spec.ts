import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRegistrationNewComponent } from './view-registration-new.component';

describe('ViewRegistrationNewComponent', () => {
  let component: ViewRegistrationNewComponent;
  let fixture: ComponentFixture<ViewRegistrationNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewRegistrationNewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewRegistrationNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
