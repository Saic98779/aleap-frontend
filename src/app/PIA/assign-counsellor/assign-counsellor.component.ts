import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-assign-counsellor',
  templateUrl: './assign-counsellor.component.html',
  styleUrls: ['./assign-counsellor.component.css']
})
export class AssignCounsellorComponent implements OnInit {
  assignCounsellorForm!: FormGroup;
  searchControl = new FormControl('');

  allCounsellors: any[] = [];
  counsellorList: any[] = [];
  selectedCounsellor: any = null;

  allDistricts: any[] = [];
  MandalListSHG: any[] = [];

  isLoading = false;
  isSubmitting = false;

  constructor(
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.buildForm();
    this.getAllCounsellors();
    this.getAllDistricts();
  }

  get f() {
    return this.assignCounsellorForm.controls;
  }

  buildForm() {
    this.assignCounsellorForm = new FormGroup({
      dateOfAllotment: new FormControl('', [Validators.required]),
      districtId: new FormControl('', [Validators.required]),
      mandalId: new FormControl('', [Validators.required])
    });
  }

  getAllCounsellors() {
    this.isLoading = true;
    this._commonService.getDataByUrl(APIS.counsellorAssignment.getAll).subscribe({
      next: (res: any) => {
        const list = this.normalizeCounsellorResponse(res);
        this.allCounsellors = list;
        this.counsellorList = [...list];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.allCounsellors = [];
        this.counsellorList = [];
        this.isLoading = false;
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load counsellor records', 'Error');
      }
    });
  }

  onSearch() {
    const value = (this.searchControl.value || '').toString().trim();

    if (!value) {
      this.counsellorList = [...this.allCounsellors];
      return;
    }

    if (/^[0-9]{10}$/.test(value)) {
      this.searchByContact(value);
      return;
    }

    this.counsellorList = this.allCounsellors.filter((item: any) => {
      const name = (item?.nameOfCounsellor || '').toString().toLowerCase();
      const contact = (item?.contactNo || '').toString();
      return name.includes(value.toLowerCase()) || contact.includes(value);
    });

    if (!this.counsellorList.length) {
      this.toastrService.info('No matching counsellor records found', 'Info');
    }
  }

  searchByContact(contactNo: string) {
    this.isLoading = true;
    const user = JSON.parse(sessionStorage.getItem('user') || '{}');
    const headers: any = {
      accept: '*/*'
    };

    if (user?.token) {
      headers.Authorization = `Bearer ${user.token}`;
    }

    this._commonService.getDataByUrl(APIS.counsellorAssignment.searchByContact + contactNo).subscribe({
      next: (res: any) => {
        this.counsellorList = this.normalizeCounsellorResponse(res);
        this.isLoading = false;
        if (!this.counsellorList.length) {
          this.toastrService.info('No counsellor found for this mobile number', 'Info');
        }
      },
      error: (err: any) => {
        this.counsellorList = [];
        this.isLoading = false;
        this.toastrService.error(err?.error?.message || err?.message || 'Search failed', 'Error');
      }
    });
  }

  selectCounsellor(item: any) {
    this.selectedCounsellor = item;
  }

  isSelected(item: any): boolean {
    const selectedId = this.getCounsellorId(this.selectedCounsellor);
    const itemId = this.getCounsellorId(item);
    return !!selectedId && !!itemId && selectedId === itemId;
  }

  getCounsellorId(item: any): any {
    return item?.counsellorRegistrationId || item?.id || item?.registrationId || item?.counsellorId;
  }

  getBasicDetails(item: any): string {
    return [
      item?.village,
      item?.mandalName || item?.mandal,
      item?.districtName || item?.district,
      item?.state
    ].filter(Boolean).join(', ');
  }

  getAllDistricts() {
    this.allDistricts = [];
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data?.data || [];
      },
      error: () => {
        this.allDistricts = [];
      }
    });
  }

  GetMandalByDistrictSHG(event: any) {
    this.MandalListSHG = [];
    this._commonService.getDataByUrl(APIS.masterList.getMandal + event).subscribe({
      next: (data: any) => {
        this.MandalListSHG = data?.data || [];
      },
      error: () => {
        this.MandalListSHG = [];
      }
    });
  }

  onDistrictChange(districtId: any) {
    this.assignCounsellorForm.patchValue({ mandalId: '' });

    if (!districtId) {
      this.MandalListSHG = [];
      return;
    }

    this.GetMandalByDistrictSHG(districtId);
  }

  submitForm() {
    if (!this.selectedCounsellor) {
      this.toastrService.warning('Please select a counsellor record', 'Validation');
      return;
    }

    if (this.assignCounsellorForm.invalid) {
      this.assignCounsellorForm.markAllAsTouched();
      this.toastrService.warning('Please fill all required fields', 'Validation');
      return;
    }

    const counsellorRegistrationId = this.getCounsellorId(this.selectedCounsellor);
    if (!counsellorRegistrationId) {
      this.toastrService.error('Selected counsellor id is missing', 'Error');
      return;
    }

    const payload = {
      counsellorRegistrationId,
      mandalId: this.assignCounsellorForm.value.mandalId,
      dateOfAllotment: this.assignCounsellorForm.value.dateOfAllotment
    };

    this.isSubmitting = true;
    this._commonService.add(APIS.counsellorAssignment.assignMandal, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastrService.success('Counsellor assigned successfully', 'Success');
        this.assignCounsellorForm.reset();
        this.MandalListSHG = [];
        this.selectedCounsellor = null;
        this.searchControl.setValue('');
        this.counsellorList = [...this.allCounsellors];
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to assign counsellor', 'Error');
      }
    });
  }

  private normalizeCounsellorResponse(res: any): any[] {
    const data = res?.data ?? res;
    if (Array.isArray(data)) {
      return data;
    }

    if (data) {
      return [data];
    }

    return [];
  }

}
