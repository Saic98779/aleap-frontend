import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';

import { MaterialModule } from '@app/shared/material/material/material.module';

import { AssignCounsellorComponent } from './assign-counsellor.component';

describe('AssignCounsellorComponent', () => {
  let component: AssignCounsellorComponent;
  let fixture: ComponentFixture<AssignCounsellorComponent>;
  let commonServiceSpy: jasmine.SpyObj<CommonServiceService>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    commonServiceSpy = jasmine.createSpyObj('CommonServiceService', ['getDataByUrl', 'getDataByUrlWithHeaders', 'add']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error', 'warning', 'info']);

    commonServiceSpy.getDataByUrl.and.returnValue(of({ data: [] }));
    commonServiceSpy.getDataByUrlWithHeaders.and.returnValue(of({ data: [] }));
    commonServiceSpy.add.and.returnValue(of({ data: {} }));

    await TestBed.configureTestingModule({
      declarations: [ AssignCounsellorComponent ],
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers: [
        { provide: CommonServiceService, useValue: commonServiceSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignCounsellorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
