import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProgramStatusViewComponent } from './edit-program-status-view.component';

describe('EditProgramStatusViewComponent', () => {
  let component: EditProgramStatusViewComponent;
  let fixture: ComponentFixture<EditProgramStatusViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditProgramStatusViewComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProgramStatusViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
