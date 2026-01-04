import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

declare var bootstrap: any;


@Component({
  selector: 'app-hand-holding-aleap',
  templateUrl: './hand-holding-aleap.component.html',
  styleUrls: ['./hand-holding-aleap.component.css']
})
export class HandHoldingAleapComponent implements OnInit {
  @Input() activityId: any;
  @Input() subActivityId: any;
  @Input() handHoldingType: any;
  @Output() handHoldingDataChange= new EventEmitter<number>();
  handHoldingForm!: FormGroup;
  handHoldingList: any = [];
  organizationList: any[] = [];
  participantList: any = [];
  isEditMode = false;
  isSubmitted = false;
  editingId: number | null = null;
  apiUrl = 'https://metaverseedu.in/workflow';
  
  uploadedFile: File | null = null;
  uploadedImage1: File | null = null;
  uploadedImage2: File | null = null;
  uploadedImage3: File | null = null;

  handHoldingTypes = [
    { value: 'Counselling', label: 'Counselling' },
    { value: 'Mentoring', label: 'Mentoring' },
    { value: 'Training', label: 'Training' },
    { value: 'Workshop', label: 'Workshop' }
  ];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
     private toastrService: ToastrService,
        private _commonService: CommonServiceService
  ) {
    this.formDetailsforParticipant();
    this.handHoldingForm = this.fb.group({
      subjectDelivered: ['', ],
      originalIdea: ['', ],
      finalIdea: ['', ],
      handholdingSupportId: [null, ],
      organizationId: [1, Validators.required],
      counselledBy: ['', Validators.required],
      participantIds: [[], Validators.required],
      nonTrainingActivityId: [null, ],
      nonTrainingSubActivityId: [null, ],
      handHoldingType: ['', ],
      counsellingDate: ['', Validators.required],
      counsellingTime: ['', Validators.required],
      bankName: [''],
      branchName: [''],
      bankRemarks: [''],
      adviseDetails: [''],
      // planFileUploadPath: ['']

    });
    console.log('Activity ID:', this.activityId);
    console.log('Sub Activity ID:', this.subActivityId);
    console.log('Hand Holding Type:', this.handHoldingType);
  }
  handHoldingTypeOptions:any = 
  {
    counselling: 'Counselling',
    businessplan: 'Business Plan',
    sectoradvisory: 'Advisory',
    marketstudy: 'Market Study'
  }

  ngOnInit(): void {
    // this.formDetails()
    this.loadHandHoldingData();
    this.loadOrganizations();
    this.loadParticipants();
  }
  ngOnChanges(): void {
    console.log('Activity ID changed:', this.activityId);
    console.log('Sub Activity ID changed:', this.subActivityId);
    console.log('Hand Holding Type changed:', this.handHoldingType);
    
    if (this.activityId && this.subActivityId && this.handHoldingType) {
      this.addFieldsDynamically()
      this.handHoldingForm.patchValue({
        nonTrainingActivityId: this.activityId,
        nonTrainingSubActivityId: this.subActivityId,
        handHoldingType: this.handHoldingType
      });
      this.loadHandHoldingData();
    }
  }

 
addFieldsDynamically(){
  this.handHoldingForm.get('subjectDelivered')?.clearValidators();
  this.handHoldingForm.get('originalIdea')?.clearValidators();
  this.handHoldingForm.get('finalIdea')?.clearValidators();
  this.handHoldingForm.get('bankName')?.clearValidators();
  this.handHoldingForm.get('branchName')?.clearValidators();
  this.handHoldingForm.get('bankRemarks')?.clearValidators();
   this.handHoldingForm.get('adviseDetails')?.clearValidators();
    this.handHoldingForm.get('subjectDelivered')?.patchValue('');
    this.handHoldingForm.get('originalIdea')?.patchValue('');
    this.handHoldingForm.get('finalIdea')?.patchValue('');
    this.handHoldingForm.get('bankName')?.patchValue('');
    this.handHoldingForm.get('branchName')?.patchValue('');
    this.handHoldingForm.get('bankRemarks')?.patchValue('');
      this.handHoldingForm.get('adviseDetails')?.patchValue('');
  if(this.handHoldingType=='counselling'){
     this.handHoldingForm.get('subjectDelivered')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('originalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('originalIdea')?.updateValueAndValidity();
      this.handHoldingForm.get('finalIdea')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('finalIdea')?.updateValueAndValidity();
  }
  else if(this.handHoldingType=='businessplan'){
    this.handHoldingForm.get('bankName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('branchName')?.setValidators([Validators.required, Validators.minLength(3)]);
      this.handHoldingForm.get('bankRemarks')?.setValidators([Validators.required, Validators.minLength(5)]);
  }
  else if(this.handHoldingType=='sectoradvisory'){
      this.handHoldingForm.get('adviseDetails')?.setValidators([Validators.required, Validators.minLength(5)]);
  }
   this.handHoldingForm.get('adviseDetails')?.updateValueAndValidity();
   this.handHoldingForm.get('subjectDelivered')?.updateValueAndValidity();
    this.handHoldingForm.get('originalIdea')?.updateValueAndValidity();
    this.handHoldingForm.get('finalIdea')?.updateValueAndValidity();
    this.handHoldingForm.get('bankName')?.updateValueAndValidity();
    this.handHoldingForm.get('branchName')?.updateValueAndValidity();
    this.handHoldingForm.get('bankRemarks')?.updateValueAndValidity();
}

  get f() {
    return this.handHoldingForm.controls;
  }

  loadHandHoldingData(): void {
    const params = {
      type: 'counselling',
      id: '',
      subActivityId: ''
    };
    
     this._commonService.getDataByUrl(APIS.nontrainingtargets.aleap.getHandHoldingData+'?type=' + this.handHoldingType+'&subActivityId='+this.subActivityId).subscribe({
       next: (response) => {
         this.handHoldingList = response.data || [];
       },
       error: (error) => {
         this.toastrService.error('Failed to load vendor details', 'Non Training Progress Data Error!');
         console.error('Load vendor data error:', error);
       }
     });
   
  }

  // loadOrganizations(): void {
  //   this.http.get<any>(`${this.apiUrl}/organization-name`).subscribe({
  //     next: (response) => {
  //       this.organizationList = response;
  //     },
  //     error: (error) => {
  //       console.error('Error loading organizations:', error);
  //     }
  //   });
  // }
 // Dropdown Settings for Organization
 dropdownListOrg: any = [];
 dropdownSettingsOrg: IDropdownSettings = {};
  assignFluidData1Org() {
    this.dropdownSettingsOrg = {
      singleSelection: true,
      idField: 'organizationId',
      textField: 'organizationName',
      itemsShowLimit: 1,
      allowSearchFilter: true,
      clearSearchFilter: true,
      maxHeight: 197,
      searchPlaceholderText: "Search Organization",
      noDataAvailablePlaceholderText: "Data Not Available",
      closeDropDownOnSelection: false,
      showSelectedItemsAtTop: false,
      defaultOpen: false,
    };
    this.dropdownListOrg = this.OrganizationData;
  }

  onItemSelectOrg(item: any) {
    console.log('Item selected:', item);
  }

  onItemDeSelectOrg(item: any) {
    console.log('Item deselected:', item);
  }
  OrganizationData: any[] = []
  filteredOrganizationData: any = []
    loadOrganizations() {
      this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyId).subscribe({
        next: (res: any) => {
          this.OrganizationData = res?.data
          this.filteredOrganizationData = this.OrganizationData.slice()
          this.assignFluidData1Org()
          // this.submitedData=res?.data?.data
          // this.advanceSearch(this.getSelDataRange);
          // modal.close()
  
        },
        error: (err) => {
          this.toastrService.error(err.message, "Organization Data Error!");
          new Error(err);
        },
      });
    }
    // Handle organization selection
// Handle resource selection
onOrganizationSelect(item: any) {
  console.log('Resource selected:', item);
}

    filteredParticipantData: any = []
  loadParticipants(): void {
     this._commonService.getDataByUrl(APIS.participantdata.getParticipantsList).subscribe({
        next: (res: any) => {
          this.participantList = res?.data
          this.filteredParticipantData = this.participantList.slice()
          this.assignResourceDropdownSettings()
          // this.submitedData=res?.data?.data
          // this.advanceSearch(this.getSelDataRange);
          // modal.close()
  
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
    idField: 'participantId',
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
convertToISOFormat(date: string): string {   
  if(date) {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  else{
    return '';
  }
 
}
  openModal(mode: string, item?: any): void {
    this.isEditMode = mode === 'edit';
    this.isSubmitted = false;
    
    this.uploadedFilesHandHolding=null
    if (this.isEditMode && item) {
      //  this.formDetails()
      if(this.handHoldingType=='counselling' ){
         this.editingId = item.counselletingId || null;
      }
      else if(this.handHoldingType=='businessplan'){
          this.editingId = item.businessPlanId || null;
          this.uploadedFilesHandHolding=item?.planFileUploadPath
      }
      else if(this.handHoldingType=='sectoradvisory'){
          this.editingId = item.sectorAdvisoryId || null;
      }
      else if(this.handHoldingType=='marketstudy'){
          this.editingId = item.marketStudyId || null;
      }
      else{
         this.editingId = item.counselletingId || null;
      }
     
      // Convert resource IDs to objects for multiselect
      this.addFieldsDynamically()
      this.handHoldingForm.patchValue(item);
       const selectedResources = item?.participantNames?.map((name: any) => 
      this.participantList.find((r: any) => r.participantName === name)
    ).filter((r: any) => r !== undefined) || [];
    console.log('Selected Resources for Edit:', selectedResources,this.OrganizationData.find(org => org.organizationId == item.organizationId),item.organizationId,this.OrganizationData);
      this.handHoldingForm.patchValue({
        counsellingDate: item?.counsellingDate ? this.convertToISOFormat(item.counsellingDate) : null,
        participantIds: selectedResources,
        organizationId: this.OrganizationData.find(org => org.organizationId == item.organizationId) ? [this.OrganizationData.find(org => org.organizationId ===item.organizationId)] : []
      });
      console.log('Form values in edit mode:', this.handHoldingForm.value);
    } else {
      this.resetForm();
    }
     setTimeout(() => {
       const fileInput = document.getElementById('fileInput') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
     }, 100);
      setTimeout(() => {
       const fileInput = document.getElementById('image1Input') as HTMLInputElement;
       const fileInput2 = document.getElementById('image2Input') as HTMLInputElement;
       const fileInput3 = document.getElementById('image3Input') as HTMLInputElement;
       if (fileInput) {
         fileInput.value = '';
       }
       if(fileInput2){
         fileInput2.value = '';
       }
       if(fileInput3){
         fileInput3.value = '';
       }
     }, 100);
    
    const modalElement = document.getElementById('addHandHolding');
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
 uploadedFilesHandHolding: any = ''
  onFileSelected(event: any, type: string): void {
    const file = event.target.files[0];
    if (file) {
      switch(type) {
        case 'file':
          this.uploadedFile = file;
          this.uploadedFilesHandHolding= file;

          break;
        case 'image1':
          this.uploadedImage1 = file;
          break;
        case 'image2':
          this.uploadedImage2 = file;
          break;
        case 'image3':
          this.uploadedImage3 = file;
          break;
      }
    }
  }

  removeFile(type: string): void {
    switch(type) {
      case 'file':
        this.uploadedFile = null;
        this.uploadedFilesHandHolding=null
        break;
      case 'image1':
        this.uploadedImage1 = null;
        break;
      case 'image2':
        this.uploadedImage2 = null;
        break;
      case 'image3':
        this.uploadedImage3 = null;
        break;
    }
    const fileInput = document.getElementById(`${type}Input`) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  // onSubmit(): void {
  //   console.log('Form submitted',this.handHoldingForm.value);
  //   this.isSubmitted = true;
  //   // Mark all fields as touched to show validation errors
  //     Object.keys(this.handHoldingForm.controls).forEach(key => {
  //       this.handHoldingForm.get(key)?.markAsTouched();
  //     });
  //   if (this.handHoldingForm.valid) {
  //     const formData = new FormData();
  //     const formValue = this.handHoldingForm.value;
      
  //     formData.append('type', this.handHoldingType);
      
  //     const jsonData = {
  //       subjectDelivered: formValue.subjectDelivered,
  //       originalIdea: formValue.originalIdea,
  //       finalIdea: formValue.finalIdea,
  //       // handholdingSupportId: formValue.handholdingSupportId,
  //       organizationId: formValue.organizationId.map((o: any) => o.organizationId)[0],
  //       counselledBy: formValue.counselledBy,
  //       participantIds: formValue.participantIds.map((p: any) => p.participantId),
  //       nonTrainingActivityId: this.activityId,
  //       nonTrainingSubActivityId: this.subActivityId,
  //       handHoldingType: this.handHoldingType,
  //       counsellingDate: formValue.counsellingDate,
  //       counsellingTime: formValue.counsellingTime
  //     };
      
  //     formData.append('data', JSON.stringify(jsonData));
      
  //     if (this.uploadedFile) {
  //       formData.append('file', this.uploadedFile);
  //     }
  //     if (this.uploadedImage1) {
  //       formData.append('image1', this.uploadedImage1);
  //     }
  //     if (this.uploadedImage2) {
  //       formData.append('image2', this.uploadedImage2);
  //     }
  //     if (this.uploadedImage3) {
  //       formData.append('image3', this.uploadedImage3);
  //     }
      
  //     if (this.isEditMode && this.editingId) {
  //       this.updateHandHolding(formData);
  //     } else {
  //       this.saveHandHolding(formData);
  //     }
  //   }
  // }
  // ...existing code...

onSubmit(): void {
  console.log('Form submitted', this.handHoldingForm.value);
  console.log('Form valid:', this.handHoldingForm.valid);
  
  // Mark all fields as touched to show validation errors
  Object.keys(this.handHoldingForm.controls).forEach(key => {
    this.handHoldingForm.get(key)?.markAsTouched();
  });
  
  this.isSubmitted = true;
  
  if (this.handHoldingForm.valid) {
    const formData = new FormData();
    const formValue = this.handHoldingForm.value;
    
    formData.append('type', this.handHoldingType);
    
    // Build base JSON data (common fields for all types)
    let jsonData: any = {
      organizationId: formValue.organizationId && formValue.organizationId.length > 0 
        ? formValue.organizationId[0].organizationId 
        : null,
      counselledBy: formValue.counselledBy,
      participantIds: formValue.participantIds?.map((p: any) => p.participantId) || [],
      nonTrainingActivityId: this.activityId,
      nonTrainingSubActivityId: this.subActivityId,
      handHoldingType: this.handHoldingType,
      counsellingDate: formValue.counsellingDate,
      counsellingTime: formValue.counsellingTime
    };
    
    // Add type-specific fields
    if (this.handHoldingType === 'counselling') {
      jsonData = {
        ...jsonData,
        subjectDelivered: formValue.subjectDelivered,
        originalIdea: formValue.originalIdea,
        finalIdea: formValue.finalIdea
      };
    } else if (this.handHoldingType === 'businessplan') {
      jsonData = {
        ...jsonData,
        bankName: formValue.bankName,
        branchName: formValue.branchName,
        bankRemarks: formValue.bankRemarks,
        // planFileUploadPath: this.uploadedFilesHandHolding?this.uploadedFilesHandHolding:null
      };
    }
    else if (this.handHoldingType === 'sectoradvisory') {
      jsonData = {
        ...jsonData,
        adviseDetails: formValue.adviseDetails
      };
    }
    else if (this.handHoldingType === 'marketstudy') {
      // Add market study specific fields here if any
       jsonData = {
        ...jsonData,
      };
      
    }
    
    // Handle file for business plan in edit mode
    if(this.isEditMode && this.editingId && this.handHoldingType === 'businessplan'){
       if (this.uploadedFilesHandHolding?.name && typeof this.uploadedFilesHandHolding !== 'string') {
            formData.append("file", this.uploadedFilesHandHolding);
      }
      else{
        // this.handHoldingForm.patchValue({planFileUploadPath:this.uploadedFilesHandHolding?this.uploadedFilesHandHolding:null  })
        }
    }
    console.log('JSON Data to be sent:', jsonData);
    formData.append('data', JSON.stringify(jsonData));
    
    if (this.uploadedFile && !this.isEditMode) {
      formData.append('file', this.uploadedFile);
    }
    if (this.uploadedImage1) {
      formData.append('image1', this.uploadedImage1);
    }
    if (this.uploadedImage2) {
      formData.append('image2', this.uploadedImage2);
    }
    if (this.uploadedImage3) {
      formData.append('image3', this.uploadedImage3);
    }
    
    if (this.isEditMode && this.editingId) {
      this.updateHandHolding(formData);
    } else {
      this.saveHandHolding(formData);
    }
  } else {
    console.log('Form is invalid');
    // Log individual field errors
    Object.keys(this.handHoldingForm.controls).forEach(key => {
      const control = this.handHoldingForm.get(key);
      if (control && control.invalid) {
        console.log(`${key} errors:`, control.errors);
      }
    });
    this.toastrService.error('Please fill all required fields', 'Form Validation Error');
  }
}

// ...existing code...

  saveHandHolding(formData: FormData): void {
    this.http.post(`${this.apiUrl}/unified-handholding/save`, formData).subscribe({
      next: (response) => {
        console.log('Saved successfully:', response);
        this.toastrService.success('Data saved successfully', 'Save Successful');
        this.loadHandHoldingData();
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
          this.toastrService.error(error, 'Save Error');
        console.error('Error saving data:', error);
      }
    });
  }

  updateHandHolding(formData: FormData): void {
    this.http.put(`${this.apiUrl}/unified-handholding/update/${this.editingId}`, formData).subscribe({
      next: (response) => {
        console.log('Updated successfully:', response);
        this.toastrService.success('Data updated successfully', 'Update Successful');
        this.loadHandHoldingData();
        this.closeModal();
        this.resetForm();
      },
      error: (error) => {
          this.toastrService.error(error, 'Update Error');
        console.error('Error updating data:', error);
      }
    });
  }

  deleteHandHolding(item: any): void {
    const modalElement = document.getElementById('deleteModal');
    const modal = new bootstrap.Modal(modalElement);
     if(this.handHoldingType=='counselling' ){
         this.editingId = item.counselletingId || null;
      }
      else if(this.handHoldingType=='businessplan'){
          this.editingId = item.businessPlanId || null;
      }
      else if(this.handHoldingType=='sectoradvisory'){
          this.editingId = item.sectorAdvisoryId || null;
      }
      else if(this.handHoldingType=='marketstudy'){
          this.editingId = item.marketStudyId || null;
      }
      else{
         this.editingId = item.counselletingId || null;
      }
    modal.show();
  }

  confirmDelete(): void {
    if (this.editingId) {
      this.http.delete(`${this.apiUrl}/unified-handholding/delete/${this.editingId}?type=${this.handHoldingType}`).subscribe({
        next: (response) => {
          console.log('Deleted successfully:', response);
          this.toastrService.success('Data deleted successfully', 'Delete Successful');
          this.loadHandHoldingData();
          const modalElement = document.getElementById('deleteModal');
          const modal = bootstrap.Modal.getInstance(modalElement);
          modal?.hide();
        },
        error: (error) => {
          this.toastrService.error(error, 'Delete Error');
          console.error('Error deleting data:', error);
        }
      });
    }
  }

  closeModal(): void {
    const modalElement = document.getElementById('addHandHolding');
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal?.hide();
  }

  resetForm(): void {
    this.handHoldingForm.reset();
    this.addFieldsDynamically()
    // this.formDetails()
    this.isEditMode = false;
    this.isSubmitted = false;
    this.editingId = null;
    this.uploadedFile = null;
    this.uploadedImage1 = null;
    this.uploadedImage2 = null;
    this.uploadedImage3 = null;
  }
  // addd by upendranath reddy for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
  
  participantForm!: FormGroup;
  participantSubmitted = false;

 formDetailsforParticipant(){
    this.participantForm = this.fb.group({
      participantName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]],
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
        // programIds: [this.handHoldingForm.value.programIds || this.activityId]
      };

      this._commonService.add(APIS.participantdata.add, payload).subscribe({
        next: (response: any) => {
          if (response?.status === 400) {
            this.toastrService.error(response?.message, 'Participant Data Error!');
          } else {
            this.toastrService.success('Participant added successfully', 'Success!');
            this.closeParticipantModal();
            this.loadParticipants(); // Reload participants list
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

  // ...existing code...
}