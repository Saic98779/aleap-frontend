import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
@Component({
  selector: 'app-msme-councellor-registeration',
  templateUrl: './msme-councellor-registeration.component.html',
  styleUrls: ['./msme-councellor-registeration.component.css']
})
export class MsmeCouncellorRegisterationComponent implements OnInit {
  agencyId: any;
  CounsellerForm!: FormGroup;
  allDistricts: any = [];
  MandalList: any = [];
  isEditMode = false;
  counsellorId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) {
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }

  ngOnInit(): void {
    this.formDetails();
    this.counsellorId = Number(this.route.snapshot.paramMap.get('id')) || null;
    this.isEditMode = !!this.counsellorId;
    this.getAllDistricts();

    if (this.isEditMode && this.counsellorId) {
      this.loadCounsellorForEdit(this.counsellorId);
    }
  }

  getAllDistricts() {
    this.allDistricts = [];
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
      },
      error: () => {
        this.allDistricts = [];
      }
    });
  }

  GetMandalByDistrict(event: any, selectedMandalId?: string | number | null) {
    this.MandalList = [];
    this._commonService.getDataByUrl(APIS.masterList.getMandal + event).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;

        if (selectedMandalId !== undefined && selectedMandalId !== null && selectedMandalId !== '') {
          this.CounsellerForm.patchValue({ mandalId: String(selectedMandalId) });
        }
      },
      error: () => {
        this.MandalList = [];
      }
    });
  }

  formDetails() {
    this.CounsellerForm = new FormGroup(
      {
        dateOfRegistration: new FormControl('', [Validators.required]),
        nameOfCounsellor: new FormControl('', [Validators.required]),
        dateOfBirth: new FormControl('', [Validators.required]),
        gender: new FormControl('', [Validators.required]),
        socialCategory: new FormControl('', [Validators.required]),
        educationalQualification: new FormControl('', [Validators.required]),
        districtId: new FormControl('', [Validators.required]),
        mandalId: new FormControl('', [Validators.required]),
        village: new FormControl('', [Validators.required]),
        houseNo: new FormControl('', [Validators.required]),
        streetName: new FormControl('', [Validators.required]),
        pincode: new FormControl('', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]),
        landmark: new FormControl('', [Validators.required]),
        expriance: new FormControl('', [Validators.required]),
        designation: new FormControl('', [Validators.required]),
        specialzation: new FormControl('', [Validators.required]),
        contactNo: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
        altContactNo: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
        emailId: new FormControl('', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)]),
        allortedDistrictId: new FormControl(''),
        allortedMandalId: new FormControl(''),
        dateOfSelection: new FormControl(''),
      }
    );
  }

  get f2() {
    return this.CounsellerForm.controls;
  }

  loadCounsellorForEdit(id: number) {
    const navStateData = history.state?.counsellorData;
    if (navStateData && this.getCounsellorId(navStateData) === id) {
      this.patchFormForEdit(navStateData);
      return;
    }

    this._commonService.getDataByUrl(APIS.counsellerData.getData).subscribe({
      next: (res: any) => {
        const rows = Array.isArray(res?.data) ? res.data : [];
        const selected = rows.find((item: any) => this.getCounsellorId(item) === id);
        if (!selected) {
          this.toastrService.error('Counseller record not found', 'Error');
          this.router.navigate(['/view-MSME-councellor']);
          return;
        }
        this.patchFormForEdit(selected);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load Counseller data', 'Error');
        this.router.navigate(['/view-MSME-councellor']);
      }
    });
  }

  patchFormForEdit(item: any) {
    const districtId = item?.districtId;
    const mandalId = item?.mandalId;

    this.CounsellerForm.patchValue({
      dateOfRegistration: this.formatDateForInput(item?.dateOfRegistration),
      nameOfCounsellor: item?.nameOfCounsellor || '',
      dateOfBirth: this.formatDateForInput(item?.dateOfBirth),
      gender: item?.gender || '',
      socialCategory: item?.socialCategory || '',
      educationalQualification: item?.educationalQualification || '',
      districtId: districtId !== undefined && districtId !== null ? String(districtId) : '',
      mandalId: mandalId !== undefined && mandalId !== null ? String(mandalId) : '',
      village: item?.village || '',
      houseNo: item?.houseNo || '',
      streetName: item?.streetName || '',
      pincode: item?.pincode || '',
      landmark: item?.landmark || '',
      expriance: item?.expriance ?? item?.experience ?? '',
      designation: item?.designation || '',
      specialzation: item?.specialzation ?? item?.specialization ?? '',
      contactNo: item?.contactNo || '',
      altContactNo: item?.altContactNo || '',
      emailId: item?.emailId || '',
      allortedDistrictId: item?.allortedDistrictId ?? item?.allocatedDistrictId ?? '',
      allortedMandalId: item?.allortedMandalId ?? item?.allocatedMandalId ?? '',
      dateOfSelection: this.formatDateForInput(item?.dateOfSelection)
    });

    if (districtId !== undefined && districtId !== null && districtId !== '') {
      this.GetMandalByDistrict(districtId, mandalId);
    }
  }

  formatDateForInput(dateValue: any): string {
    if (!dateValue) {
      return '';
    }

    const parsed = moment(dateValue, ['DD-MM-YYYY', 'YYYY-MM-DD', moment.ISO_8601], true);
    if (parsed.isValid()) {
      return parsed.format('YYYY-MM-DD');
    }

    const fallback = moment(dateValue);
    return fallback.isValid() ? fallback.format('YYYY-MM-DD') : '';
  }

  getCounsellorId(item: any): number | null {
    const id = item?.counsellorRegistrationId ?? item?.id;
    return id ? Number(id) : null;
  }

  buildPayload() {
    const formValue = this.CounsellerForm.value;
    return {
      ...formValue,
      districtId: formValue.districtId ? Number(formValue.districtId) : null,
      mandalId: formValue.mandalId ? Number(formValue.mandalId) : null,
      pincode: formValue.pincode ? Number(formValue.pincode) : null,
      expriance: formValue.expriance ? Number(formValue.expriance) : null,
      contactNo: formValue.contactNo ? Number(formValue.contactNo) : null,
      altContactNo: formValue.altContactNo ? Number(formValue.altContactNo) : null,
      allortedDistrictId: formValue.allortedDistrictId ? Number(formValue.allortedDistrictId) : null,
      allortedMandalId: formValue.allortedMandalId ? Number(formValue.allortedMandalId) : null,
      dateOfSelection: formValue.dateOfSelection ? moment(formValue.dateOfSelection).format('DD-MM-YYYY') : null,
      dateOfRegistration: moment(formValue.dateOfRegistration).format('DD-MM-YYYY'),
      dateOfBirth: moment(formValue.dateOfBirth).format('DD-MM-YYYY')
    };
  }

  submitForm() {
    if (this.CounsellerForm.invalid) {
      this.CounsellerForm.markAllAsTouched();
      this.toastrService.error('Please fill all mandatory fields correctly.', 'Validation Error');
      return;
    }

    const payload = this.buildPayload();

    if (this.isEditMode && this.counsellorId) {
      this._commonService.update(APIS.counsellerData.update, payload, this.counsellorId).subscribe({
        next: () => {
          this.toastrService.success('Counseller Data Updated Successfully', 'Success');
          this.router.navigate(['/view-MSME-councellor']);
        },
        error: (err: any) => {
          this.toastrService.error(err?.error?.message || err?.message || 'Failed to update Counseller data', 'Error');
        }
      });
      return;
    }

    this._commonService.add(
      APIS.counsellerData.add,
      payload
    ).subscribe({
      next: () => {
        this.CounsellerForm.reset();
        this.toastrService.success('Counseller Data Added Successfully', 'Counseller Data Success!');
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to add Counseller data', 'Counseller Data Error!');
        new Error(err);
      },
    });
  }

}
