import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { AuthenticationService } from '@app/_services';
import { APIS } from '@app/constants/constants';

@Component({
  selector: 'app-startup-assesment',
  templateUrl: './startup-assesment.component.html',
  styleUrls: ['./startup-assesment.component.css']
})
export class StartupAssesmentComponent implements OnInit {
  assessmentForm!: FormGroup;
  submitted = false;
  loading = false;
  assessmentId: number | null = null;
  isEditMode = false;

  readonly genderOptions = ['MALE', 'FEMALE', 'OTHER'];
  readonly businessPlanStatusOptions = ['YES', 'NO', 'IN_PROGRESS'];
  readonly businessGoalsClarityOptions = ['CLEAR', 'VAGUE', 'NONE'];
  readonly businessMentoringTypeOptions = [
    'BUSINESS_MODEL_REFINEMENT',
    'PRODUCT_MARKET_FIT',
    'PRICING_STRATEGY',
    'BUSINESS_EXPANSION_PLANNING',
    'COMPETITIVE_STRATEGY'
  ];
  readonly startupStageOptions = ['IDEA', 'PROTOTYPE', 'MVP', 'EARLY_REVENUE', 'GROWTH', 'SCALEUP'];
  readonly businessModelTypeOptions = ['B2B', 'B2C', 'B2G', 'OTHER'];
  readonly registrationTypeOptions = ['PVT_LTD', 'LLP', 'PARTNERSHIP', 'OPC', 'OTHER'];
  readonly supportNeededOptions = [
    'HIRING_STRATEGY',
    'SKILL_DEVELOPMENT_TRAINING',
    'FOUNDERS_CAPACITY_BUILDING',
    'TEAM_PERFORMANCE_MANAGEMENT',
    'HR_PAYROLL_SETUP'
  ];
  readonly primaryChallengeOptions = [
    'AWARENESS',
    'PRICING',
    'COMPETITION',
    'DIGITAL_MARKETING',
    'LOGISTICS',
    'OTHERS'
  ];
  readonly supportRequiredOptions = [
    'BRANDING_MARKETING',
    'DIGITAL_PRESENCE',
    'CUSTOMER_ACQUISITION',
    'EXPORT_READINESS',
    'B2B_B2C_B2G_LINKAGES'
  ];
  readonly revenueModelOptions = ['SUBSCRIPTION', 'COMMISSION', 'LICENSING', 'ONE_TIME_SALE', 'FREEMIUM', 'OTHERS'];
  readonly productReadinessLevelOptions = ['IDEA', 'UNDER_DEVELOPMENT', 'LAUNCHED', 'IMPROVING'];
  readonly productDevelopmentSupportsOptions = [
    'PRODUCT_DEVELOPMENT',
    'PROTOTYPING',
    'TECH_VALIDATION',
    'R_AND_D_COLLABORATION',
    'DESIGN_AND_PACKAGING',
    'QUALITY_TESTING_CERTIFICATION'
  ];
  readonly digitalMaturityToolsOptions = [
    'CRM',
    'INVENTORY_MANAGEMENT',
    'PAYMENT_GATEWAY',
    'WEBSITE_APP',
    'ERP',
    'NONE'
  ];
  readonly technicalInfrastructureSupportsOptions = [
    'IT_SYSTEMS_SETUP',
    'CYBERSECURITY',
    'CLOUD_SERVICES',
    'AI_ML_ADOPTION',
    'APP_WEB_DEVELOPMENT',
    'UI_UX_IMPROVEMENT'
  ];
  readonly infrastructureAssistanceOptions = [
    'INCUBATION_SPACE',
    'MANUFACTURING_SETUP',
    'EQUIPMENT_PROCUREMENT',
    'REGULATORY_CERTIFICATIONS'
  ];

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
    this.assessmentId = Number(this.route.snapshot.paramMap.get('id')) || null;
    if (this.assessmentId) {
      this.isEditMode = true;
      this.loadAssessmentForEdit(this.assessmentId);
    }
  }

  get f() { return this.assessmentForm.controls; }
  get keyTeamMembers(): FormArray { return this.assessmentForm.get('keyTeamMembers') as FormArray; }

  initializeForm() {
    this.assessmentForm = this.fb.group(
      {
        startupName: new FormControl('', [Validators.required]),
        founderName: new FormControl('', [Validators.required]),
        genderOfPrimaryFounder: new FormControl('', [Validators.required]),
        ageOfPrimaryFounder: new FormControl('', [Validators.required, Validators.min(15), Validators.max(100)]),
        educationalQualification: new FormControl('', [Validators.required]),
        email: new FormControl('', [Validators.required, Validators.email]),
        phone: new FormControl('', [Validators.required, Validators.pattern(/^[6-9]\d{9}$/)]),
        city: new FormControl('', [Validators.required]),
        district: new FormControl('', [Validators.required]),
        state: new FormControl('', [Validators.required]),
        dateOfEstablishment: new FormControl('', [Validators.required]),
        sectorIndustry: new FormControl('', [Validators.required]),
        webSite: new FormControl(''),

        productServiceDescription: new FormControl('', [Validators.required]),
        problemSolving: new FormControl('', [Validators.required]),
        uniqueValueProposition: new FormControl('', [Validators.required]),
        businessPlanStatus: new FormControl('', [Validators.required]),
        businessGoalsClarity: new FormControl('', [Validators.required]),
        businessMentoringTypes: new FormControl([]),
        startupStage: new FormControl('', [Validators.required]),
        businessModelType: new FormControl('', [Validators.required]),
        dpiitRegistered: new FormControl(null, [Validators.required]),
        registrationType: new FormControl(''),

        totalTeamSize: new FormControl('', [Validators.required, Validators.min(1)]),
        fullTimeEmployees: new FormControl('', [Validators.required, Validators.min(0)]),
        partTimeEmployees: new FormControl('', [Validators.required, Validators.min(0)]),
        keyTeamMembers: this.fb.array([]),
        supportNeeded: new FormControl([]),

        targetCustomerSegment: new FormControl('', [Validators.required]),
        customerSegmentClarityNeeded: new FormControl(null, [Validators.required]),
        primaryChallenges: new FormControl([]),
        supportRequired: new FormControl([]),
        revenueModel: new FormControl('', [Validators.required]),
        monthlyRevenue: new FormControl(''),

        productReadinessLevel: new FormControl('', [Validators.required]),
        productDevelopmentSupports: new FormControl([]),
        coreTechnologyUsed: new FormControl(''),
        ipsFiledOrPlanned: new FormControl(''),
        technicalInfrastructureNeeded: new FormControl(null, [Validators.required]),
        technicalInfrastructureDescription: new FormControl(''),
        digitalMaturityTools: new FormControl([]),
        technicalInfrastructureSupports: new FormControl([]),
        infraRelatedIssues: new FormControl(null, [Validators.required]),
        infrastructureAssistance: new FormControl([])
      },
      { validators: [this.validateDpiitRegistration, this.validateInfraDescription] }
    );
  }

  validateDpiitRegistration: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (group.get('dpiitRegistered')?.value === true && !`${group.get('registrationType')?.value || ''}`.trim()) {
      return { registrationTypeRequired: true };
    }
    return null;
  };

  validateInfraDescription: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    if (group.get('technicalInfrastructureNeeded')?.value === true && !`${group.get('technicalInfrastructureDescription')?.value || ''}`.trim()) {
      return { technicalInfrastructureDescriptionRequired: true };
    }
    return null;
  };

  buildTeamMemberGroup(data: any = {}): FormGroup {
    return this.fb.group({
      id: new FormControl(data?.id ?? null),
      startupSurveyId: new FormControl(data?.startupSurveyId ?? null),
      name: new FormControl(data?.name || '', [Validators.required]),
      designation: new FormControl(data?.designation || '', [Validators.required]),
      keyTasks: new FormControl(data?.keyTasks || '', [Validators.required])
    });
  }

  addTeamMember() {
    this.keyTeamMembers.push(this.buildTeamMemberGroup());
  }

  removeTeamMember(index: number) {
    this.keyTeamMembers.removeAt(index);
  }

  toggleMulti(controlName: string, option: string, event: any) {
    const current: string[] = [...(this.f[controlName].value || [])];
    if (event.target.checked) {
      if (!current.includes(option)) current.push(option);
    } else {
      const idx = current.indexOf(option);
      if (idx >= 0) current.splice(idx, 1);
    }
    this.f[controlName].setValue(current);
    this.f[controlName].markAsTouched();
  }

  isSelected(controlName: string, option: string): boolean {
    const val: string[] = this.f[controlName].value || [];
    return val.includes(option);
  }

  enumLabel(value: string): string {
    if (!value) return '';
    return value
      .split('_')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bAnd\b/g, '&')
      .replace(/\bB2b\b/g, 'B2B')
      .replace(/\bB2c\b/g, 'B2C')
      .replace(/\bB2g\b/g, 'B2G')
      .replace(/\bMvp\b/g, 'MVP')
      .replace(/\bHr\b/g, 'HR')
      .replace(/\bCrm\b/g, 'CRM')
      .replace(/\bErp\b/g, 'ERP')
      .replace(/\bIt\b/g, 'IT')
      .replace(/\bAi Ml\b/g, 'AI/ML')
      .replace(/\bUi Ux\b/g, 'UI/UX')
      .replace(/\bDpiit\b/g, 'DPIIT')
      .replace(/\bLlp\b/g, 'LLP')
      .replace(/\bOpc\b/g, 'OPC')
      .replace(/\bPvt Ltd\b/g, 'Pvt Ltd');
  }

  submitAssessment() {
    this.submitted = true;
    this.markAllTouched(this.assessmentForm);

    if (this.assessmentForm.invalid) {
      this.toastrService.error('Please fill all required fields correctly', 'Validation Error');
      return;
    }

    const v = this.assessmentForm.value;
    const currentUser: any = this._authService.userValue;
    const userId = currentUser?.userId || currentUser?.id || currentUser?.email || '';

    const payload: any = {
      startupName: v.startupName,
      founderName: v.founderName,
      genderOfPrimaryFounder: v.genderOfPrimaryFounder,
      ageOfPrimaryFounder: Number(v.ageOfPrimaryFounder),
      educationalQualification: v.educationalQualification,
      email: v.email,
      phone: v.phone,
      city: v.city,
      district: v.district,
      state: v.state,
      dateOfEstablishment: this.formatDate(v.dateOfEstablishment),
      sectorIndustry: v.sectorIndustry,
      webSite: v.webSite || '',

      productServiceDescription: v.productServiceDescription,
      problemSolving: v.problemSolving,
      uniqueValueProposition: v.uniqueValueProposition,
      businessPlanStatus: v.businessPlanStatus,
      businessGoalsClarity: v.businessGoalsClarity,
      businessMentoringTypes: v.businessMentoringTypes || [],
      startupStage: v.startupStage,
      businessModelType: v.businessModelType,
      dpiitRegistered: !!v.dpiitRegistered,
      registrationType: v.registrationType || '',

      totalTeamSize: Number(v.totalTeamSize),
      fullTimeEmployees: Number(v.fullTimeEmployees),
      partTimeEmployees: Number(v.partTimeEmployees),
      keyTeamMembers: (v.keyTeamMembers || []).map((m: any) => ({
        id: m.id ?? null,
        startupSurveyId: m.startupSurveyId ?? null,
        name: m.name,
        designation: m.designation,
        keyTasks: m.keyTasks
      })),
      supportNeeded: v.supportNeeded || [],

      targetCustomerSegment: v.targetCustomerSegment,
      customerSegmentClarityNeeded: !!v.customerSegmentClarityNeeded,
      primaryChallenges: v.primaryChallenges || [],
      supportRequired: v.supportRequired || [],
      revenueModel: v.revenueModel,
      monthlyRevenue: v.monthlyRevenue !== '' && v.monthlyRevenue != null ? Number(v.monthlyRevenue) : null,

      productReadinessLevel: v.productReadinessLevel,
      productDevelopmentSupports: v.productDevelopmentSupports || [],
      coreTechnologyUsed: v.coreTechnologyUsed || '',
      ipsFiledOrPlanned: v.ipsFiledOrPlanned || '',
      technicalInfrastructureNeeded: !!v.technicalInfrastructureNeeded,
      technicalInfrastructureDescription: v.technicalInfrastructureDescription || '',
      digitalMaturityTools: v.digitalMaturityTools || [],
      technicalInfrastructureSupports: v.technicalInfrastructureSupports || [],
      infraRelatedIssues: !!v.infraRelatedIssues,
      infrastructureAssistance: v.infrastructureAssistance || [],
      userId: userId
    };

    this.loading = true;
    const req$ = this.isEditMode && this.assessmentId
      ? this._commonService.update(APIS.startupAssessment.update, payload, this.assessmentId)
      : this._commonService.add(APIS.startupAssessment.add, payload);

    req$.subscribe({
      next: () => {
        this.loading = false;
        this.toastrService.success(`Assessment ${this.isEditMode ? 'updated' : 'submitted'} successfully`, 'Success');
        this.router.navigate(['/view-assessment']);
      },
      error: (err: any) => {
        this.loading = false;
        this.toastrService.error(err?.error?.message || err?.message || `Failed to ${this.isEditMode ? 'update' : 'submit'} assessment`, 'Error');
      }
    });
  }

  loadAssessmentForEdit(id: number) {
    this._commonService.getById(APIS.startupAssessment.getById, id).subscribe({
      next: (res: any) => {
        const a = res?.data ?? res;
        if (!a) {
          this.toastrService.error('Assessment not found', 'Error');
          this.router.navigate(['/view-assessment']);
          return;
        }

        this.assessmentForm.patchValue({
          startupName: a.startupName || '',
          founderName: a.founderName || '',
          genderOfPrimaryFounder: a.genderOfPrimaryFounder || '',
          ageOfPrimaryFounder: a.ageOfPrimaryFounder ?? '',
          educationalQualification: a.educationalQualification || '',
          email: a.email || '',
          phone: a.phone || '',
          city: a.city || '',
          district: a.district || '',
          state: a.state || '',
          dateOfEstablishment: this.formatDate(a.dateOfEstablishment),
          sectorIndustry: a.sectorIndustry || '',
          webSite: a.webSite || '',

          productServiceDescription: a.productServiceDescription || '',
          problemSolving: a.problemSolving || '',
          uniqueValueProposition: a.uniqueValueProposition || '',
          businessPlanStatus: a.businessPlanStatus || '',
          businessGoalsClarity: a.businessGoalsClarity || '',
          businessMentoringTypes: a.businessMentoringTypes || [],
          startupStage: a.startupStage || '',
          businessModelType: a.businessModelType || '',
          dpiitRegistered: a.dpiitRegistered,
          registrationType: a.registrationType || '',

          totalTeamSize: a.totalTeamSize ?? '',
          fullTimeEmployees: a.fullTimeEmployees ?? '',
          partTimeEmployees: a.partTimeEmployees ?? '',
          supportNeeded: a.supportNeeded || [],

          targetCustomerSegment: a.targetCustomerSegment || '',
          customerSegmentClarityNeeded: a.customerSegmentClarityNeeded,
          primaryChallenges: a.primaryChallenges || [],
          supportRequired: a.supportRequired || [],
          revenueModel: a.revenueModel || '',
          monthlyRevenue: a.monthlyRevenue ?? '',

          productReadinessLevel: a.productReadinessLevel || '',
          productDevelopmentSupports: a.productDevelopmentSupports || [],
          coreTechnologyUsed: a.coreTechnologyUsed || '',
          ipsFiledOrPlanned: a.ipsFiledOrPlanned || '',
          technicalInfrastructureNeeded: a.technicalInfrastructureNeeded,
          technicalInfrastructureDescription: a.technicalInfrastructureDescription || '',
          digitalMaturityTools: a.digitalMaturityTools || [],
          technicalInfrastructureSupports: a.technicalInfrastructureSupports || [],
          infraRelatedIssues: a.infraRelatedIssues,
          infrastructureAssistance: a.infrastructureAssistance || []
        });

        this.keyTeamMembers.clear();
        (a.keyTeamMembers || []).forEach((m: any) => this.keyTeamMembers.push(this.buildTeamMemberGroup(m)));
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load assessment', 'Error');
        this.router.navigate(['/view-assessment']);
      }
    });
  }

  goToAssessments() {
    this.router.navigate(['/view-assessment']);
  }

  resetForm() {
    this.submitted = false;
    if (this.isEditMode && this.assessmentId) {
      this.loadAssessmentForEdit(this.assessmentId);
      return;
    }
    this.assessmentForm.reset({
      businessMentoringTypes: [],
      supportNeeded: [],
      primaryChallenges: [],
      supportRequired: [],
      productDevelopmentSupports: [],
      digitalMaturityTools: [],
      technicalInfrastructureSupports: [],
      infrastructureAssistance: []
    });
    this.keyTeamMembers.clear();
  }

  private markAllTouched(group: FormGroup | FormArray) {
    Object.keys((group as any).controls).forEach(key => {
      const ctrl = (group as any).get(key);
      ctrl?.markAsTouched();
      if (ctrl instanceof FormGroup || ctrl instanceof FormArray) this.markAllTouched(ctrl);
    });
  }

  private formatDate(value: any): string {
    if (!value) return '';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString().split('T')[0];
  }
}
