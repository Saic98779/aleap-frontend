import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { APIS } from '@app/constants/constants';
import { CommonServiceService } from '@app/_services/common-service.service';

@Component({
  selector: 'app-add-resource-person',
  templateUrl: './add-resource-person.component.html',
  styleUrls: ['./add-resource-person.component.css']
})
export class AddResourcePersonComponent implements OnInit {
  addResourcePersonForm!: FormGroup;
  submitted = false;
  loading = false;
  isEditMode = false;
  resourceId: any = null;

  private readonly agencyId = JSON.parse(sessionStorage.getItem('user') || '{}')?.agencyId;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private commonService: CommonServiceService
  ) {}

  ngOnInit(): void {
    this.initializeForm();

    this.resourceId = this.route.snapshot.paramMap.get('id');
    if (!this.resourceId) {
      return;
    }

    this.isEditMode = true;
    const navState = history.state?.resource;
    if (navState) {
      this.patchResourceForm(navState);
      return;
    }

    this.loadResourceForEdit(this.resourceId);
  }

  get f() {
    return this.addResourcePersonForm.controls;
  }

  initializeForm(): void {
    this.addResourcePersonForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]+$/)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      organizationName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]],
      qualification: ['', Validators.required],
      designation: ['', Validators.required],
      isVIP: [false],
      specialization: ['', Validators.required],
      briefDescription: ['', Validators.required],
      gender: ['', Validators.required],
      agencyIds: [[this.agencyId]]
    });
  }

  onVipChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement)?.checked;
    this.addResourcePersonForm.patchValue({ isVIP: !!isChecked });

    const optionalForVip = [
      'mobileNo',
      'email',
      'organizationName',
      'qualification',
      'designation',
      'specialization',
      'briefDescription'
    ];

    if (isChecked) {
      optionalForVip.forEach((field) => {
        this.f[field]?.patchValue('');
        this.f[field]?.clearValidators();
        this.f[field]?.updateValueAndValidity();
      });
      return;
    }

    this.f['mobileNo']?.setValidators([Validators.required, Validators.pattern(/^[6789]\d{9}$/)]);
    this.f['email']?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]);
    this.f['organizationName']?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]);
    this.f['qualification']?.setValidators([Validators.required]);
    this.f['designation']?.setValidators([Validators.required]);
    this.f['specialization']?.setValidators([Validators.required]);
    this.f['briefDescription']?.setValidators([Validators.required]);

    optionalForVip.forEach((field) => {
      this.f[field]?.patchValue('');
      this.f[field]?.updateValueAndValidity();
    });
  }

  submitResourcePerson(): void {
    this.submitted = true;
    Object.keys(this.addResourcePersonForm.controls).forEach((key) => {
      this.addResourcePersonForm.get(key)?.markAsTouched();
    });

    if (this.addResourcePersonForm.invalid) {
      return;
    }

    this.loading = true;
    const payload = this.addResourcePersonForm.value;
    const request$ = this.isEditMode && this.resourceId
      ? this.commonService.update(APIS.resource.update, payload, this.resourceId)
      : this.commonService.add(APIS.programCreation.addResource, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(
          this.isEditMode ? 'Resource Person Updated Successfully' : 'Resource Person Created Successfully',
          'Success'
        );
        this.router.navigate(['/view-resource']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(
          err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'create'} resource person`,
          'Error'
        );
      }
    });
  }

  goToSessions(): void {
    this.router.navigate(['/add-sessions']);
  }

  resetForm(): void {
    if (this.isEditMode) {
      this.loadResourceForEdit(this.resourceId);
      return;
    }

    this.submitted = false;
    this.addResourcePersonForm.reset({
      isVIP: false,
      agencyIds: [this.agencyId]
    });
  }

  private loadResourceForEdit(resourceId: any): void {
    const endpoint = this.agencyId ? APIS.programCreation.getResource + '/' + this.agencyId : APIS.masterList.getresources;
    this.commonService.getDataByUrl(endpoint).subscribe({
      next: (res: any) => {
        const rows = this.normalizeList(res);
        const current = rows.find((item: any) => String(this.getResourceId(item)) === String(resourceId));
        if (!current) {
          this.toastrService.error('Resource data not found', 'Error');
          this.router.navigate(['/view-resource']);
          return;
        }
        this.patchResourceForm(current);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load resource details', 'Error');
        this.router.navigate(['/view-resource']);
      }
    });
  }

  private patchResourceForm(resource: any): void {
    this.addResourcePersonForm.patchValue({
      name: resource?.name || '',
      mobileNo: resource?.mobileNo || '',
      email: resource?.email || '',
      organizationName: resource?.organizationName || '',
      qualification: resource?.qualification || '',
      designation: resource?.designation || '',
      isVIP: !!resource?.isVIP,
      specialization: resource?.specialization || '',
      briefDescription: resource?.briefDescription || '',
      gender: resource?.gender || '',
      agencyIds: resource?.agencyIds || [this.agencyId]
    });

    if (resource?.isVIP) {
      this.onVipChange({ target: { checked: true } } as any);
    }
  }

  private normalizeList(res: any): any[] {
    const data = res?.data ?? res;
    return Array.isArray(data) ? data : data ? [data] : [];
  }

  private getResourceId(item: any): any {
    return item?.resourceId || item?.id;
  }
}
