import { Component, OnDestroy, OnInit, ViewChild, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';
import { APIS } from '@app/constants/constants';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

const booleanRequired: ValidatorFn = (control: AbstractControl) =>
  control.value === true || control.value === false ? null : { required: true };

@Component({
  selector: 'app-registration-new',
  templateUrl: './registration-new.component.html',
  styleUrls: ['./registration-new.component.css']
})
export class RegistrationNewComponent implements OnInit, OnDestroy {
  @ViewChild('confirmModal') confirmModal!: ElementRef;
  @ViewChildren('schemeCheckbox') schemeCheckboxes!: QueryList<ElementRef<HTMLInputElement>>;

  registrationForm!: FormGroup;
  confirmationData: any;
  confirmModalRef: any;
  isEditMode = false;
  editingId: number | null = null;

  govtSchemes: string[] = [];
  digitalPlatforms: string[] = [];
  certifications: string[] = [];
  financialLinkages: string[] = [];

  readonly previewSections = [
    {
      title: 'Personal Details',
      fields: [
        { label: 'Name', key: 'name' },
        { label: 'Father / Husband Name', key: 'fatherOrHusbandName' },
        { label: 'Date of Birth', key: 'dateOfBirth' },
        { label: 'Age', key: 'age' },
        { label: 'Qualification', key: 'qualification' },
        { label: 'Email', key: 'emailId' },
        { label: 'Phone No.', key: 'phoneNo' },
        { label: 'Alternate Phone No.', key: 'alternatePhoneNo' }
      ]
    },
    {
      title: 'Demographics',
      fields: [
        { label: 'Gender', key: 'gender' },
        { label: 'Caste', key: 'caste' },
        { label: 'Disability', key: 'disability' }
      ]
    },
    {
      title: 'Address',
      fields: [
        { label: 'Door No.', key: 'doorNo' },
        { label: 'Street Name', key: 'streetName' },
        { label: 'Village', key: 'village' },
        { label: 'Panchayat Name', key: 'panchayatName' },
        { label: 'Mandal', key: 'mandal' },
        { label: 'District', key: 'district' },
        { label: 'State', key: 'state' },
        { label: 'Pincode', key: 'pincode' }
      ]
    },
    {
      title: 'Identification',
      fields: [
        { label: 'Aadhaar No.', key: 'aadharNo' },
        { label: 'PAN Card', key: 'panCard' }
      ]
    },
    {
      title: 'SHG Details',
      fields: [
        { label: 'SHG / Society Name', key: 'shgName' },
        { label: 'Years in SHG', key: 'yearsSpentInShg' },
        { label: 'SHG Leader Name', key: 'shgLeaderName' },
        { label: 'Position in SHG', key: 'positionInShg' },
        { label: 'Mandal Federation Name', key: 'mandalFederationName' },
        { label: 'Name of V.O', key: 'voName' }
      ]
    },
    {
      title: 'Income & Aspirations',
      fields: [
        { label: 'Source of Income', key: 'sourceOfIncome' },
        { label: 'Primary Skill', key: 'skills' },
        { label: 'Willing to Start/Expand Business', key: 'willingToStartBusiness' },
        { label: 'Business Type', key: 'businessType' },
        { label: 'Available for Training', key: 'availableForTraining' },
        { label: 'Work with MSME Counselors', key: 'willingToWorkWithMsme' }
      ]
    }
  ];

  selectedLanguage = 'en';
  private readonly scriptId = 'google-translate-script';

  constructor(
    private fb: FormBuilder,
    private _commonService: CommonServiceService,
    private toastr: ToastrService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // this.selectedLanguage = localStorage.getItem('registration_lang') || 'en';
    // this.loadGoogleTranslateScript();
    this.buildForm();
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.isEditMode = true;
      this.editingId = Number(idParam);
      if (this.editingId) {
        this.loadRegistrationById(this.editingId);
      }
    }
  }

  private loadRegistrationById(id: number) {
    this._commonService.getDataByUrl(APIS.questionnaire.byId + id).subscribe({
      next: (res: any) => {
        const data = this.extractResponseData(res);
        if (!data) {
          this.toastr.error('Registration data not found', 'Error');
          return;
        }
        this.patchFormForEdit(data);
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.message || 'Failed to load registration data', 'Error');
      }
    });
  }

  private extractResponseData(res: any) {
    if (res?.data && !Array.isArray(res.data)) return res.data;
    if (res?.id) return res;
    return null;
  }

  private patchFormForEdit(data: any) {
    const normalizedDate = data?.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';

    this.govtSchemes = Array.isArray(data?.govtSchemes) ? [...data.govtSchemes] : [];
    this.digitalPlatforms = Array.isArray(data?.digitalPlatforms) ? [...data.digitalPlatforms] : [];
    this.certifications = Array.isArray(data?.certifications) ? [...data.certifications] : [];
    this.financialLinkages = Array.isArray(data?.financialLinkages) ? [...data.financialLinkages] : [];

    this.registrationForm.patchValue({
      name: data?.name ?? '',
      fatherOrHusbandName: data?.fatherOrHusbandName ?? '',
      dateOfBirth: normalizedDate,
      age: data?.age ?? '',
      qualification: data?.qualification ?? '',
      emailId: data?.emailId ?? '',
      phoneNo: data?.phoneNo != null ? String(data.phoneNo) : '',
      alternatePhoneNo: data?.alternatePhoneNo != null ? String(data.alternatePhoneNo) : '',
      gender: data?.gender ?? '',
      caste: data?.caste ?? '',
      disability: data?.disability,
      doorNo: data?.doorNo ?? '',
      streetName: data?.streetName ?? '',
      village: data?.village ?? '',
      panchayatName: data?.panchayatName ?? '',
      mandal: data?.mandal ?? '',
      district: data?.district ?? '',
      state: data?.state ?? '',
      pincode: data?.pincode != null ? String(data.pincode) : '',
      aadharNo: data?.aadharNo ?? '',
      panCard: data?.panCard ?? '',
      shgName: data?.shgName ?? '',
      yearsSpentInShg: data?.yearsSpentInShg != null ? String(data.yearsSpentInShg) : '',
      shgLeaderName: data?.shgLeaderName ?? '',
      positionInShg: data?.positionInShg ?? '',
      mandalFederationName: data?.mandalFederationName ?? '',
      voName: data?.voName ?? '',
      sourceOfIncome: data?.sourceOfIncome ?? '',
      skills: data?.skills ?? '',
      willingToStartBusiness: data?.willingToStartBusiness,
      businessType: data?.businessType ?? '',
      availableForTraining: data?.availableForTraining,
      willingToWorkWithMsme: data?.willingToWorkWithMsme
    });

    this.registrationForm.get('age')?.setValue(data?.age ?? '');
    setTimeout(() => this.syncSchemeCheckboxes(), 0);
  }

  private buildForm() {
    this.registrationForm = this.fb.group({
      name: ['', Validators.required],
      fatherOrHusbandName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      age: [{ value: '', disabled: true }],
      qualification: [''],
      emailId: ['', [Validators.required, Validators.email]],
      phoneNo: ['', [Validators.required, Validators.pattern('^[6-9][0-9]{9}$')]],
      alternatePhoneNo: ['', Validators.pattern('^[6-9][0-9]{9}$')],
      gender: ['', Validators.required],
      caste: ['', Validators.required],
      disability: [null, booleanRequired],
      doorNo: ['', Validators.required],
      streetName: ['', Validators.required],
      village: ['', Validators.required],
      panchayatName: ['', Validators.required],
      mandal: ['', Validators.required],
      district: ['', Validators.required],
      state: ['Telangana', Validators.required],
      pincode: ['', [Validators.required, Validators.pattern('^[1-9][0-9]{5}$')]],
      aadharNo: ['', [Validators.required, Validators.pattern('^[2-9][0-9]{11}$')]],
      panCard: ['', [Validators.required, Validators.pattern('^[A-Z]{5}[0-9]{4}[A-Z]$')]],
      shgName: ['', Validators.required],
      yearsSpentInShg: ['', [Validators.required, Validators.pattern('^[0-9]+$')]],
      shgLeaderName: ['', Validators.required],
      positionInShg: ['', Validators.required],
      mandalFederationName: ['', Validators.required],
      voName: ['', Validators.required],
      sourceOfIncome: ['', Validators.required],
      skills: ['', Validators.required],
      willingToStartBusiness: [null, booleanRequired],
      businessType: ['', Validators.required],
      availableForTraining: [null, booleanRequired],
      willingToWorkWithMsme: [null, booleanRequired]
    });
  }

  get f() {
    return this.registrationForm.controls;
  }

  calculateAge() {
    const dob = this.registrationForm.get('dateOfBirth')?.value;
    if (dob) {
      const birth = new Date(dob);
      const diff = Date.now() - birth.getTime();
      const age = Math.floor(diff / 1000 / 60 / 60 / 24 / 365.25);
      this.registrationForm.get('age')?.setValue(age);
    }
  }

  onTableCheckbox(e: any) {
    const id = e.target.id;
    const checked = e.target.checked;
    const td = e.target.closest('td');
    if (!td) return;
    const col = td.cellIndex;
    let listName = '';
    switch (col) {
      case 0:
        listName = 'govtSchemes';
        break;
      case 1:
        listName = 'digitalPlatforms';
        break;
      case 2:
        listName = 'certifications';
        break;
      case 3:
        listName = 'financialLinkages';
        break;
      default:
        return;
    }
    this.updateArray(listName, id, checked);
  }

  private updateArray(listName: string, value: string, checked: boolean) {
    const arr: any = (this as any)[listName];
    if (checked) {
      if (!arr.includes(value)) {
        arr.push(value);
      }
    } else {
      const idx = arr.indexOf(value);
      if (idx > -1) arr.splice(idx, 1);
    }
  }

  private syncSchemeCheckboxes() {
    this.schemeCheckboxes?.forEach(cb => {
      const inputEl = cb.nativeElement;
      const td = inputEl.closest('td');
      if (!td) {
        inputEl.checked = false;
        return;
      }

      const col = td.cellIndex;
      let selectedList: string[] = [];
      switch (col) {
        case 0:
          selectedList = this.govtSchemes;
          break;
        case 1:
          selectedList = this.digitalPlatforms;
          break;
        case 2:
          selectedList = this.certifications;
          break;
        case 3:
          selectedList = this.financialLinkages;
          break;
      }
      inputEl.checked = selectedList.includes(inputEl.id);
    });
  }

  openConfirmation() {
    console.log('Form values:', this.registrationForm.value);
    if (this.registrationForm.invalid) {
      this.registrationForm.markAllAsTouched();
      return;
    }
    const raw = this.registrationForm.getRawValue();
    const payload: any = {
      ...raw,
      govtSchemes: this.govtSchemes,
      digitalPlatforms: this.digitalPlatforms,
      certifications: this.certifications,
      financialLinkages: this.financialLinkages
    };
    // convert string flags to boolean
    ['disability','willingToStartBusiness','availableForTraining','willingToWorkWithMsme'].forEach(k=>{
      if (payload[k] === 'true') payload[k] = true;
      if (payload[k] === 'false') payload[k] = false;
    });

    // convert certain string fields to numbers if present
    if (payload.phoneNo) payload.phoneNo = Number(payload.phoneNo);
    if (payload.alternatePhoneNo) payload.alternatePhoneNo = Number(payload.alternatePhoneNo);
    if (payload.age) payload.age = Number(payload.age);
    if (payload.pincode) payload.pincode = Number(payload.pincode);
    if (payload.yearsSpentInShg) payload.yearsSpentInShg = Number(payload.yearsSpentInShg);
    this.confirmationData = payload;
    this.confirmModalRef = new (window as any).bootstrap.Modal(this.confirmModal.nativeElement);
    this.confirmModalRef.show();
  }

  saveData() {
    console.log('Saving data:', this.confirmationData);
    if (!this.confirmationData) return;

    const request$ = this.isEditMode && this.editingId
      ? this._commonService.updateChangedata(APIS.questionnaire.update + this.editingId, this.confirmationData)
      : this._commonService.add(APIS.questionnaire?.save || '', this.confirmationData);

    request$.subscribe({
      next: res => {
        this.toastr.success(this.isEditMode ? 'Updated successfully' : 'Saved successfully', 'Success');
        this.confirmModalRef.hide();

        if (this.isEditMode) {
          this.router.navigateByUrl('/view-registration-new');
          return;
        }

        this.registrationForm.reset();
        this.govtSchemes = [];
        this.digitalPlatforms = [];
        this.certifications = [];
        this.financialLinkages = [];
        this.schemeCheckboxes?.forEach(cb => (cb.nativeElement.checked = false));
        this.confirmationData = null;
      },
      error: err => {
        this.toastr.error(err?.error?.message || err?.message || 'Error saving', 'Error');
      }
    });
  }
 getFieldPairs(fields: Array<{ label: string; key: string }>): Array<[any, any?]> {
    const pairs: Array<[any, any?]> = [];
    for (let i = 0; i < fields.length; i += 2) {
      pairs.push([fields[i], fields[i + 1]]);
    }
    return pairs;
  }
  ngOnDestroy(): void {
    // optional cleanup hook
  }

  // onLanguageChange(lang: string): void {
  //   this.selectedLanguage = lang || 'en';
  //   localStorage.setItem('registration_lang', this.selectedLanguage);
  //   this.applyLanguage(this.selectedLanguage);
  // }

  // private loadGoogleTranslateScript(): void {
  //   if ((window as any).google?.translate) {
  //     this.initTranslateElement();
  //     return;
  //   }

  //   window.googleTranslateElementInit = () => {
  //     this.initTranslateElement();
  //     this.applyLanguage(this.selectedLanguage);
  //   };

  //   if (!document.getElementById(this.scriptId)) {
  //     const script = document.createElement('script');
  //     script.id = this.scriptId;
  //     script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  //     script.async = true;
  //     document.body.appendChild(script);
  //   }
  // }

  // private initTranslateElement(): void {
  //   if (!document.getElementById('google_translate_element')) return;

  //   new window.google.translate.TranslateElement(
  //     {
  //       pageLanguage: 'en',
  //       includedLanguages: 'en,te',
  //       autoDisplay: false
  //     },
  //     'google_translate_element'
  //   );
  // }

  // private applyLanguage(lang: string): void {
  //   const target = lang || 'en';
  //   const cookieValue = `/en/${target}`;

  //   document.cookie = `googtrans=${cookieValue};path=/`;
  //   document.cookie = `googtrans=${cookieValue};domain=${window.location.hostname};path=/`;

  //   setTimeout(() => {
  //     const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  //     if (combo) {
  //       combo.value = target;
  //       combo.dispatchEvent(new Event('change'));
  //     }
  //   }, 500);
  // }

  formatFieldValue(key: string) {
    const value = this.confirmationData?.[key as keyof typeof this.confirmationData];
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (value === null || value === undefined || value === '') return '-';
    return value;
  }

  formatList(list?: string[]) {
    return list && list.length ? list.join(', ') : '-';
  }
}