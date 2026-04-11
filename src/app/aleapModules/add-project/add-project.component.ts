import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  
  readonly implementingAgencies = [
    'ALEAP',
    'AIC_ALEAP_WEHUB',
    'CED',
    'WEITTC',
    'ACGA'
  ];
  private readonly projectsStorageKey = 'aleapProjectData';
  addProjectForm!: FormGroup;
  submitted = false;
  loading = false;
  projectId: number | null = null;
  isEditMode = false;
  uploadedBeneficiariesFile: File | string | null = null;
  uploadedSanctionOrderFile: File | string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.projectId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.projectId) {
      this.isEditMode = true;
      this.loadProjectForEdit(this.projectId);
    }
  }

  get f() {
    return this.addProjectForm.controls;
  }

  initializeForm() {
    this.addProjectForm = this.fb.group(
      {
        projectTitle: new FormControl('', [Validators.required, Validators.pattern(/^[^\s].*/)]),
        fundingAgency: new FormControl('', [Validators.required]),
        implementingAgency: new FormControl('', [Validators.required]),
        ministryDepartment: new FormControl('', [Validators.required]),
        spocName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]),
        spocDesignation: new FormControl('', [Validators.required]),
        spocContact: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
        spocEmail: new FormControl('', [Validators.required, Validators.email]),
        projectCostLakhs: new FormControl('', [Validators.required, Validators.pattern(/^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/)]),
        tenureStartDate: new FormControl('', [Validators.required]),
        tenureEndDate: new FormControl('', [Validators.required]),
        projectHeadTeam: new FormControl('', [Validators.required]),
        briefDescription: new FormControl('', [Validators.required]),
        projectLocation: new FormControl('', [Validators.required]),
        beneficiariesCount: new FormControl('', [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
        beneficiariesListFile: new FormControl(null, [Validators.required]),
        expectedImpactOutcome: new FormControl('', [Validators.required]),
        sanctionOrderFile: new FormControl(null, [Validators.required])
      },
      { validators: this.validateTenureDates as ValidatorFn }
    );
  }

  validateTenureDates: ValidatorFn = (formGroup: AbstractControl): ValidationErrors | null => {
    const startDate = formGroup.get('tenureStartDate')?.value;
    const endDate = formGroup.get('tenureEndDate')?.value;

    if (!startDate || !endDate) {
      return null;
    }

    return new Date(endDate) < new Date(startDate) ? { invalidTenureDate: true } : null;
  };

  onFileChange(controlName: 'beneficiariesListFile' | 'sanctionOrderFile', event: Event) {
    const input = event.target as HTMLInputElement;
    const selectedFile = input.files && input.files.length ? input.files[0] : null;
    this.addProjectForm.get(controlName)?.setValue(selectedFile);
    this.addProjectForm.get(controlName)?.markAsTouched();
    if (!selectedFile) {
      return;
    }
    const formData = new FormData();
    formData.append('files', selectedFile);
    this._commonService.uploadFile('Project',formData).subscribe({
      next: (res: any) => {
        const filePath = res.data[0]; // Assuming the API returns the file path in this format
        this.addProjectForm.get(controlName)?.setValue(filePath);
        if (controlName === 'beneficiariesListFile') {
          this.uploadedBeneficiariesFile = filePath;
        } else {
          this.uploadedSanctionOrderFile = filePath;
        }
      },
      error: (err:any) => {
        this.toastrService.error('File upload failed', 'Error');
        this.addProjectForm.get(controlName)?.setValue(null);
        if (controlName === 'beneficiariesListFile') {
          this.uploadedBeneficiariesFile = null;
        } else {
          this.uploadedSanctionOrderFile = null;
        }
      }
    });
    // if (controlName === 'beneficiariesListFile') {
    //   this.uploadedBeneficiariesFile = selectedFile;
    //   return;
    // }

    // this.uploadedSanctionOrderFile = selectedFile;
  }

  removeFile(controlName: 'beneficiariesListFile' | 'sanctionOrderFile', inputId: string): void {
    this._commonService.deleteId(APIS.uploadfiles.deleteFile, this.addProjectForm.get(controlName)?.value).subscribe({
      next: (res:any) => {
        // this.toastrService.success('File deleted successfully', 'Success');
      },
      error: (err:any) => {
        // this.toastrService.error('Failed to delete file', 'Error');
      }
    });
    this.addProjectForm.get(controlName)?.setValue(null);
    this.addProjectForm.get(controlName)?.markAsTouched();
    this.addProjectForm.get(controlName)?.updateValueAndValidity();

    if (controlName === 'beneficiariesListFile') {
      this.uploadedBeneficiariesFile = null;
    } else {
      this.uploadedSanctionOrderFile = null;
    }

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

  submitProject() {
    this.submitted = true;
    
    // Mark all form controls as touched to show error messages
    Object.keys(this.addProjectForm.controls).forEach(key => {
      this.addProjectForm.get(key)?.markAsTouched();
    });

    if (this.addProjectForm.invalid) {
      // this.toastrService.error('Please fill all required fields before submitting', 'Validation Error');
      return;
    }

    this.loading = true;

    const formValue = this.addProjectForm.value;
    const payload = {
      titleOfProject: formValue.projectTitle,
      fundingAgency: formValue.fundingAgency,
      implementingAgency: formValue.implementingAgency,
      ministryOrConcernedDepartment: formValue.ministryDepartment,
      spocDesignation: formValue.spocDesignation,
      spocName: formValue.spocName,
      spocContact: formValue.spocContact,
      spocEmail: formValue.spocEmail,
      spocDetails: `${formValue.spocName}, ${formValue.spocDesignation}, ${formValue.spocContact}, ${formValue.spocEmail}`,
      projectCostInLakhs: parseFloat(formValue.projectCostLakhs),
      startDate: new Date(formValue.tenureStartDate).toISOString(),
      endDate: new Date(formValue.tenureEndDate).toISOString(),
      projectHeadAndTeam: formValue.projectHeadTeam,
      briefDescription: formValue.briefDescription,
      projectLocation: formValue.projectLocation,
      totalNoOfBeneficiaries: parseInt(formValue.beneficiariesCount),
      expectedImpactOrOutcome: formValue.expectedImpactOutcome,
      sanctionOrderFilePath: formValue.sanctionOrderFile,
      beneficiariesUploadFilePath: formValue.beneficiariesListFile
    };

    if (this.isEditMode && this.projectId) {
      this._commonService.update(APIS.projects.update, payload, this.projectId).subscribe({
        next: (res) => {
          this.toastrService.success('Project Updated Successfully', 'Success');
          this.loading = false;
          this.router.navigate(['/view-project-data']);
        },
        error: (err) => {
          this.toastrService.error('Failed to update project', 'Error');
          this.loading = false;
        }
      });
    } else {
      this._commonService.add(APIS.projects.add, payload).subscribe({
        next: (res) => {
          this.toastrService.success('Project Added Successfully', 'Success');
          this.loading = false;
          this.router.navigate(['/view-project-data']);
        },
        error: (err) => {
          this.toastrService.error('Failed to add project', 'Error');
          this.loading = false;
        }
      });
    }
  }

  loadProjectForEdit(projectId: number) {
    this._commonService.getById(APIS.projects.getById, projectId).subscribe({
      next: (res: any) => {
        // Assuming the API returns the project data
        const project = res.data;
        this.addProjectForm.patchValue({
          projectTitle: project.titleOfProject || '',
          fundingAgency: project.fundingAgency || '',
          implementingAgency: project.implementingAgency || '',
          ministryDepartment: project.ministryOrConcernedDepartment || '',
          spocName: project.spocName || '',
          spocDesignation: project.spocDesignation || '',
          spocContact: project.spocContact || '',
          spocEmail: project.spocEmail || '',
          projectCostLakhs: project.projectCostInLakhs?.toString() || '',
          tenureStartDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
          tenureEndDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
          projectHeadTeam: project.projectHeadAndTeam || '',
          briefDescription: project.briefDescription || '',
          projectLocation: project.projectLocation || '',
          beneficiariesCount: project.totalNoOfBeneficiaries?.toString() || '',
          beneficiariesListFile: project.beneficiariesUploadFilePath || null,
          expectedImpactOutcome: project.expectedImpactOrOutcome || '',
          sanctionOrderFile: project.sanctionOrderFilePath || null
        });

        this.uploadedBeneficiariesFile = project.beneficiariesUploadFilePath || null;
        this.uploadedSanctionOrderFile = project.sanctionOrderFilePath || null;

        this.addProjectForm.get('beneficiariesListFile')?.clearValidators();
        this.addProjectForm.get('beneficiariesListFile')?.updateValueAndValidity();
        this.addProjectForm.get('sanctionOrderFile')?.clearValidators();
        this.addProjectForm.get('sanctionOrderFile')?.updateValueAndValidity();
      },
      error: (err) => {
        this.toastrService.error('Failed to load project', 'Error');
        this.router.navigate(['/view-project-data']);
      }
    });
  }

  goToProjects() {
    this.router.navigate(['/view-project-data']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.projectId) {
      this.loadProjectForEdit(this.projectId);
      return;
    }
    this.addProjectForm.reset();
    this.uploadedBeneficiariesFile = null;
    this.uploadedSanctionOrderFile = null;
  }
  
}
