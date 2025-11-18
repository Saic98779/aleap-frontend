import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProgramDicComponent } from './view-program-dic.component';

describe('ViewProgramDicComponent', () => {
  let component: ViewProgramDicComponent;
  let fixture: ComponentFixture<ViewProgramDicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewProgramDicComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewProgramDicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
