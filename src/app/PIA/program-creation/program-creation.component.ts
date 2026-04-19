import { Component, OnInit, AfterViewInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import moment from "moment";
declare var bootstrap: any;
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

@Component({
  selector: 'app-program-creation',
  templateUrl: './program-creation.component.html',
  styleUrls: ['./program-creation.component.css']
})
export class ProgramCreationComponent implements OnInit, AfterViewInit {
  programCreationMain!: FormGroup;
  addEventForm!: FormGroup;
  programCreationSub!: FormGroup;
  locationForm!: FormGroup;
  programId: string | null = null;
  editEventId: string | null = null;
  isEventEditMode = false;
  agencyId:any
  selectedProjectTitle = '';
  isRampProject = true;
  statesList: any[] = [];
  eventDistrictList: any[] = [];
  eventMandalList: any[] = [];
  private pendingEventStateValue: any = null;
  private pendingEventDistrictValue: any = null;
  private pendingEventMandalValue: any = null;
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
  @ViewChild("pickerstart") pickerstart!: TemplateRef<any>;
  @ViewChild("pickerEnd") pickerEnd!: TemplateRef<any>;
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.formDetails();   
    this.formDetailsEvent();
    this.getAllDistricts() 
    this.formDetailsLocation();    
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;    
    this.getProgramLocation();    
    this.getProjectsDropdown();
    this.getProgramTypeData();
    this.getAllActivityList()
    this.getProgramsByAgency()
  }

  ngOnInit(): void {
    this.getStatesForEvents();
    this.programId = this.route.snapshot.paramMap.get('id');
    const editMode = this.route.snapshot.queryParamMap.get('mode');
    const queryProjectId = this.route.snapshot.queryParamMap.get('projectId');

    if (queryProjectId) {
      this.programCreationMain.patchValue({ projectId: queryProjectId }, { emitEvent: false });
      this.addEventForm.patchValue({ projectId: queryProjectId }, { emitEvent: false });
      this.onProjectSelectionChange(queryProjectId);
    }

    if (this.programId) {
      if (editMode === 'event') {
        this.isEventEditMode = true;
        this.editEventId = this.programId;
        this.getEventDetailsById(this.programId);
      } else {
        this.isEventEditMode = false;
        this.getProgramDetailsById(this.programId);
      }
    }
    console.log(this.programId, 'programId');
    //(document.getElementById('collapseExample') as HTMLElement).classList.add('show');
    
    this.programCreationMain.controls['activityId'].valueChanges.subscribe((activityId: any) => {
      if(activityId) this.getSubActivitiesList(activityId);
    });

    this.programCreationMain.controls['projectId'].valueChanges.subscribe((projectId: any) => {
      this.onProjectSelectionChange(projectId);
    });
  }
  allDistricts:any
  getAllDistricts(){
    this.allDistricts = []
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
      },
      error: (err: any) => {
        this.allDistricts = [];
      }
    })
  }
  MandalList:any
  GetMandalByDistrict(event: any) {
    this.MandalList=[]
    this._commonService.getDataByUrl(APIS.masterList.getMandalName + event).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;
      },
      error: (err: any) => {
        this.MandalList = [];
      }
    })

  }
  activityList:any
  subActivitiesList:any
  getAllActivityList(){
    this.subActivitiesList = []
    this._commonService.getById(APIS.programCreation.getActivityListbyId,this.agencyId).subscribe({
      next: (data: any) => {
        this.activityList = data.data;
      },
      error: (err: any) => {
        this.activityList = [];
      }
    })
  }

  getSubActivitiesList(activityId: any){
    this._commonService.getDataByUrl(`${APIS.programCreation.getSubActivityListByActivity+'/'+activityId}`).subscribe({
      next: (data: any) => {
        this.subActivitiesList = data.data.subActivities;
      },
      error: (err: any) => {
        this.subActivitiesList = [];
      }
    })
  }

  ngAfterViewInit(): void {
    // setTimeout(() => {
    //   new DataTable('#creation-table', {
    //     scrollY: "415px",
    //     scrollX: true,
    //     scrollCollapse: true,
    //     autoWidth: true,
    //     paging: false,
    //     info: false,
    //     searching: false,
    //     destroy: true,
    //   });
    // }, 500);
  }

  get f2() {
    return this.programCreationMain.controls;
  }

  get ef() {
    return this.addEventForm.controls;
  }

  get fLocation() {
    return this.locationForm.controls;
  }

  formDetails() {
    
    this.programCreationMain = new FormGroup({
      activityId: new FormControl("",),
      subActivityId: new FormControl("", ),
      projectId: new FormControl("", [Validators.required]),
      programType: new FormControl("", ),
      programTitle: new FormControl("", [Validators.required, Validators.pattern(/^[^\s].*/)]),
      startDate: new FormControl("", [Validators.required]),
      endDate: new FormControl("", [Validators.required]),
      startTime: new FormControl("", [Validators.required]),
      endTime: new FormControl("", [Validators.required]),
      spocName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]),
      spocContactNo: new FormControl("", [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      programLocation: new FormControl("", [Validators.required]),
      kpi: new FormControl("", [Validators.required]),
    }, { validators: this.validateDates as ValidatorFn });
    // Mark all controls as touched to show validation errors immediately
    //Object.values(this.programCreationMain.controls).forEach(control => control.markAsTouched());
  }

  formDetailsEvent() {
    this.addEventForm = new FormGroup(
      {
        projectId: new FormControl('', [Validators.required]),
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

  validateDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      formGroup.get('endDate')?.setErrors({ invalidEndDate: true });
      return { invalidEndDate: true };
    } else {
      formGroup.get('endDate')?.setErrors(null);
      return null;
    }
  }

  validateEventDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('startDate')?.value;
    const endDate = formGroup.get('endDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    return new Date(endDate) < new Date(startDate) ? { invalidEventDate: true } : null;
  };

  onEventDateChange() {
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

  getStatesForEvents() {
    this._commonService.getDataByUrl(APIS.masterList.getStates).subscribe({
      next: (data: any) => {
        this.statesList = data?.data || [];
        this.applyPendingEventStateSelection();
      },
      error: () => {
        this.statesList = [];
      }
    });
  }

  getEventDistrictsByState(stateId: any, selectedDistrict: any = null, selectedMandal: any = null) {
    this.eventDistrictList = [];
    this.eventMandalList = [];
    this.addEventForm.patchValue({ districtId: '', mandalId: '' }, { emitEvent: false });

    if (!stateId) {
      return;
    }

    this._commonService.getDataByUrl(APIS.masterList.getDistrictsByState + stateId).subscribe({
      next: (data: any) => {
        this.eventDistrictList = data?.data || [];
        if (selectedDistrict !== null && selectedDistrict !== undefined && selectedDistrict !== '') {
          const districtId = this.resolveDistrictIdFromList(selectedDistrict);
          if (districtId) {
            this.addEventForm.patchValue({ districtId }, { emitEvent: false });
            this.getEventMandalsByDistrict(districtId, selectedMandal);
          }
        }
      },
      error: () => {
        this.eventDistrictList = [];
      }
    });
  }

  getEventMandalsByDistrict(districtId: any, selectedMandal: any = null) {
    this.addEventForm.patchValue({ mandalId: '' });
    this.eventMandalList = [];

    if (!districtId) {
      return;
    }

    this._commonService.getDataByUrl(APIS.masterList.getMandalsByDistrict + districtId).subscribe({
      next: (data: any) => {
        this.eventMandalList = data?.data || [];
        if (selectedMandal !== null && selectedMandal !== undefined && selectedMandal !== '') {
          const mandalId = this.resolveMandalIdFromEvent({ mandal: selectedMandal, mandalId: selectedMandal });
          this.addEventForm.patchValue({ mandalId: mandalId || '' }, { emitEvent: false });
        }
      },
      error: () => {
        this.eventMandalList = [];
      }
    });
  }

  onEventStateChange(stateId: any) {
    this.getEventDistrictsByState(stateId);
  }

  onEventDistrictChange(districtId: any) {
    this.getEventMandalsByDistrict(districtId);
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

  private resolveDistrictIdFromEvent(eventData: any): any {
    const directId = eventData?.districtId || eventData?.district_id;
    if (directId) {
      return directId;
    }

    const districtName = `${eventData?.district || ''}`.trim().toUpperCase();
    if (!districtName || !Array.isArray(this.eventDistrictList)) {
      return '';
    }

    const matchedDistrict = this.eventDistrictList.find((item: any) => {
      const label = `${this.getDistrictLabel(item) || ''}`.trim().toUpperCase();
      return label === districtName;
    });

    return matchedDistrict ? this.getDistrictId(matchedDistrict) : '';
  }

  private resolveMandalIdFromEvent(eventData: any): any {
    const directId = eventData?.mandalId || eventData?.mandal_id;
    if (directId) {
      return directId;
    }

    const mandalName = `${eventData?.mandal || ''}`.trim().toUpperCase();
    if (!mandalName || !Array.isArray(this.eventMandalList)) {
      return '';
    }

    const matchedMandal = this.eventMandalList.find((item: any) => {
      const label = `${this.getMandalLabel(item) || ''}`.trim().toUpperCase();
      return label === mandalName;
    });

    return matchedMandal ? this.getMandalId(matchedMandal) : '';
  }

  private getSelectedDistrictName(districtId: any): string {
    const district = this.eventDistrictList.find((item: any) => `${this.getDistrictId(item)}` === `${districtId}`);
    return district ? this.getDistrictLabel(district) : districtId;
  }

  private getSelectedStateName(stateId: any): string {
    const state = this.statesList.find((item: any) => `${this.getStateId(item)}` === `${stateId}`);
    return state ? this.getStateLabel(state) : stateId;
  }

  private resolveStateIdFromList(value: any): any {
    const normalized = `${value || ''}`.trim().toLowerCase();
    const matchedState = this.statesList.find((item: any) => {
      const itemId = this.getStateId(item);
      const itemName = this.getStateLabel(item);
      return `${itemId}` === `${value}` || `${itemName || ''}`.trim().toLowerCase() === normalized;
    });
    return matchedState ? this.getStateId(matchedState) : '';
  }

  private resolveDistrictIdFromList(value: any): any {
    const normalized = `${value || ''}`.trim().toLowerCase();
    const matchedDistrict = this.eventDistrictList.find((item: any) => {
      const itemId = this.getDistrictId(item);
      const itemName = this.getDistrictLabel(item);
      return `${itemId}` === `${value}` || `${itemName || ''}`.trim().toLowerCase() === normalized;
    });
    return matchedDistrict ? this.getDistrictId(matchedDistrict) : value;
  }

  private applyPendingEventStateSelection() {
    if (!this.statesList.length) {
      return;
    }

    const stateSource = this.pendingEventStateValue || 'Telangana';
    const stateId = this.resolveStateIdFromList(stateSource);
    if (!stateId) {
      return;
    }

    this.addEventForm.patchValue({ stateId }, { emitEvent: false });
    this.getEventDistrictsByState(stateId, this.pendingEventDistrictValue, this.pendingEventMandalValue);

    this.pendingEventStateValue = null;
    this.pendingEventDistrictValue = null;
    this.pendingEventMandalValue = null;
  }

  private getSelectedMandalName(mandalId: any): string {
    const mandal = this.eventMandalList.find((item: any) => `${this.getMandalId(item)}` === `${mandalId}`);
    return mandal ? this.getMandalLabel(mandal) : mandalId;
  }

  private getProjectTitleById(projectId: any): string {
    const project = this.projectsDropdownList.find((item: any) => `${item?.project_id ?? item?.projectId}` === `${projectId}`);
    return project?.titleOfProject || project?.projectTitle || project?.projectName || '';
  }

  private getProjectIdByName(projectName: any): any {
    const normalizedName = `${projectName || ''}`.trim().toUpperCase();
    if (!normalizedName) {
      return '';
    }

    const project = this.projectsDropdownList.find((item: any) => {
      const title = `${item?.titleOfProject || item?.projectTitle || item?.projectName || ''}`.trim().toUpperCase();
      return title === normalizedName;
    });

    return project?.project_id ?? project?.projectId ?? '';
  }

  onProjectSelectionChange(projectId: any) {
    this.selectedProjectTitle = this.getProjectTitleById(projectId);
    this.isRampProject = `${this.selectedProjectTitle}`.trim().toUpperCase() === 'RAMP';

    this.addEventForm.patchValue({
      projectId: projectId || '',
      projectName: this.selectedProjectTitle || ''
    });

    if (projectId) {
      this.getProjectDetailsById(projectId);
      return;
    }

    this.addEventForm.patchValue({
      fundingAgency: '',
      ministry: '',
      implementingAgency: 'ALEAP'
    });
  }

  getProjectDetailsById(projectId: any) {
    this._commonService.getById(APIS.projects.getById, projectId).subscribe({
      next: (res: any) => {
        const project = res?.data ?? res ?? {};
        const projectName = this.getValueByKeys(project, ['titleOfProject', 'projectTitle', 'projectName', 'name']) || this.selectedProjectTitle;
        const fundingAgency = this.getValueByKeys(project, ['fundingAgency', 'fundingAgencyName', 'fundingSource']);
        const ministry = this.getValueByKeys(project, ['ministry', 'ministryOrConcernedDepartment']);
        const implementingAgency = this.getValueByKeys(project, ['implementingAgency', 'implementingAgencyName', 'agencyName']) || 'ALEAP';

        this.addEventForm.patchValue({
          projectName,
          fundingAgency,
          ministry,
          implementingAgency
        });
      },
      error: () => {
        this.toastrService.error('Failed to load project details', 'Project Error');
      }
    });
  }

  private getValueByKeys(source: any, keys: string[]): string {
    for (const key of keys) {
      const value = source?.[key];
      if (value !== null && value !== undefined && `${value}`.trim() !== '') {
        return `${value}`;
      }
    }
    return '';
  }

  onSubmitByProject() {
    if (this.isRampProject) {
      this.submitProgramCreation();
      return;
    }

    this.submitEventFromProgramCreation();
  }

  submitEventFromProgramCreation() {
    Object.keys(this.addEventForm.controls).forEach((key) => {
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
      projectName: this.selectedProjectTitle || formValue.projectName,
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

    this.loading = true;
    const request$ = this.isEventEditMode && this.editEventId
      ? this._commonService.update(APIS.events.update, payload, this.editEventId)
      : this._commonService.add(APIS.events.add, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(this.isEventEditMode ? 'Event updated successfully' : 'Event added successfully', 'Success');
        this.router.navigate(['/veiw-program-creation']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || (this.isEventEditMode ? 'Failed to update event' : 'Failed to add event'), 'Error');
      }
    });
  }

  getEventDetailsById(eventId: string) {
    this._commonService.getById(APIS.events.getById, eventId).subscribe({
      next: (res: any) => {
        const eventData = res?.data ?? res ?? {};
        const resolvedProjectId = eventData?.projectId || eventData?.project_id || this.getProjectIdByName(eventData?.projectName) || this.addEventForm.get('projectId')?.value || '';

        if (resolvedProjectId) {
          this.programCreationMain.patchValue({ projectId: resolvedProjectId }, { emitEvent: false });
          this.addEventForm.patchValue({ projectId: resolvedProjectId }, { emitEvent: false });
          this.onProjectSelectionChange(resolvedProjectId);
        } else {
          this.selectedProjectTitle = `${eventData?.projectName || ''}`;
          this.isRampProject = `${this.selectedProjectTitle}`.trim().toUpperCase() === 'RAMP';
        }

        this.addEventForm.patchValue({
          projectId: resolvedProjectId || '',
          eventType: eventData?.eventType || '',
          eventTitle: eventData?.eventTitle || '',
          description: eventData?.description || '',
          projectName: eventData?.projectName || this.selectedProjectTitle || '',
          fundingAgency: eventData?.fundingAgency || '',
          ministry: eventData?.ministry || '',
          implementingAgency: eventData?.implementingAgency || 'ALEAP',
          programCoordinatorName: eventData?.programCoordinatorName || '',
          designation: eventData?.designation || '',
          startDate: this.normalizeDateForInput(eventData?.startDate),
          endDate: this.normalizeDateForInput(eventData?.endDate),
          totalDays: eventData?.totalDays || '',
          startTime: eventData?.startTime ? this.convertTo24HourFormat(eventData.startTime) : '',
          endTime: eventData?.endTime ? this.convertTo24HourFormat(eventData.endTime) : '',
          houseNoOrDoorNo: eventData?.houseNoOrDoorNo || '',
          streetOrBlock: eventData?.streetOrBlock || '',
          stateId: '',
          districtId: '',
          mandalId: '',
          village: eventData?.village || '',
          pinCode: eventData?.pinCode || '',
          totalParticipants: eventData?.totalParticipants || ''
        });

        this.pendingEventStateValue = eventData?.stateId || eventData?.state || 'Telangana';
        this.pendingEventDistrictValue = eventData?.districtId || eventData?.district || '';
        this.pendingEventMandalValue = eventData?.mandalId || eventData?.mandal || '';
        this.applyPendingEventStateSelection();
       

        this.onEventDateChange();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Error fetching event details!', 'Error');
      }
    });
  }

  formDetailsLocation() {
    this.locationForm = new FormGroup({
      locationName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z ]+$/)]),
      ownershipType: new FormControl(""),
      typeOfVenue: new FormControl("", [Validators.required]),
      latitude: new FormControl(""),
      longitude: new FormControl("",),
      googleMapUrl: new FormControl("",[Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]),
      OthersType: new FormControl("",),
      capacity: new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
      agencyId: new FormControl("",),
      filePath: new FormControl("",),
      district: new FormControl("",),
      mandal: new FormControl("",),
    });
  }

  get addDynamicRow() {
    return this.programCreationSub?.get("details") as FormArray;
  }

  initiateForm(): FormGroup {
    return this.fb.group({
      sessionDate: "",
      startTime: "",
      endTime: "",
      sessionTypeName: "",
      sessionTypeMethodology: "",
      sessionDetails: "",
      resourceId: '',
      //meterialType: "",
      uploaFiles: [null],
      sessionStreamingUrl: "",
      videoUrls: []
    });
  }

  onAddRow(index: any) {
    const control = this.programCreationSub?.get("details") as FormArray;
    control.push(this.initiateForm());
  }

  onRemoveRow(rowIndex: number) {
    const control = this.programCreationSub?.get("details") as FormArray;
    control.removeAt(rowIndex);
  }

  convertToBlob(file: File): Blob {
    return new Blob([file]);
  }

  formatTime(timeValue: any) {
    if (timeValue) {
      const [hours, minutes] = timeValue.split(':').map(Number);
      const suffix = hours >= 12 ? 'PM' : 'AM';
      const formattedHours = hours % 12 || 12;
      return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${suffix}`;
    }
    return timeValue;
  }
  
  getProgrameIdBasesOnSave:any
  loading = false;
  submitProgramCreation() {
    this.getProgrameIdBasesOnSave = ''
    let maindata = { ...this.programCreationMain.value };
    maindata['startTime'] = this.formatTime(maindata['startTime'])
    maindata['endTime'] = this.formatTime(maindata['endTime'])
    maindata['startDate'] = this.convertToISOFormat(maindata['startDate'])
    maindata['endDate'] = moment(maindata['endDate']).format('DD-MM-YYYY')
    maindata['locationId'] = Number(this.programCreationMain.value?.programLocation)
    maindata['agencyId'] = Number(this.agencyId)
    maindata['activityId'] = Number(this.programCreationMain.value?.activityId)
    maindata['subActivityId'] = Number(this.programCreationMain.value?.subActivityId)
    maindata['projectId'] = Number(this.programCreationMain.value?.projectId)
    
    this.loading = true;
    if(this.programId) {
      maindata['programId'] = Number(this.programId)
      this._commonService.add(APIS.programCreation.updateProgram, maindata).subscribe({
        next: (data) => {      
          this.loading = false;    
          this.toastrService.success('Program Updated Successfully', "Success!");
          this.getProgramDetailsById(maindata['programId']);      
          this.redirect()    
        },
        error: (err) => {
          this.loading = false;
          this.toastrService.error(err.message, "Program Creation Error!");
          new Error(err);
        },
      })
    }else {
      this._commonService.add(APIS.programCreation.addprogram, maindata).subscribe({
        next: (data) => {
          this.loading = false;
          this.getProgrameIdBasesOnSave = data.data
          this.toastrService.success('Program Created Successfully', "Success!");
          this.programCreationMain.reset();
          this.getProgramsByAgency()
        },
        error: (err) => {
          this.loading = false;
          this.toastrService.error(err.message, "Program Creation Error!");
          new Error(err);
        },
      })
    }
    
  }

  redirect() {
    this.router.navigate(['/veiw-program-creation']);
  }

  onModalSubmitLocation() {
    let payload: any = { ...this.locationForm.value };
    payload['typeOfVenue'] == 'Others' ? payload['typeOfVenue'] = payload['OthersType'] : payload['typeOfVenue'];
    payload['agencyId'] = this.agencyId;
    delete payload['OthersType'];
    this._commonService
      .add(APIS.programCreation.addLocation, payload)
      .subscribe({
        next: (data) => {
          this.toastrService.success('Location Added Successfully', "Success!");
          this.locationForm.reset();
          this.getProgramLocation();
        },
        error: (err) => {
          this.toastrService.error(err.message, "Location Creation Error!");
          new Error(err);
        },
      });
  }

  getProgramLocationData: any = [];
  getProgramLocation() {
    this._commonService
      .getById(APIS.programCreation.getLocation, this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getProgramLocationData = data.data;
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

  getProgramType: any = [];
  projectsDropdownList: any[] = [];

  private resolveProjectId(program: any): any {
    const directId = program?.projectId || program?.project_id || program?.project?.projectId || program?.project?.project_id;
    if (directId) {
      return directId;
    }

    const projectName = `${
      program?.projectName ||
      program?.projectTitle ||
      program?.titleOfProject ||
      program?.project?.titleOfProject ||
      program?.project?.projectTitle ||
      ''
    }`.trim().toUpperCase();

    if (!projectName) {
      return '';
    }

    const matched = this.projectsDropdownList.find((item: any) => {
      const name = `${item?.titleOfProject || item?.projectTitle || item?.projectName || ''}`.trim().toUpperCase();
      return name === projectName;
    });

    return matched?.project_id ?? matched?.projectId ?? '';
  }

  private normalizeDateForInput(value: any): string {
    if (!value) {
      return '';
    }

    const dateText = `${value}`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateText)) {
      return dateText;
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(dateText)) {
      const [day, month, year] = dateText.split('-');
      return `${year}-${month}-${day}`;
    }

    const parsed = new Date(dateText);
    if (isNaN(parsed.getTime())) {
      return '';
    }

    return parsed.toISOString().split('T')[0];
  }

  getProjectsDropdown() {
    this._commonService
      .getDataByUrl(APIS.projects.dropdown)
      .subscribe({
        next: (data: any) => {
          this.projectsDropdownList = data.data || [];
          const selectedProjectId = this.programCreationMain.get('projectId')?.value || this.addEventForm.get('projectId')?.value || '';

          if (!selectedProjectId && this.projectsDropdownList.length) {
            const firstProjectId = this.projectsDropdownList[0]?.project_id ?? this.projectsDropdownList[0]?.projectId ?? '';
            if (firstProjectId) {
              this.programCreationMain.patchValue({ projectId: firstProjectId }, { emitEvent: false });
              this.addEventForm.patchValue({ projectId: firstProjectId }, { emitEvent: false });
              this.onProjectSelectionChange(firstProjectId);
              return;
            }
          }

          this.onProjectSelectionChange(selectedProjectId);
        },
        error: () => {
          this.projectsDropdownList = [];
        },
      });
  }

  getProgramTypeData() {
    this._commonService
      .getById(APIS.programCreation.getProgramType, this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getProgramType = data.data;
        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }

  uploadedFiles: any = [];
  // onFilesSelected(event: any, index: any) {
  //   const input = event.target as HTMLInputElement;
  //   const rows = this.programCreationSub.get('details') as FormArray;
  //   let urlsList: any = [];
  //   if (rows && input.files) {
  //     const newFiles = Array.from(input.files);
  //     for (let i = 0; i < input.files.length; i++) {
  //       const fileName = input.files[i].name;
  //       const fakePath = `${fileName}`;
  //       urlsList.push(fakePath);
  //     }
  //     rows.at(index).get('uploaFiles')?.setValue(newFiles);
  //     rows.at(index).get('videoUrls')?.setValue(urlsList);
  //   }
  // }
  validateFileExtension(file: File): boolean {
    const allowedExtensions = ['xlsx', 'xls', 'doc', 'docx', 'ppt', 'pptx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedExtensions.includes(fileExtension || '');
  }

  onFilesSelected(event: any, index: any) {
    const input = event.target as HTMLInputElement;
    const rows = this.programCreationSub.get('details') as FormArray;
    let urlsList: any = [];
    if (rows && input.files) {
      const newFiles = Array.from(input.files);
      const validFiles = newFiles.filter(file => this.validateFileExtension(file));
      if (validFiles.length !== newFiles.length) {
        this.toastrService.error('Invalid file type selected. Only Excel, Word, and PowerPoint files are allowed.', 'File Upload Error');
      }
      for (let i = 0; i < validFiles.length; i++) {
        const fileName = validFiles[i].name;
        const fakePath = `${fileName}`;
        urlsList.push(fakePath);
      }
      rows.at(index).get('uploaFiles')?.setValue(validFiles);
      rows.at(index).get('videoUrls')?.setValue(urlsList);
    }
  }

  convertToISOFormat(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  isedit:boolean = false
  getProgramDetailsById(programId: string) {
    this.isedit = true;
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
      next: (data: any) => {
        const program = data.data;
        const resolvedProjectId = this.resolveProjectId(program) || this.programCreationMain.get('projectId')?.value || this.addEventForm.get('projectId')?.value || '';

        this.programCreationMain.patchValue({
          activityId: program.activityId,
          subActivityId: program.subActivityId,
          projectId: resolvedProjectId,
          programType: program.programType,
          programTitle: program.programTitle,
          startDate: this.normalizeDateForInput(program.startDate),
          endDate: this.normalizeDateForInput(program.endDate),
          startTime: this.convertTo24HourFormat(program.startTime),
          endTime: this.convertTo24HourFormat(program.endTime),
          spocName: program.spocName,
          spocContactNo: program.spocContactNo,
          programLocation: program.programLocation,
          kpi: program.kpi,
        });

        this.onProjectSelectionChange(resolvedProjectId);

        if (!this.isRampProject) {
          this.addEventForm.patchValue({
            projectId: resolvedProjectId,
            eventType: program.eventType || '',
            eventTitle: program.eventTitle || program.programTitle || '',
            description: program.description || '',
            projectName: program.projectName || this.selectedProjectTitle || '',
            fundingAgency: program.fundingAgency || '',
            ministry: program.ministry || '',
            implementingAgency: program.implementingAgency || 'ALEAP',
            programCoordinatorName: program.programCoordinatorName || program.spocName || '',
            designation: program.designation || '',
            startDate: this.normalizeDateForInput(program.startDate),
            endDate: this.normalizeDateForInput(program.endDate),
            totalDays: program.totalDays || '',
            startTime: program.startTime ? this.convertTo24HourFormat(program.startTime) : '',
            endTime: program.endTime ? this.convertTo24HourFormat(program.endTime) : '',
            districtId: program.districtId || '',
            mandalId: program.mandalId || '',
            village: program.village || '',
            pinCode: program.pinCode || '',
            totalParticipants: program.totalParticipants || ''
          });
          this.onEventDateChange();
        }

        if (this.programCreationMain.invalid) {
          Object.values(this.programCreationMain.controls).forEach(control => {
            control.markAsTouched();
          });
        }

        // const sessionArray = this.programCreationSub.get('details') as FormArray;
        // sessionArray.clear();
        // if(program.programSessionList.length) {
        //   program.programSessionList.forEach((session: any, index: any) => {
        //     const sessionGroup = this.initiateForm();
        //     sessionGroup.patchValue({
        //       sessionDate: moment(session.sessionDate).format('YYYY-MM-DD'),
        //       startTime: this.convertTo24HourFormat(session.startTime),
        //       endTime: this.convertTo24HourFormat(session.endTime),
        //       sessionTypeName: session.sessionTypeName,
        //       sessionTypeMethodology: session.sessionTypeMethodology,
        //       sessionDetails: session.sessionDetails,
        //       resourceId: session.resourceId,
        //       //meterialType: session.meterialType,
        //       uploaFiles: null,
        //       sessionStreamingUrl: session.sessionStreamingUrl,
        //       videoUrls: session.videoUrls,
        //     });
        //     sessionArray.push(sessionGroup);
        //   });
        //   //this.reinitializeDataTable();
        // }else {
        //   (this.programCreationSub?.controls["details"] as FormArray).clear();
        //   this.onAddRow(0);
        // }
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
  }

  dataTable: any;
  reinitializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  initializeDataTable() {
    this.dataTable = new DataTable('#creation-table', {              
      // scrollX: true,
      // scrollCollapse: true,    
      // responsive: true,    
      // paging: true,
      // searching: true,
      // ordering: true,
      scrollY: "415px",     
      scrollX:        true,
      scrollCollapse: true,
      autoWidth:         true,  
      paging:         false,  
      info: false,   
      searching: false,  
      order: [[0, 'asc']],
      destroy: true, // Ensure reinitialization doesn't cause issues
      });
  }

  convertTo24HourFormat(time: string): string {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  agencyProgramList: any;
  programIds:any=''
  getProgramsByAgency() {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+this.agencyId}`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  dropdownProgramsList(event: any, type: any) {
    this.programIds = event.target.value
    this.getProgramDetailsById(this.programIds);
  }
}