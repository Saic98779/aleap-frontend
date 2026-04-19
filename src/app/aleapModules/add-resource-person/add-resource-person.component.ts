import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  private readonly agencyId = JSON.parse(sessionStorage.getItem('user') || '{}')?.agencyId;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private commonService: CommonServiceService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
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
    this.commonService.add(APIS.programCreation.addResource, this.addResourcePersonForm.value).subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success('Resource Person Created Successfully', 'Success');
        this.router.navigate(['/add-sessions']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to create resource person', 'Error');
      }
    });
  }

  goToSessions(): void {
    this.router.navigate(['/add-sessions']);
  }

  resetForm(): void {
    this.submitted = false;
    this.addResourcePersonForm.reset({
      isVIP: false,
      agencyIds: [this.agencyId]
    });
  }
}
