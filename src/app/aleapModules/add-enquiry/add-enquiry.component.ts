import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';

@Component({
  selector: 'app-add-enquiry',
  templateUrl: './add-enquiry.component.html'
})
export class AddEnquiryComponent implements OnInit {
  addEnquiryForm!: FormGroup;
  submitted = false;
  loading = false;
  enquiryId: number | null = null;
  isEditMode = false;
  allSectors: any[] = [];
  uploadedEnquiryFile: File | string | null = null;

  readonly stageOptions = ['IDEA', 'POC', 'PROTOTYPE', 'PRODUCT', 'MVP'];
  readonly supportServiceOptions = [
    'Pre-Incubation Program',
    'Incubation Program',
    'Acceleration Program',
    'Funding support (Bank, Schemes, Venture Capitalists, Angel Network)',
    'Mentoring',
    'Network Access & Market Connects',
    'Market connects',
    'Technology Transfer / IPR / licenses etc.',
    'Co-working space',
    'Machinery / facilities',
    'Access to R&D, Industry, Trade etc.'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.getAllSectors();

    this.enquiryId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.enquiryId) {
      this.isEditMode = true;
      this.loadEnquiryForEdit(this.enquiryId);
    }
  }

  get f() {
    return this.addEnquiryForm.controls;
  }

  initializeForm() {
    this.addEnquiryForm = this.fb.group(
      {
        walkInName: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
        whatsappNumber: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
        address: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        startupOrCompanyName: new FormControl('', [Validators.required]),
        innovationDescription: new FormControl('', [Validators.required]),
        sectors: new FormControl([], [Validators.required]),
        stage: new FormControl('', [Validators.required]),
        incubationSupportRequired: new FormControl(null, [Validators.required]),
        incubationSupportDescription: new FormControl(''),
        supportServicesRequired: new FormControl([], [Validators.required]),
        applicantSignature: new FormControl('', [Validators.required]),
        formReceivedDate: new FormControl('', [Validators.required]),
        officialName: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
        discussionSummary: new FormControl('', [Validators.required]),
        enquiryFromFilePath: new FormControl(null, [Validators.required])
      },
      { validators: this.validateIncubationSupportDescription }
    );
  }

  validateIncubationSupportDescription: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const incubationSupportRequired = formGroup.get('incubationSupportRequired')?.value;
    const incubationSupportDescription = formGroup.get('incubationSupportDescription')?.value;

    if (incubationSupportRequired === true && !`${incubationSupportDescription || ''}`.trim()) {
      return { incubationSupportDescriptionRequired: true };
    }

    return null;
  };

  getAllSectors() {
    this._commonService.getDataByUrl(APIS.masterList.getSectors).subscribe({
      next: (data: any) => {
        this.allSectors = data?.data || [];
      },
      error: () => {
        this.allSectors = [];
      }
    });
  }

  getSectorLabel(item: any): string {
    return item?.sectorName || item?.sector || item?.name || item || '';
  }

  getSectorValue(item: any): string {
    return item?.sectorName || item?.sector || item?.name || item || '';
  }

  onFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files && input.files.length ? input.files[0] : null;
    this.addEnquiryForm.get('enquiryFromFilePath')?.setValue(selectedFile);
    this.addEnquiryForm.get('enquiryFromFilePath')?.markAsTouched();

    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('files', selectedFile);
    this._commonService.uploadFile('Enquiry', formData).subscribe({
      next: (res: any) => {
        const filePath = res?.data?.[0] || null;
        this.addEnquiryForm.get('enquiryFromFilePath')?.setValue(filePath);
        this.uploadedEnquiryFile = filePath;
      },
      error: () => {
        this.toastrService.error('File upload failed', 'Error');
        this.addEnquiryForm.get('enquiryFromFilePath')?.setValue(null);
        this.uploadedEnquiryFile = null;
      }
    });
  }

  removeFile(inputId: string): void {
    const existingFilePath = this.addEnquiryForm.get('enquiryFromFilePath')?.value;
    if (existingFilePath) {
      this._commonService.deleteId(APIS.uploadfiles.deleteFile, existingFilePath).subscribe({
        next: () => {
        },
        error: () => {
        }
      });
    }

    this.addEnquiryForm.get('enquiryFromFilePath')?.setValue(null);
    this.addEnquiryForm.get('enquiryFromFilePath')?.markAsTouched();
    this.addEnquiryForm.get('enquiryFromFilePath')?.updateValueAndValidity();
    this.uploadedEnquiryFile = null;

    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  getFileName(file: File | string | null): string {
    if (!file) {
      return '';
    }

    if (typeof file === 'string') {
      return file.split('/').pop() || file;
    }

    return file.name;
  }

  onSupportServiceChange(option: string, event: any) {
    const selectedOptions = [...this.normalizeStringArray(this.f['supportServicesRequired'].value)];
    if (event.target.checked) {
      if (!selectedOptions.includes(option)) {
        selectedOptions.push(option);
      }
    } else {
      const optionIndex = selectedOptions.indexOf(option);
      if (optionIndex >= 0) {
        selectedOptions.splice(optionIndex, 1);
      }
    }

    this.f['supportServicesRequired'].setValue(selectedOptions);
    this.f['supportServicesRequired'].markAsTouched();
  }

  isSupportServiceSelected(option: string): boolean {
    return this.normalizeStringArray(this.f['supportServicesRequired'].value).includes(option);
  }

  submitEnquiry() {
    this.submitted = true;
    Object.keys(this.addEnquiryForm.controls).forEach(key => {
      this.addEnquiryForm.get(key)?.markAsTouched();
    });

    if (this.addEnquiryForm.invalid) {
      return;
    }

    const formValue = this.addEnquiryForm.value;
    const payload: any = {
      walkInName: formValue.walkInName,
      whatsappNumber: formValue.whatsappNumber,
      address: formValue.address,
      email: formValue.email,
      startupOrCompanyName: formValue.startupOrCompanyName,
      innovationDescription: formValue.innovationDescription,
      sectors: this.normalizeStringArray(formValue.sectors),
      stage: formValue.stage,
      incubationSupportRequired: formValue.incubationSupportRequired === true,
      incubationSupportDescription: formValue.incubationSupportDescription,
      supportServicesRequired: this.normalizeStringArray(formValue.supportServicesRequired),
      applicantSignature: formValue.applicantSignature,
      formReceivedDate: this.formatDateValue(formValue.formReceivedDate),
      officialName: formValue.officialName,
      discussionSummary: formValue.discussionSummary,
      enquiryFromFilePath: formValue.enquiryFromFilePath || ''
    };

    this.loading = true;
    const request$ = this.isEditMode && this.enquiryId
      ? this._commonService.update(APIS.enquiry.update, payload, this.enquiryId)
      : this._commonService.add(APIS.enquiry.add, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(`Enquiry ${this.isEditMode ? 'updated' : 'added'} successfully`, 'Success');
        this.router.navigate(['/view-enquiry-data']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'add'} enquiry`, 'Error');
      }
    });
  }

  loadEnquiryForEdit(enquiryId: number) {
    this._commonService.getById(APIS.enquiry.getById, enquiryId).subscribe({
      next: (res: any) => {
        const enquiry = res?.data ?? res;
        if (!enquiry) {
          this.toastrService.error('Enquiry data not found', 'Error');
          this.router.navigate(['/view-enquiry-data']);
          return;
        }

        this.addEnquiryForm.patchValue({
          walkInName: enquiry.walkInName || '',
          whatsappNumber: enquiry.whatsappNumber || '',
          address: enquiry.address || '',
          email: enquiry.email || '',
          startupOrCompanyName: enquiry.startupOrCompanyName || '',
          innovationDescription: enquiry.innovationDescription || '',
          sectors: this.normalizeStringArray(enquiry.sectors),
          stage: enquiry.stage || '',
          incubationSupportRequired: enquiry.incubationSupportRequired,
          incubationSupportDescription: enquiry.incubationSupportDescription || '',
          supportServicesRequired: this.normalizeStringArray(enquiry.supportServicesRequired),
          applicantSignature: enquiry.applicantSignature || '',
          formReceivedDate: this.formatDateValue(enquiry.formReceivedDate),
          officialName: enquiry.officialName || '',
          discussionSummary: enquiry.discussionSummary || '',
          enquiryFromFilePath: enquiry.enquiryFromFilePath || ''
        });

        this.uploadedEnquiryFile = enquiry.enquiryFromFilePath || null;
        this.addEnquiryForm.get('enquiryFromFilePath')?.clearValidators();
        this.addEnquiryForm.get('enquiryFromFilePath')?.updateValueAndValidity();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load enquiry', 'Error');
        this.router.navigate(['/view-enquiry-data']);
      }
    });
  }

  goToEnquiries() {
    this.router.navigate(['/view-enquiry-data']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.enquiryId) {
      this.loadEnquiryForEdit(this.enquiryId);
      return;
    }

    this.addEnquiryForm.reset({
      sectors: [],
      supportServicesRequired: [],
      incubationSupportRequired: null,
      enquiryFromFilePath: null
    });
    this.uploadedEnquiryFile = null;
  }

  private normalizeStringArray(value: any): string[] {
    if (Array.isArray(value)) {
      return value
        .map(item => `${item ?? ''}`.trim())
        .filter(item => !!item);
    }

    if (typeof value === 'string' && value.trim()) {
      return value.split(',').map(item => item.trim()).filter(item => !!item);
    }

    return [];
  }

  private formatDateValue(value: any): string {
    if (!value) {
      return '';
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
  }
}
