import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ModalService } from '@app/_services/modal.service';
import { APIS } from '@app/constants/constants';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;

@Component({
  selector: 'app-tgtpc10-handholding',
  templateUrl: './tgtpc10-handholding.component.html',
  styleUrls: ['./tgtpc10-handholding.component.css']
})
export class Tgtpc10HandholdingComponent implements OnInit {
  
  handholdingForm!: FormGroup;
  handholdingData: any = [];
  isEditMode = false;
  currentRecordId: any = 0;
  OrganizationData: any[] = [];
  filteredOrganizationData: any = [];
  participantData: any[] = [];
  filteredParticipantData: any = [];
  searchValue: boolean = true;
  
  @Input() activityId: any;
  @Input() subActivityId: any;
  @Output() handHoldingDataChange = new EventEmitter<number>();
  @ViewChild('handholdingModal') handholdingModal: any;
  @ViewChild("searchDropdownInput") searchDropdownInput!: ElementRef<HTMLInputElement>;
  
  subActivityConfig: any = {
    116: { 
      name: 'Udhyam Registrations',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time'
      }
    },
    117: { 
      name: 'IEC Registrations and Other Export Certification support',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'supportType', 'iecRegistrationNumber', 'registrationDate', 'certificationName', 'certificateNumber', 'certificateDate'],
      headers: {
         'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'supportType': 'Support Type',
        'iecRegistrationNumber': 'IEC Registration Number',
        'registrationDate': 'Registration Date',
        'certificationName': 'Certification Name',
        'certificateNumber': 'Certificate Number',
        'certificateDate': 'Certificate Date'
      }
    },
    118: { 
      name: 'Establishment / Attachment of Local Testing Labs / CFCs',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'labOrCfcName', 'purposeOfAttachment', 'dateOfAttachment'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'labOrCfcName': 'Name of the Lab / CFC attached',
        'purposeOfAttachment': 'Purpose of Attachment',
        'dateOfAttachment': 'Date of Attachment'
      }
    },
    119: { 
      name: 'Raw Material Support',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'rawMaterialDetails', 'firstDateOfSupply', 'cost'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'rawMaterialDetails': 'Raw Material Details',
        'firstDateOfSupply': 'First Date of Supply',
        'cost': 'Cost'
      }
    },
    120: { 
      name: 'Testing Access',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'testingAgencyName', 'dateOfTest', 'productTested', 'testResultsDate', 'certificationOrTestFindings'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'testingAgencyName': 'Testing / Quality Certification Agency Name',
        'dateOfTest': 'Date of Test',
        'productTested': 'Product Tested',
        'testResultsDate': 'Test Results Date',
        'certificationOrTestFindings': 'Certification/Test Findings'
      }
    },
    121: { 
      name: 'Quality Certification support',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'testingAgencyName', 'dateOfTest', 'productTested', 'testResultsDate', 'certificationOrTestFindings'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'testingAgencyName': 'Testing Agency Name',
        'dateOfTest': 'Date of Test',
        'productTested': 'Product Tested',
        'testResultsDate': 'Test Results Date',
        'certificationOrTestFindings': 'Certification/Test Findings'
      }
    },
    122: { 
      name: 'Packaging Standards support',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'packagingStandardsSupportDetails'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        'packagingStandardsSupportDetails': 'Details of Support',
        // 'brandingSupportDetails': 'Branding Support Details'
      }
    },
    123: { 
      name: 'Branding Support',
      fields: ['organizationId', 'participantIds', 'handholdingSupportBy', 'handholdingDate', 'handholdingTime', 'brandingSupportDetails'],
      headers: {
        'handholdingSupportBy': 'Handholding Support By',
        'handholdingDate': 'Date',
        'handholdingTime': 'Time',
        // 'packagingStandardsSupportDetails': 'Packaging Standards Support Details',
        'brandingSupportDetails': 'Details of Support'
      }
    }
  };

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.formDetailsforParticipant()
    this.loadOrganizations();
  }

  ngOnChanges(): void {
    if (this.activityId && this.subActivityId) {
      this.loadHandholdingData();
    }
  }
  
  initializeForm(): void {
    this.handholdingForm = this.fb.group({
      // Common fields
      subActivityId: [0],
      organizationId: [0, Validators.required],
      participantIds: [[], Validators.required],
      handholdingSupportBy: ['', Validators.required],
      handholdingDate: ['', Validators.required],
      handholdingTime: ['', Validators.required],
      packagingStandardsSupportDetails: [''],
      brandingSupportDetails: [''],
      
      // Subactivity 117 - IEC Registration
      supportType: [''],
      iecRegistrationNumber: [''],
      registrationDate: [''],
      certificationName: [''],
      certificateNumber: [''],
      certificateDate: [''],
      
      // Subactivity 118 - Testing Labs
      labOrCfcName: [''],
      purposeOfAttachment: [''],
      dateOfAttachment: [''],
      
      // Subactivity 119 - Raw Material
      rawMaterialDetails: [''],
      firstDateOfSupply: [''],
      cost: [0],
      
      // Subactivity 120 & 121 - Testing/Quality
      testingAgencyName: [''],
      dateOfTest: [''],
      productTested: [''],
      testResultsDate: [''],
      certificationOrTestFindings: [''],
      
      // File upload
      file: [null]
    });
  }

  loadOrganizations() {
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?page=0&size=500').subscribe({
      next: (res: any) => {
        this.OrganizationData = res?.data;
        this.filteredOrganizationData = this.OrganizationData.slice();
      },
      error: (err) => {
        this.toastrService.error(err.message, "Organization Data Error!");
      }
    });
  }

  // loadParticipants() {
  //   this._commonService.getDataByUrl(APIS.participantdata.getParticipantsOnlyPagination + '?page=0&size=500').subscribe({
  //     next: (res: any) => {
  //       this.participantData = res?.data;
  //       this.filteredParticipantData = this.participantData.slice();
  //     },
  //     error: (err) => {
  //       this.toastrService.error(err.message, "Participant Data Error!");
  //     }
  //   });
  // }
  // Handle resource selection
  onOrganizationSelect(item: any) {
    console.log('Resource selected:', item);
  
    this.loadParticipants(item);
  }
  
      participantList: any = []
   loadParticipants(organizationid:any): void {
    this.participantList = [];
    console.log('Organization Data for Participants:', organizationid);
    this._commonService.getDataByUrl(APIS.participantdata.getParticipantNonTrainingbyOrgainizationId+organizationid).subscribe({
      next: (res: any) => {
        // Transform data to have a unified ID field
        this.participantList = res?.data.map((item: any) => ({
          id: item.participantId || item.influencedId, // Use whichever is available
          participantId: item.participantId,
          influencedId: item.influencedId,
          participantName: item.participantName,
          type: item.participantId ? 'participant' : 'influenced' // Track the type
        }));
        this.filteredParticipantData = this.participantList.slice();
        console.log('Participant List:', this.participantList);
  
        this.assignResourceDropdownSettings();
      },
      error: (err) => {
        this.toastrService.error(err.message, "Participants Data Error!");
        new Error(err);
      },
    });
  }
  // Resource Dropdown Settings
  dropdownSettingsResource: IDropdownSettings = {};
  dropdownListResource: any = [];
  assignResourceDropdownSettings() {
    this.dropdownSettingsResource = {
      singleSelection: false,
      idField: 'id', // Use the unified ID field
      textField: 'participantName',
      itemsShowLimit: 2,
      enableCheckAll: true,
      selectAllText: "Select All Participants",
      unSelectAllText: "Clear All",
      allowSearchFilter: true,
      clearSearchFilter: true,
      maxHeight: 197,
      searchPlaceholderText: "Search Participants",
      noDataAvailablePlaceholderText: "No Participants Available",
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false,
    };
    this.dropdownListResource = this.participantList;
  }
  
  // Handle resource selection
  onItemSelectResource(item: any) {
    console.log('Resource selected:', item);
  }
  
  onItemDeSelectResource(item: any) {
    console.log('Resource deselected:', item);
  }

  onSearchChange(event: any) {
    const filterValue = event?.toLowerCase();
    if (filterValue.length >= 2) {
      this.searchValue = false;
      this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?search=' + event + '&page=0&size=500')
        .subscribe({
          next: (res: any) => {
            this.OrganizationData = res?.data;
            this.filteredOrganizationData = this.OrganizationData.slice();
          },
          error: (error: any) => {
            this.filteredOrganizationData = [];
          }
        });
    } else {
      this.searchValue = true;
      this.filteredOrganizationData = this.OrganizationData.slice();
    }
  }

  loadHandholdingData(): void {
    this.handholdingData = [];
    let typehandholading='handholding';
    if(this.subActivityId=='117'){
      typehandholading='iecregistrationcertification';
    }
    else if(this.subActivityId=='118'){
      typehandholading='localtestinglabattachment';
    }
    else if(this.subActivityId=='119'){
      typehandholading='rawmaterialsupport';
    }
    else if(this.subActivityId=='120' || this.subActivityId=='121'){
      typehandholading='testingqualitycertificationsupport';
    }
    else if(this.subActivityId=='122'){
      typehandholading='packagingstandardssupport';
    }
    else if(this.subActivityId=='123'){
      typehandholading='brandingsupport';
    }
     this._commonService.getDataByUrl(APIS.nontrainingtargets.tgtpc10.getHandholdingBySubActivity+'?type='+typehandholading+'&subActivityId='+this.subActivityId).subscribe({
       next: (response) => {
         this.handholdingData = response.data || [];
       },
       error: (error) => {
         this.toastrService.error('Failed to load vendor details', 'Non Training Progress Data Error!');
         console.error('Load vendor data error:', error);
       }
     });
    // this._commonService.getById(APIS.nontrainingtargets.tgtpc10.getHandholdingBySubActivity, this.subActivityId).subscribe({
    //   next: (res: any) => {
    //     if (res.data.length > 0) {
    //       this.handholdingData = res.data;
    //     }
    //   },
    //   error: (err: any) => {
    //     console.error('Error loading handholding data', err);
    //   }
    // });
  }

  openModal(type: any, record?: any): void {
    this.isEditMode = type === 'edit';
     this.uploadedFilesHandHolding=null;
    if (this.isEditMode) {
      this.currentRecordId = record.id;
       this.uploadedFilesHandHolding=record?.testResultFilePath;
        this.loadParticipants(record?.organizationId);
         const selectedResources = record?.participants?.map((participant: any) => {
            const id = participant.participantId || participant.influencedParticipantId;
            console.log('Mapping participant ID:', id,record.participants,this.participantList,this.participantList.find((r: any) => r.id === id));
            return this.participantList.find((r: any) => r.id === id);
          }).filter((r: any) => r !== undefined) || [];
      const formattedRecord = {
        ...record,
        handholdingDate: this.convertToISOFormat(record.handholdingDate),
        registrationDate: this.convertToISOFormat(record.registrationDate),
        certificateDate: this.convertToISOFormat(record.certificateDate),
        dateOfAttachment: this.convertToISOFormat(record.dateOfAttachment),
        firstDateOfSupply: this.convertToISOFormat(record.firstDateOfSupply),
        dateOfTest: this.convertToISOFormat(record.dateOfTest),
        testResultsDate: this.convertToISOFormat(record.testResultsDate),
         participantIds: selectedResources,
      }; 
      this.handholdingForm.patchValue(formattedRecord);
       setTimeout(() => {
        this.handholdingForm.patchValue({ participantIds: selectedResources });
      }, 500);
    } else {
      this.handholdingForm.reset();
      this.handholdingForm.patchValue({ 
        subActivityId: this.subActivityId, 
        organizationId: 0,
        participantIds: [],
        
        cost: 0
      });
    }

    this.modalService.openModal(this.handholdingModal, { 
      modalDialogClass: 'modal-xl',
      backdrop: 'static'
    });
  }

  convertToISOFormat(date: string): string {
    if (date) {
      const [day, month, year] = date.split('-');
      return `${year}-${month}-${day}`;
    }
    return '';
  }

  closeModal(): void {
    this.modalService.closeModal(this.handholdingModal);
  }

  saveHandholding(): void {
    if (this.handholdingForm.invalid) {
      this.toastrService.error('Please fill all required fields');
      return;
    }

    const formData = new FormData();
    const formValue = this.handholdingForm.value;
     const participantIds: number[] = [];
      const influencedParticipantIds: number[] = [];
      this.participantList.forEach((p: any) => {
        console.log('Participant List Item:', p);
        formValue.participantIds?.forEach((selected: any) => {
          if (p.id === selected.id) {
            if (p.type === 'participant' && p.participantId) {
              participantIds.push(p.participantId);
            } else if (p.type === 'influenced' && p.influencedId) {
              influencedParticipantIds.push(p.influencedId);
            }
          }
        });
      }
      );
      console.log('Mapped Participant IDs:', participantIds);
      console.log('Mapped Influenced Participant IDs:', influencedParticipantIds);

    // Build nested JSON structure
    const tgtpcHandholdingSupportRequest = {
      subActivityId: this.subActivityId,
      handholdingSupportBy: formValue.handholdingSupportBy,
      organizationId: formValue.organizationId,
      participantIds: participantIds,
      influencedParticipantIds: influencedParticipantIds,
      handholdingDate: formValue.handholdingDate,
      handholdingTime: formValue.handholdingTime,
      packagingStandardsSupportDetails: formValue.packagingStandardsSupportDetails || '',
      brandingSupportDetails: formValue.brandingSupportDetails || ''
    };

    const payload: any = { tgtpcHandholdingSupportRequest };

    // Add subactivity-specific fields
    switch (this.subActivityId) {
      case '117': // IEC Registration
        payload.supportType = formValue.supportType;
        payload.iecRegistrationNumber = formValue.iecRegistrationNumber;
        payload.registrationDate = formValue.registrationDate;
        payload.certificationName = formValue.certificationName;
        payload.certificateNumber = formValue.certificateNumber;
        payload.certificateDate = formValue.certificateDate;
        break;
      case '118': // Testing Labs
        payload.labOrCfcName = formValue.labOrCfcName;
        payload.purposeOfAttachment = formValue.purposeOfAttachment;
        payload.dateOfAttachment = formValue.dateOfAttachment;
        break;
      case '119': // Raw Material
        payload.rawMaterialDetails = formValue.rawMaterialDetails;
        payload.firstDateOfSupply = formValue.firstDateOfSupply;
        payload.cost = formValue.cost;
        break;
      case '120': // Testing Access
      case '121': // Quality Certification
        payload.testingAgencyName = formValue.testingAgencyName;
        payload.dateOfTest = formValue.dateOfTest;
        payload.productTested = formValue.productTested;
        payload.testResultsDate = formValue.testResultsDate;
        payload.certificationOrTestFindings = formValue.certificationOrTestFindings;
        break;
    }
    let typehandholading='handholding';
    if(this.subActivityId=='117'){
      typehandholading='iecregistrationcertification';
    }
    else if(this.subActivityId=='118'){
      typehandholading='localtestinglabattachment';
    }
    else if(this.subActivityId=='119'){
      typehandholading='rawmaterialsupport';
    }
    else if(this.subActivityId=='120' || this.subActivityId=='121'){
      typehandholading='testingqualitycertificationsupport';
    }
    else if(this.subActivityId=='122'){
      typehandholading='packagingstandardssupport';
    }
    else if(this.subActivityId=='123'){
      typehandholading='brandingsupport';
    }
    formData.append('type', typehandholading);
    formData.append('data', JSON.stringify(payload));
    
    // if (formValue.file) {
    //   formData.append('file', formValue.file);
    // }
     if (this.isEditMode ) {
        if (this.uploadedFilesHandHolding?.name && typeof this.uploadedFilesHandHolding !== 'string') {
          formData.append("file", this.uploadedFilesHandHolding);
        }
      }
      else{
        if (this.uploadedFilesHandHolding) {
          formData.append("file", this.uploadedFilesHandHolding);
        }
      }

    const apiCall = this.isEditMode
      ? this._commonService.updatedata(APIS.nontrainingtargets.tgtpc10.updateHandholding + this.currentRecordId, formData)
      : this._commonService.add(APIS.nontrainingtargets.tgtpc10.saveHandholding, formData);

    apiCall.subscribe({
      next: (res: any) => {
        this.toastrService.success(this.isEditMode ? 'Updated successfully' : 'Saved successfully');
        this.closeModal();
        this.loadHandholdingData();
        this.handHoldingDataChange.emit(this.subActivityId);
      },
      error: (err: any) => {
        this.toastrService.error('Operation failed');
        console.error('Error saving handholding data', err);
      }
    });
  }

  // onFileChange(event: any): void {
  //   if (event.target.files.length > 0) {
  //     const file = event.target.files[0];
  //     this.handholdingForm.patchValue({ file: file });
  //   }
  // }
   uploadedFilesHandHolding: any = ''
  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      switch(type) {
        case 'file':
         
          this.uploadedFilesHandHolding= file;

          break;
       
      }
    }
  }

  removeFile(type: string): void {
    switch(type) {
      case 'file':
        
        this.uploadedFilesHandHolding=null
        break;
      
    }
    const fileInput = document.getElementById(`${type}Input`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
  deleteTgtpcReportsID: any;
  
  deleteTgtpcReports(id: any): void {
    this.deleteTgtpcReportsID = id;
    const previewModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }

  ConfirmDeleteTgtpcReports(id: any) {
     let typehandholading='handholding';
    if(this.subActivityId=='117'){
      typehandholading='iecregistrationcertification';
    }
    else if(this.subActivityId=='118'){
      typehandholading='localtestinglabattachment';
    }
    else if(this.subActivityId=='119'){
      typehandholading='rawmaterialsupport';
    }
    else if(this.subActivityId=='120' || this.subActivityId=='121'){
      typehandholading='testingqualitycertificationsupport';
    }
    else if(this.subActivityId=='122'){
      typehandholading='packagingstandardssupport';
    }
    else if(this.subActivityId=='123'){
      typehandholading='brandingsupport';
    }
    this._commonService.deleteId(APIS.nontrainingtargets.tgtpc10.deleteHandholding,id+'?type='+typehandholading).subscribe({
      next: (res: any) => {
        this.toastrService.success('Deleted successfully');
        this.loadHandholdingData();
        this.deleteTgtpcReportsID = '';
        this.closeModalDeleteTgtpcReports();
      },
      error: (err: any) => {
        this.toastrService.error('Delete failed');
        console.error('Error deleting record', err);
        this.deleteTgtpcReportsID = '';
        this.closeModalDeleteTgtpcReports();
      }
    });
  }

  closeModalDeleteTgtpcReports(): void {
    const editSessionModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }

  getSubActivityName(): string {
    return this.subActivityConfig[this.subActivityId]?.name || 'Handholding Activity';
  }

  shouldShowField(fieldName: string): boolean {
    const config = this.subActivityConfig[this.subActivityId];
    if (!config || !config.fields) return true;
    return config.fields.includes(fieldName);
  }

  getFieldLabel(fieldName: string): string {
    const config = this.subActivityConfig[this.subActivityId];
    if (!config || !config.headers) return fieldName;
    return config.headers[fieldName] || fieldName;
  }

  getHeaderLabel(fieldName: string): string {
    const config = this.subActivityConfig[this.subActivityId];
    if (!config || !config.headers) return fieldName;
    return config.headers[fieldName] || fieldName;
  }

  getVisibleFields(): string[] {
    const config = this.subActivityConfig[this.subActivityId];
    if (!config || !config.fields) return [];
    return config.fields.filter((field:any) => !['participantIds', 'influencedParticipantIds', 'file'].includes(field));
  }
   participantForm!: FormGroup;
    participantSubmitted = false;
  
   formDetailsforParticipant(){
      this.participantForm = this.fb.group({
        participantName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]],
        isAspirant: ['Existing Oragnization'],
        organizationId: [null, Validators.required],
        mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]]
      });
   }
  
    // Getter for participant form controls
    get pf() {
      return this.participantForm.controls;
    }
  
    // Open participant modal
    openParticipantModal(): void {
      this.participantSubmitted = false;
      this.participantForm.reset();
      const modalElement = document.getElementById('addParticipantModal');
      const modal = new bootstrap.Modal(modalElement);
      modal.show();
    }
  
    // Save participant
    saveParticipant(): void {
      this.participantSubmitted = true;
  
      if (this.participantForm.valid) {
        const payload = {
          participantName: this.participantForm.value.participantName,
          mobileNo: this.participantForm.value.mobileNo,
          // isAspirant: this.participantForm.value.isAspirant === 'Aspirant' ? true : false,
          isAspirant:this.participantForm.value.organizationId?'Existing Oragnization':'Aspirant',
          // organizationId: this.participantForm.value.organizationId,
          "organizationId": this.participantForm.value.organizationId
          // programIds: [this.handHoldingForm.value.programIds || this.activityId]
        };
  
        this._commonService.add(APIS.nonparticipant.add, payload).subscribe({
          next: (response: any) => {
            if (response?.status === 400) {
              this.toastrService.error(response?.message, 'Participant Data Error!');
            } else {
              this.toastrService.success('Participant added successfully', 'Success!');
              this.closeParticipantModal();
              this.loadParticipants(this.participantForm.value.organizationId); // Reload participants list
              this.resetParticipantForm();
            }
          },
          error: (error) => {
            this.toastrService.error(error.message || 'Failed to add participant', 'Error!');
            console.error('Save participant error:', error);
          }
        });
      } else {
        this.toastrService.error('Please fill all required fields correctly', 'Validation Error');
      }
    }
  
    // Close participant modal
    closeParticipantModal(): void {
      const modalElement = document.getElementById('addParticipantModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
     // Reset participant form
  resetParticipantForm(): void {
    this.participantForm.reset();
    this.participantSubmitted = false;
  }
  // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
}