import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';

@Component({
  selector: 'app-add-event',
  templateUrl: './add-event.component.html',
  styleUrls: ['./add-event.component.css']
})
export class AddEventComponent implements OnInit {
  addEventForm!: FormGroup;
  submitted = false;
  loading = false;
  eventId: number | null = null;
  isEditMode = false;

  statesList: any[] = [];
  allDistricts: any[] = [];
  mandalList: any[] = [];
  projectsDropdownList: any[] = [];

  readonly eventTypes = [
    'AWARENESS',
    'TRAINING',
    'WORKSHOP',
    'SEMINAR_WEBINAR',
    'CONFERENCE',
    'CONCLAVE',
    'NETWORK_MEET',
    'HACKATHON',
    'EXHIBITION',
    'MENTORACTIONS',
    'INDUSTRIAL_VISIT',
    'OTHERS'
  ];

  readonly implementingAgencies = [
    'ALEAP',
    'AIC_ALEAP_WEHUB',
    'CED',
    'WEITTC',
    'ACGA'
  ];

  private pendingStateValue: any = null;
  private pendingDistrictValue: any = null;
  private pendingMandalValue: any = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getProjectsDropdown();
    this.getStates();

    this.eventId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.eventId) {
      this.isEditMode = true;
      this.loadEventForEdit(this.eventId);
    }
  }

  get f() {
    return this.addEventForm.controls;
  }

  initializeForm() {
    this.addEventForm = this.fb.group(
      {
        eventType: new FormControl('', [Validators.required]),
        eventTitle: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
        description: new FormControl('', [Validators.required]),
        projectName: new FormControl('', [Validators.required]),
        fundingAgency: new FormControl('', [Validators.required]),
        ministry: new FormControl('', [Validators.required]),
        implementingAgency: new FormControl('ALEAP', [Validators.required]),
        programCoordinatorName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]),
        designation: new FormControl('', [Validators.required]),
        startDate: new FormControl('', [Validators.required]),
        endDate: new FormControl('', [Validators.required]),
        totalDays: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
        startTime: new FormControl('', [Validators.required]),
        endTime: new FormControl('', [Validators.required]),
        houseNoOrDoorNo: new FormControl('', [Validators.required]),
        streetOrBlock: new FormControl('', [Validators.required]),
        stateId: new FormControl('', [Validators.required]),
        districtId: new FormControl('', [Validators.required]),
        mandalId: new FormControl('', [Validators.required]),
        village: new FormControl('', [Validators.required]),
        pinCode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)]),
        totalParticipants: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)])
      },
      { validators: this.validateEventDates as ValidatorFn }
    );
  }

  validateEventDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    return new Date(endDate) < new Date(startDate) ? { invalidEventDate: true } : null;
  };

  onDateChange() {
    const startDate = this.addEventForm.get('startDate')?.value;
    const endDate = this.addEventForm.get('endDate')?.value;

    if (!startDate || !endDate) {
      this.addEventForm.patchValue({ totalDays: '' }, { emitEvent: false });
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) {
      this.addEventForm.patchValue({ totalDays: '' }, { emitEvent: false });
      return;
    }

    const diffInMs = end.getTime() - start.getTime();
    const totalDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
    this.addEventForm.patchValue({ totalDays }, { emitEvent: false });
  }

  getProjectsDropdown() {
    this._commonService.getDataByUrl(APIS.projects.dropdown).subscribe({
      next: (data: any) => {
        this.projectsDropdownList = data?.data || [];
      },
      error: () => {
        this.projectsDropdownList = [];
      }
    });
  }

  getStates() {
    this._commonService.getDataByUrl(APIS.masterList.getStates).subscribe({
      next: (data: any) => {
        this.statesList = data?.data || [];
        this.applyPendingStateSelection();
      },
      error: () => {
        this.statesList = [];
      }
    });
  }

  getDistrictsByState(stateId: any, selectedDistrict: any = null, selectedMandal: any = null) {
    this.allDistricts = [];
    this.mandalList = [];
    this.addEventForm.patchValue({ districtId: '', mandalId: '' }, { emitEvent: false });

    if (!stateId) {
      return;
    }

    this._commonService.getDataByUrl(APIS.masterList.getDistrictsByState + stateId).subscribe({
      next: (data: any) => {
        this.allDistricts = data?.data || [];
        if (selectedDistrict !== null && selectedDistrict !== undefined && selectedDistrict !== '') {
          const districtId = this.resolveDistrictId(selectedDistrict);
          if (districtId) {
            this.addEventForm.patchValue({ districtId }, { emitEvent: false });
            this.getMandalsByDistrict(districtId, selectedMandal);
          }
        }
      },
      error: () => {
        this.allDistricts = [];
      }
    });
  }

  getMandalsByDistrict(districtId: any, selectedMandal: any = null) {
    this.mandalList = [];
    if (!districtId) {
      return;
    }

    this._commonService.getDataByUrl(APIS.masterList.getMandalsByDistrict + districtId).subscribe({
      next: (data: any) => {
        this.mandalList = data?.data || [];
        if (selectedMandal !== null && selectedMandal !== undefined && selectedMandal !== '') {
          const mandalId = this.resolveMandalId(selectedMandal);
          if (mandalId) {
            this.addEventForm.patchValue({ mandalId });
          }
        }
      },
      error: () => {
        this.mandalList = [];
      }
    });
  }

  onStateChange(stateId: any) {
    this.getDistrictsByState(stateId);
  }

  onDistrictChange(districtId: any) {
    this.addEventForm.patchValue({ mandalId: '' });

    if (!districtId) {
      this.mandalList = [];
      return;
    }

    this.getMandalsByDistrict(districtId);
  }

  submitEvent() {
    this.submitted = true;
    Object.keys(this.addEventForm.controls).forEach(key => {
      this.addEventForm.get(key)?.markAsTouched();
    });

    if (this.addEventForm.invalid) {
      return;
    }

    const formValue = this.addEventForm.value;
    const payload: any = {
      eventType: formValue.eventType,
      eventTitle: formValue.eventTitle,
      description: formValue.description,
      projectName: formValue.projectName,
      fundingAgency: formValue.fundingAgency,
      ministry: formValue.ministry,
      implementingAgency: formValue.implementingAgency,
      programCoordinatorName: formValue.programCoordinatorName,
      designation: formValue.designation,
      startDate: formValue.startDate,
      endDate: formValue.endDate,
      totalDays: parseInt(formValue.totalDays, 10),
      startTime: formValue.startTime,
      endTime: formValue.endTime,
      state: this.getSelectedStateName(formValue.stateId),
      district: this.getSelectedDistrictName(formValue.districtId),
      mandal: this.getSelectedMandalName(formValue.mandalId),
      houseNoOrDoorNo: formValue.houseNoOrDoorNo,
      streetOrBlock: formValue.streetOrBlock,
      village: formValue.village,
      pinCode: formValue.pinCode,
      totalParticipants: parseInt(formValue.totalParticipants, 10)
    };

    if (this.isEditMode && this.eventId) {
      payload.eventId = this.eventId;
    }

    this.loading = true;
    const request$ = this.isEditMode && this.eventId
      ? this._commonService.update(APIS.events.update, payload, this.eventId)
      : this._commonService.add(APIS.events.add, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(`Event ${this.isEditMode ? 'updated' : 'added'} successfully`, 'Success');
        this.router.navigate(['/view-event-data']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'add'} event`, 'Error');
      }
    });
  }

  loadEventForEdit(eventId: number) {
    this._commonService.getById(APIS.events.getById, eventId).subscribe({
      next: (res: any) => {
        const event = res?.data ?? res;
        if (!event) {
          this.toastrService.error('Event data not found', 'Error');
          this.router.navigate(['/view-event-data']);
          return;
        }

        this.addEventForm.patchValue({
          eventType: event.eventType || '',
          eventTitle: event.eventTitle || '',
          description: event.description || '',
          projectName: event.projectName || '',
          fundingAgency: event.fundingAgency || '',
          ministry: event.ministry || '',
          implementingAgency: event.implementingAgency || 'ALEAP',
          programCoordinatorName: event.programCoordinatorName || '',
          designation: event.designation || '',
          startDate: this.formatDateValue(event.startDate),
          endDate: this.formatDateValue(event.endDate),
          totalDays: event.totalDays?.toString() || '',
          startTime: this.formatTimeValue(event.startTime),
          endTime: this.formatTimeValue(event.endTime),
          houseNoOrDoorNo: event.houseNoOrDoorNo || '',
          streetOrBlock: event.streetOrBlock || '',
          village: event.village || '',
          pinCode: event.pinCode || '',
          totalParticipants: event.totalParticipants?.toString() || ''
        });

        this.pendingStateValue = event.stateId || event.state || 'Telangana';
        this.pendingDistrictValue = event.districtId || event.district || '';
        this.pendingMandalValue = event.mandalId || event.mandal || '';
        this.applyPendingStateSelection();
        this.onDateChange();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load event', 'Error');
        this.router.navigate(['/view-event-data']);
      }
    });
  }

  goToEvents() {
    this.router.navigate(['/view-event-data']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.eventId) {
      this.loadEventForEdit(this.eventId);
      return;
    }

    this.addEventForm.reset({ implementingAgency: 'ALEAP' });
    this.mandalList = [];
    this.allDistricts = [];
    this.pendingStateValue = 'Telangana';
    this.pendingDistrictValue = null;
    this.pendingMandalValue = null;
    this.applyPendingStateSelection();
  }

  getStateLabel(item: any): string {
    return item?.stateName || item?.state_name || item?.name || item?.state || '';
  }

  getStateId(item: any): any {
    return item?.stateId || item?.state_id || item?.id || item?.stateCode || item?.state;
  }

  getDistrictLabel(item: any): string {
    return item?.districtName || item?.district_name || item?.name || item?.district || '';
  }

  getDistrictId(item: any): any {
    return item?.districtId || item?.district_id || item?.id || item?.districtCode || item?.district;
  }

  getMandalLabel(item: any): string {
    return item?.mandalName || item?.mandal_name || item?.name || item?.mandal || '';
  }

  getMandalId(item: any): any {
    return item?.mandalId || item?.mandal_id || item?.id || item?.mandalCode || item?.mandal;
  }

  private getSelectedDistrictName(districtId: any): string {
    const district = this.allDistricts.find(item => `${this.getDistrictId(item)}` === `${districtId}`);
    return district ? this.getDistrictLabel(district) : districtId;
  }

  private getSelectedStateName(stateId: any): string {
    const state = this.statesList.find(item => `${this.getStateId(item)}` === `${stateId}`);
    return state ? this.getStateLabel(state) : stateId;
  }

  private getSelectedMandalName(mandalId: any): string {
    const mandal = this.mandalList.find(item => `${this.getMandalId(item)}` === `${mandalId}`);
    return mandal ? this.getMandalLabel(mandal) : mandalId;
  }

  private applyPendingStateSelection() {
    if (!this.statesList.length) {
      return;
    }

    const stateSource = this.pendingStateValue || 'Telangana';
    const stateId = this.resolveStateId(stateSource);
    if (!stateId) {
      return;
    }

    this.addEventForm.patchValue({ stateId }, { emitEvent: false });
    this.getDistrictsByState(stateId, this.pendingDistrictValue, this.pendingMandalValue);

    this.pendingStateValue = null;
    this.pendingDistrictValue = null;
    this.pendingMandalValue = null;
  }

  private resolveStateId(value: any): any {
    const normalized = `${value || ''}`.trim().toLowerCase();
    const matchedState = this.statesList.find(item => {
      const itemId = this.getStateId(item);
      const itemName = this.getStateLabel(item);
      return `${itemId}` === `${value}` || `${itemName || ''}`.trim().toLowerCase() === normalized;
    });

    return matchedState ? this.getStateId(matchedState) : '';
  }

  private resolveDistrictId(value: any): any {
    const matchedDistrict = this.allDistricts.find(item => {
      const itemId = this.getDistrictId(item);
      const itemName = this.getDistrictLabel(item);
      return `${itemId}` === `${value}` || itemName?.toLowerCase() === `${value}`.toLowerCase();
    });

    return matchedDistrict ? this.getDistrictId(matchedDistrict) : value;
  }

  private resolveMandalId(value: any): any {
    const matchedMandal = this.mandalList.find(item => {
      const itemId = this.getMandalId(item);
      const itemName = this.getMandalLabel(item);
      return `${itemId}` === `${value}` || itemName?.toLowerCase() === `${value}`.toLowerCase();
    });

    return matchedMandal ? this.getMandalId(matchedMandal) : value;
  }

  private formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
  }

  private formatTimeValue(value: any): string {
    if (!value) {
      return '';
    }

    const time = value.toString();
    if (time.includes('T')) {
      const date = new Date(time);
      if (!isNaN(date.getTime())) {
        return date.toISOString().substring(11, 16);
      }
    }

    return time.length >= 5 ? time.substring(0, 5) : time;
  }
}