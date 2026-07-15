import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { AuthenticationService } from '@app/_services';
import { APIS } from '@app/constants/constants';

type UploadKey = 'billPath' | 'signaturePath' | 'idProofPath' | 'photoPath';

@Component({
  selector: 'app-add-membership',
  templateUrl: './add-membership.component.html'
})
export class AddMembershipComponent implements OnInit {
  addMembershipForm!: FormGroup;
  submitted = false;
  loading = false;
  membershipId: number | null = null;
  isEditMode = false;

  readonly membershipTypeOptions = ['INDIVIDUAL', 'INSTITUTION', 'ASSOCIATION'];
  readonly paymentTypeOptions = ['CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE'];

  uploadedFiles: Record<UploadKey, string | null> = {
    billPath: null,
    signaturePath: null,
    idProofPath: null,
    photoPath: null
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private _authService: AuthenticationService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.membershipId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.membershipId) {
      this.isEditMode = true;
      this.loadMembershipForEdit(this.membershipId);
    }
  }

  get f() {
    return this.addMembershipForm.controls;
  }

  get officeAddress(): FormGroup {
    return this.addMembershipForm.get('officeAddress') as FormGroup;
  }

  get residentialAddress(): FormGroup {
    return this.addMembershipForm.get('residentialAddress') as FormGroup;
  }

  initializeForm() {
    this.addMembershipForm = this.fb.group(
      {
        name: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
        membershipType: new FormControl('', [Validators.required]),
        applicationDate: new FormControl('', [Validators.required]),
        organizationName: new FormControl(''),
        representativeName: new FormControl(''),
        officeAddress: this.buildAddressGroup(),
        residentialAddress: this.buildAddressGroup(),
        officePhone: new FormControl('', [Validators.pattern(/^[0-9+\-\s]{6,15}$/)]),
        residencePhone: new FormControl('', [Validators.pattern(/^[0-9+\-\s]{6,15}$/)]),
        email: new FormControl('', [Validators.required, Validators.email]),
        amount: new FormControl('', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]),
        billNo: new FormControl('', [Validators.required]),
        billDate: new FormControl('', [Validators.required]),
        payeeName: new FormControl('', [Validators.required]),
        paymentType: new FormControl('', [Validators.required]),
        bankName: new FormControl(''),
        ifscCode: new FormControl(''),
        transactionId: new FormControl(''),
        checkNo: new FormControl(''),
        checkDate: new FormControl(''),
        purpose: new FormControl('', [Validators.required]),
        billPath: new FormControl('', [Validators.required]),
        proposedByName: new FormControl('', [Validators.required]),
        signaturePath: new FormControl(''),
        secondedByName: new FormControl('', [Validators.required]),
        institutionsInvolved: new FormControl('', [Validators.required]),
        institutionsNameAndAddress: new FormControl('', [Validators.required]),
        objectivesActivities: new FormControl('', [Validators.required]),
        natureOfInvolvement: new FormControl('', [Validators.required]),
        agreedToRules: new FormControl(false, [Validators.requiredTrue]),
        idProofPath: new FormControl(''),
        photoPath: new FormControl('')
      },
      { validators: [this.validateOrgFields, this.validatePaymentFields] }
    );

    this.addMembershipForm.get('paymentType')?.valueChanges.subscribe(() => {
      ['bankName', 'ifscCode', 'transactionId', 'checkNo', 'checkDate'].forEach(k => {
        this.addMembershipForm.get(k)?.updateValueAndValidity({ emitEvent: false });
      });
    });
  }

  buildAddressGroup(): FormGroup {
    return this.fb.group({
      id: new FormControl(null),
      houseNo: new FormControl('', [Validators.required]),
      streetName: new FormControl('', [Validators.required]),
      landmark: new FormControl(''),
      location: new FormControl(''),
      village: new FormControl(''),
      villageOther: new FormControl(''),
      mandal: new FormControl(''),
      mandalOther: new FormControl(''),
      district: new FormControl('', [Validators.required]),
      state: new FormControl('', [Validators.required]),
      pincode: new FormControl('', [Validators.required, Validators.pattern(/^\d{6}$/)])
    });
  }

  validateOrgFields: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('membershipType')?.value;
    if (type === 'INSTITUTION' || type === 'ASSOCIATION') {
      const errors: ValidationErrors = {};
      if (!`${group.get('organizationName')?.value || ''}`.trim()) {
        errors['organizationNameRequired'] = true;
      }
      if (!`${group.get('representativeName')?.value || ''}`.trim()) {
        errors['representativeNameRequired'] = true;
      }
      return Object.keys(errors).length ? errors : null;
    }
    return null;
  };

  validatePaymentFields: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const type = group.get('paymentType')?.value;
    const errors: ValidationErrors = {};

    if (type === 'CHEQUE') {
      if (!`${group.get('bankName')?.value || ''}`.trim()) errors['bankNameRequired'] = true;
      if (!`${group.get('checkNo')?.value || ''}`.trim()) errors['checkNoRequired'] = true;
      if (!group.get('checkDate')?.value) errors['checkDateRequired'] = true;
    } else if (type === 'BANK_TRANSFER') {
      if (!`${group.get('bankName')?.value || ''}`.trim()) errors['bankNameRequired'] = true;
      if (!`${group.get('ifscCode')?.value || ''}`.trim()) errors['ifscCodeRequired'] = true;
      if (!`${group.get('transactionId')?.value || ''}`.trim()) errors['transactionIdRequired'] = true;
    } else if (type === 'UPI') {
      if (!`${group.get('transactionId')?.value || ''}`.trim()) errors['transactionIdRequired'] = true;
    }

    return Object.keys(errors).length ? errors : null;
  };

  showChequeFields(): boolean { return this.f['paymentType'].value === 'CHEQUE'; }
  showBankFields(): boolean { return this.f['paymentType'].value === 'BANK_TRANSFER'; }
  showUpiFields(): boolean { return this.f['paymentType'].value === 'UPI'; }
  requiresOrg(): boolean {
    const t = this.f['membershipType'].value;
    return t === 'INSTITUTION' || t === 'ASSOCIATION';
  }

  onFileChange(event: Event, controlName: UploadKey) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files && input.files.length ? input.files[0] : null;
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('files', selectedFile);
    this._commonService.uploadFile('Membership', formData).subscribe({
      next: (res: any) => {
        const filePath = res?.data?.[0] || null;
        this.addMembershipForm.get(controlName)?.setValue(filePath);
        this.addMembershipForm.get(controlName)?.markAsTouched();
        this.uploadedFiles[controlName] = filePath;
      },
      error: () => {
        this.toastrService.error('File upload failed', 'Error');
        this.addMembershipForm.get(controlName)?.setValue(null);
        this.uploadedFiles[controlName] = null;
      }
    });
  }

  removeFile(controlName: UploadKey, inputId: string) {
    const existing = this.addMembershipForm.get(controlName)?.value;
    if (existing) {
      this._commonService.deleteId(APIS.uploadfiles.deleteFile, existing).subscribe({ next: () => { }, error: () => { } });
    }
    this.addMembershipForm.get(controlName)?.setValue('');
    this.addMembershipForm.get(controlName)?.markAsTouched();
    this.addMembershipForm.get(controlName)?.updateValueAndValidity();
    this.uploadedFiles[controlName] = null;
    const fileInput = document.getElementById(inputId) as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }

  getFileName(file: string | null): string {
    if (!file) return '';
    return file.split('/').pop() || file;
  }

  submitMembership() {
    this.submitted = true;
    this.markAllTouched(this.addMembershipForm);

    if (this.addMembershipForm.invalid) {
      return;
    }

    const v = this.addMembershipForm.value;
    const currentUser: any = this._authService.userValue;
    const userId = currentUser?.userId || currentUser?.id || currentUser?.email || '';

    const payload: any = {
      name: v.name,
      membershipType: v.membershipType,
      applicationDate: this.formatDate(v.applicationDate),
      organizationName: v.organizationName || '',
      representativeName: v.representativeName || '',
      officeAddress: this.buildAddressPayload(v.officeAddress),
      residentialAddress: this.buildAddressPayload(v.residentialAddress),
      officePhone: v.officePhone || '',
      residencePhone: v.residencePhone || '',
      email: v.email,
      amount: Number(v.amount),
      billNo: v.billNo,
      billDate: this.formatDateTime(v.billDate),
      payeeName: v.payeeName,
      paymentType: v.paymentType,
      bankName: v.bankName || '',
      ifscCode: v.ifscCode || '',
      transactionId: v.transactionId || '',
      checkNo: v.checkNo || '',
      checkDate: this.formatDate(v.checkDate),
      purpose: v.purpose,
      billPath: v.billPath || '',
      proposedByName: v.proposedByName,
      signaturePath: v.signaturePath || '',
      secondedByName: v.secondedByName,
      institutionsInvolved: v.institutionsInvolved,
      institutionsNameAndAddress: v.institutionsNameAndAddress,
      objectivesActivities: v.objectivesActivities,
      natureOfInvolvement: v.natureOfInvolvement,
      agreedToRules: !!v.agreedToRules,
      userId: userId,
      idProofPath: v.idProofPath || '',
      photoPath: v.photoPath || ''
    };

    this.loading = true;
    const req$ = this.isEditMode && this.membershipId
      ? this._commonService.update(APIS.membership.update, payload, this.membershipId)
      : this._commonService.add(APIS.membership.add, payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(`Membership ${this.isEditMode ? 'updated' : 'submitted'} successfully`, 'Success');
        this.router.navigate(['/view-membership-data']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'submit'} membership`, 'Error');
      }
    });
  }

  loadMembershipForEdit(id: number) {
    this._commonService.getById(APIS.membership.getById, id).subscribe({
      next: (res: any) => {
        const m = res?.data ?? res;
        if (!m) {
          this.toastrService.error('Membership data not found', 'Error');
          this.router.navigate(['/view-membership-data']);
          return;
        }

        this.addMembershipForm.patchValue({
          name: m.name || '',
          membershipType: m.membershipType || '',
          applicationDate: this.formatDate(m.applicationDate),
          organizationName: m.organizationName || '',
          representativeName: m.representativeName || '',
          officePhone: m.officePhone || '',
          residencePhone: m.residencePhone || '',
          email: m.email || '',
          amount: m.amount ?? '',
          billNo: m.billNo || '',
          billDate: this.formatDateForInput(m.billDate),
          payeeName: m.payeeName || '',
          paymentType: m.paymentType || '',
          bankName: m.bankName || '',
          ifscCode: m.ifscCode || '',
          transactionId: m.transactionId || '',
          checkNo: m.checkNo || '',
          checkDate: this.formatDate(m.checkDate),
          purpose: m.purpose || '',
          billPath: m.billPath || '',
          proposedByName: m.proposedByName || '',
          signaturePath: m.signaturePath || '',
          secondedByName: m.secondedByName || '',
          institutionsInvolved: m.institutionsInvolved || '',
          institutionsNameAndAddress: m.institutionsNameAndAddress || '',
          objectivesActivities: m.objectivesActivities || '',
          natureOfInvolvement: m.natureOfInvolvement || '',
          agreedToRules: !!m.agreedToRules,
          idProofPath: m.idProofPath || '',
          photoPath: m.photoPath || ''
        });

        if (m.officeAddress) this.officeAddress.patchValue(m.officeAddress);
        if (m.residentialAddress) this.residentialAddress.patchValue(m.residentialAddress);

        this.uploadedFiles.billPath = m.billPath || null;
        this.uploadedFiles.signaturePath = m.signaturePath || null;
        this.uploadedFiles.idProofPath = m.idProofPath || null;
        this.uploadedFiles.photoPath = m.photoPath || null;
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load membership', 'Error');
        this.router.navigate(['/view-membership-data']);
      }
    });
  }

  goToMemberships() {
    this.router.navigate(['/view-membership-data']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.membershipId) {
      this.loadMembershipForEdit(this.membershipId);
      return;
    }
    this.addMembershipForm.reset({ agreedToRules: false });
    this.uploadedFiles = { billPath: null, signaturePath: null, idProofPath: null, photoPath: null };
  }

  private markAllTouched(group: FormGroup) {
    Object.keys(group.controls).forEach(key => {
      const ctrl = group.get(key);
      ctrl?.markAsTouched();
      if (ctrl instanceof FormGroup) this.markAllTouched(ctrl);
    });
  }

  private buildAddressPayload(addr: any): any {
    return {
      id: addr?.id ?? null,
      houseNo: addr?.houseNo || '',
      streetName: addr?.streetName || '',
      landmark: addr?.landmark || '',
      location: addr?.location || '',
      village: addr?.village || '',
      villageOther: addr?.villageOther || '',
      mandal: addr?.mandal || '',
      mandalOther: addr?.mandalOther || '',
      district: addr?.district || '',
      state: addr?.state || '',
      pincode: addr?.pincode || ''
    };
  }

  private formatDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString().split('T')[0];
  }

  private formatDateTime(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString();
  }

  private formatDateForInput(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    const pad = (n: number) => `${n}`.padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}
