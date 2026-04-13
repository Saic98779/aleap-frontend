import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';

@Component({
  selector: 'app-add-employee',
  templateUrl: './add-employee.component.html'
})
export class AddEmployeeComponent implements OnInit {
  addEmployeeForm!: FormGroup;
  submitted = false;
  loading = false;
  employeeId: number | null = null;
  isEditMode = false;
  uploadedPhotoFile: File | string | null = null;

  readonly genders = ['MALE', 'FEMALE'];
  readonly categories = ['GENERAL', 'OBC', 'SC', 'ST', 'EWS'];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.employeeId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.employeeId) {
      this.isEditMode = true;
      this.loadEmployeeForEdit(this.employeeId);
    }
  }

  get f() {
    return this.addEmployeeForm.controls;
  }

  initializeForm() {
    this.addEmployeeForm = this.fb.group({
      name: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
      educationalQualification: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      category: new FormControl('', [Validators.required]),
      designation: new FormControl('', [Validators.required]),
      dateOfJoining: new FormControl('', [Validators.required]),
      dateOfRelieving: new FormControl(''),
      phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      photo: new FormControl(null)
    });
  }

  onPhotoFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files && input.files.length ? input.files[0] : null;
    this.addEmployeeForm.get('photo')?.setValue(selectedFile);
    this.addEmployeeForm.get('photo')?.markAsTouched();

    if (!selectedFile) {
      return;
    }

    const formData = new FormData();
    formData.append('files', selectedFile);
    this._commonService.uploadFile('Employee', formData).subscribe({
      next: (res: any) => {
        const filePath = res?.data?.[0] || null;
        this.addEmployeeForm.get('photo')?.setValue(filePath);
        this.uploadedPhotoFile = filePath;
      },
      error: () => {
        this.toastrService.error('File upload failed', 'Error');
        this.addEmployeeForm.get('photo')?.setValue(null);
        this.uploadedPhotoFile = null;
      }
    });
  }

  removePhotoFile(inputId: string): void {
    const existingFilePath = this.addEmployeeForm.get('photo')?.value;
    if (existingFilePath) {
      this._commonService.deleteId(APIS.uploadfiles.deleteFile, existingFilePath).subscribe({
        next: () => {
        },
        error: () => {
        }
      });
    }

    this.addEmployeeForm.get('photo')?.setValue(null);
    this.addEmployeeForm.get('photo')?.markAsTouched();
    this.addEmployeeForm.get('photo')?.updateValueAndValidity();
    this.uploadedPhotoFile = null;

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

  submitEmployee() {
    this.submitted = true;
    Object.keys(this.addEmployeeForm.controls).forEach(key => {
      this.addEmployeeForm.get(key)?.markAsTouched();
    });

    if (this.addEmployeeForm.invalid) {
      return;
    }

    const formValue = this.addEmployeeForm.value;
    const payload: any = {
      name: formValue.name,
      educationalQualification: formValue.educationalQualification,
      gender: formValue.gender,
      category: formValue.category,
      designation: formValue.designation,
      dateOfJoining: formValue.dateOfJoining,
      dateOfRelieving: formValue.dateOfRelieving || null,
      phone: formValue.phone,
      email: formValue.email,
      photo: formValue.photo || ''
    };

    this.loading = true;
    const request$ = this.isEditMode && this.employeeId
      ? this._commonService.update(APIS.employee.update, payload, this.employeeId)
      : this._commonService.add(APIS.employee.add, payload);

    request$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(`Employee ${this.isEditMode ? 'updated' : 'added'} successfully`, 'Success');
        this.router.navigate(['/view-employee']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'add'} employee`, 'Error');
      }
    });
  }

  loadEmployeeForEdit(employeeId: number) {
    this._commonService.getById(APIS.employee.getById, employeeId).subscribe({
      next: (res: any) => {
        const employee = res?.data ?? res;
        if (!employee) {
          this.toastrService.error('Employee data not found', 'Error');
          this.router.navigate(['/view-employee']);
          return;
        }

        this.addEmployeeForm.patchValue({
          name: employee.name || '',
          educationalQualification: employee.educationalQualification || '',
          gender: employee.gender || '',
          category: employee.category || '',
          designation: employee.designation || '',
          dateOfJoining: this.formatDateValue(employee.dateOfJoining),
          dateOfRelieving: this.formatDateValue(employee.dateOfRelieving),
          phone: employee.phone || '',
          email: employee.email || '',
          photo: employee.photo || ''
        });

        this.uploadedPhotoFile = employee.photo || null;
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load employee', 'Error');
        this.router.navigate(['/view-employee']);
      }
    });
  }

  goToEmployees() {
    this.router.navigate(['/view-employee']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.employeeId) {
      this.loadEmployeeForEdit(this.employeeId);
      return;
    }
    this.addEmployeeForm.reset({
      photo: null
    });
    this.uploadedPhotoFile = null;
  }

  private formatDateValue(value: any): string {
    if (!value) {
      return '';
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
  }
}
