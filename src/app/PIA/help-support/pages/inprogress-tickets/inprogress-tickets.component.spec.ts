import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InprogressTicketsComponent } from './inprogress-tickets.component';

describe('InprogressTicketsComponent', () => {
  let component: InprogressTicketsComponent;
  let fixture: ComponentFixture<InprogressTicketsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InprogressTicketsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InprogressTicketsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
