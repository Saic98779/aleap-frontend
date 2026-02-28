import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-project',
  templateUrl: './add-project.component.html',
  styleUrls: ['./add-project.component.css']
})
export class AddProjectComponent implements OnInit {
  private readonly projectsStorageKey = 'aleapProjectData';
  addProjectForm!: FormGroup;
  submitted = false;
  loading = false;
  projectId: number | null = null;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
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
        ministryDepartment: new FormControl('', [Validators.required]),
        spocName: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]),
        spocDesignation: new FormControl('', [Validators.required]),
        spocContactNo: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
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
  }

  submitProject() {
    this.submitted = true;
    if (this.addProjectForm.invalid) {
      Object.values(this.addProjectForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    this.loading = true;

    const payload: any = {
      ...this.addProjectForm.value,
      projectId: this.projectId || Date.now(),
      beneficiariesListFileName: this.addProjectForm.value.beneficiariesListFile?.name || '',
      sanctionOrderFileName: this.addProjectForm.value.sanctionOrderFile?.name || '',
      updatedAt: new Date().toISOString()
    };

    delete payload.beneficiariesListFile;
    delete payload.sanctionOrderFile;

    const projects = this.getStoredProjects();
    const existingIndex = projects.findIndex((item: any) => item.projectId === payload.projectId);

    if (existingIndex > -1) {
      projects[existingIndex] = {
        ...projects[existingIndex],
        ...payload
      };
    } else {
      projects.unshift(payload);
    }

    this.saveStoredProjects(projects);
    this.toastrService.success(this.isEditMode ? 'Project Updated Successfully' : 'Project Added Successfully', 'Success');
    this.loading = false;
    this.router.navigate(['/view-project-data']);
  }

  loadProjectForEdit(projectId: number) {
    const projects = this.getStoredProjects();
    const currentProject = projects.find((item: any) => item.projectId === projectId);

    if (!currentProject) {
      this.toastrService.error('Project not found', 'Error');
      this.router.navigate(['/view-project-data']);
      return;
    }

    this.addProjectForm.patchValue({
      projectTitle: currentProject.projectTitle || '',
      fundingAgency: currentProject.fundingAgency || '',
      ministryDepartment: currentProject.ministryDepartment || '',
      spocName: currentProject.spocName || '',
      spocDesignation: currentProject.spocDesignation || '',
      spocContactNo: currentProject.spocContactNo || '',
      spocEmail: currentProject.spocEmail || '',
      projectCostLakhs: currentProject.projectCostLakhs || '',
      tenureStartDate: currentProject.tenureStartDate || '',
      tenureEndDate: currentProject.tenureEndDate || '',
      projectHeadTeam: currentProject.projectHeadTeam || '',
      briefDescription: currentProject.briefDescription || '',
      projectLocation: currentProject.projectLocation || '',
      beneficiariesCount: currentProject.beneficiariesCount || '',
      beneficiariesListFile: null,
      expectedImpactOutcome: currentProject.expectedImpactOutcome || '',
      sanctionOrderFile: null
    });

    this.addProjectForm.get('beneficiariesListFile')?.clearValidators();
    this.addProjectForm.get('beneficiariesListFile')?.updateValueAndValidity();
    this.addProjectForm.get('sanctionOrderFile')?.clearValidators();
    this.addProjectForm.get('sanctionOrderFile')?.updateValueAndValidity();
  }

  getStoredProjects(): any[] {
    const records = localStorage.getItem(this.projectsStorageKey);
    return records ? JSON.parse(records) : [];
  }

  saveStoredProjects(projects: any[]) {
    localStorage.setItem(this.projectsStorageKey, JSON.stringify(projects));
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
  }
}
