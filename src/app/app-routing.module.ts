import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { LoginComponent } from './login';
import { AuthGuard } from './_helpers';
import { Role } from './_models';
import { ProfileComponent } from './profile/profile.component';
import { PasswordSettingsComponent } from './password-settings/password-settings.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { ProgramCreationComponent } from './PIA/program-creation/program-creation.component';
import { VeiwProgramCreationComponent } from './PIA/veiw-program-creation/veiw-program-creation.component';
import { AddParticipantDataComponent } from './PIA/add-participant-data/add-participant-data.component';
import { UpdateProgramExecutionComponent } from './PIA/update-program-execution/update-program-execution.component';
import { ViewParticipateCreationComponent } from './PIA/view-praticipate-creation/view-praticipate-creation.component';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { CaptureOutcomeComponent } from './PIA/capture-outcome/capture-outcome.component';
import { CaptureOutcomeDynamicComponent } from './PIA/capture-outcome-dynamic/capture-outcome-dynamic.component';
import { ESDPTrainingComponent } from './PIA/esdp-training/esdp-training.component';
import { ShgTrainingStatusComponent } from './PIA/shg-training-status/shg-training-status.component';
import { MsmeCouncellorRegisterationComponent } from './PIA/msme-councellor-registeration/msme-councellor-registeration.component';
import { ViewMsmeCouncellorDataComponent } from './PIA/view-msme-councellor-data/view-msme-councellor-data.component';
import { GlobalDashboardComponent } from './Dashboard/global-dashboard/global-dashboard.component';
import { ViewParticipantComponent } from './PIA/view-participant/view-participant.component';
import { ProgramSessionsComponent } from './PIA/program-sessions/program-sessions.component';
import { AllParticipantsVerificationComponent } from './CALL_CENTER/all-participants-verification/all-participants-verification.component';
import { AttentanceParticipantComponent } from './PIA/attentance-participant/attentance-participant.component';
import { VerificationParticipantComponent } from './CALL_CENTER/verification-participant/verification-participant.component';
import { RawMaterialsParticipantsComponent } from './PIA/raw-materials-participants/raw-materials-participants.component';
import { ProgramExpenditureComponent } from './PIA/program-expenditure/program-expenditure.component';
import { BulkExpenditureComponent } from './PIA/bulk-expenditure/bulk-expenditure.component';
import { ProgramSummaryComponent } from './PIA/program-summary/program-summary.component';
import { AddProgramSessionsComponent } from './PIA/add-program-sessions/add-program-sessions.component';
import { ViewProgramAgenciesComponent } from './PIA/view-program-agencies/view-program-agencies.component';
import { ProgramMonitoringComponent } from './PIA/program-monitoring/program-monitoring.component';
import { ViewAllAgencySessionsComponent } from './PIA/view-all-agency-sessions/view-all-agency-sessions.component';
import { ViewCompletedComponent } from './PIA/view-completed/view-completed.component';

import { CollageHomeComponent } from './PIA/collage-home/collage-home.component';
import { CollageCreationComponent } from './PIA/collage-creation/collage-creation.component';
import { PhysicalTargetsComponent } from './PIA/physical-targets/physical-targets.component';
import { ViewAllAgencyCompletedComponent } from './PIA/view-all-agency-completed/view-all-agency-completed.component';
import { FinancialTargetsComponent } from './PIA/financial-targets/financial-targets.component';
import { ViewAllProgramsRelatedDataComponent } from './PIA/view-all-programs-related-data/view-all-programs-related-data.component';
import { ProgramMonitoringNewComponent } from './PIA/program-monitoring-new/program-monitoring-new.component';
import { FinanceExpenditureComponent } from './PIA/finance-expenditure/finance-expenditure.component';
import { ViewApplicationComponent } from './PIA/view-application/view-application.component';
import { AssignCounsellorComponent } from './PIA/assign-counsellor/assign-counsellor.component';
import { RegistrationNewComponent } from './PIA/registration-new/registration-new.component';
import { StartupAssesmentComponent } from './PIA/startup-assesment/startup-assesment.component';
import { UploadParticipantsComponent } from './PIA/upload-participants/upload-participants.component';
import { TrainingTargetsComponent } from './PIA/training-targets/training-targets.component';
import { ProgressMonitoringComponent } from './PIA/progress-monitoring/progress-monitoring.component';
import { NonTrainingTargetsComponent } from './PIA/non-training-targets/non-training-targets.component';
import { TargetsAndAchievementsComponent } from './PIA/targets-and-achievements/targets-and-achievements.component';
import { ViewProgramsSeperateComponent } from './PIA/view-programs-seperate/view-programs-seperate.component';
import { NonTrainingTargetCodeComponent } from './PIA/non-training-target-code/non-training-target-code.component';
import { NonTrainingCoiComponent } from './PIA/non-training-coi/non-training-coi.component';
import { NonTrainingProgressWehubComponent } from './PIA/non-training-progress-wehub/non-training-progress-wehub.component';
import { NonTrainingCipetComponent } from './PIA/non-training-cipet/non-training-cipet.component';
import { NonTrainingTihclComponent } from './PIA/non-training-tihcl/non-training-tihcl.component';
import { QuestionAssignmentComponent } from './PIA/question-assignment/question-assignment.component';
import { NotificationViewerUpdateComponent } from './PIA/notification-viewer-update/notification-viewer-update.component';
import { ResheduleProgramsComponent } from './PIA/reshedule-programs/reshedule-programs.component';
import { ProgressMonitoringReportComponent } from './PIA/progress-monitoring-report/progress-monitoring-report.component';
import { DownloadExcelPdfComponent } from './PIA/download-excel-pdf/download-excel-pdf.component';
import { NonTrainingNimsmeComponent } from './PIA/non-training-nimsme/non-training-nimsme.component';
import { MsmeByMonthComponent } from './PIA/msme-by-month/msme-by-month.component';
import { MsmeByQuarterComponent } from './PIA/msme-by-quarter/msme-by-quarter.component';
import { ProgramMonitoringReportApprovalComponent } from './PIA/program-monitoring-report-approval/program-monitoring-report-approval.component';
import { AddNonParticipantsDataComponent } from './PIA/add-non-participants-data/add-non-participants-data.component';
import { OutputProgressComponent } from './PIA/output-progress/output-progress.component';
import { TrainigNontrainingTargetsComponent } from './PIA/trainig-nontraining-targets/trainig-nontraining-targets.component';
import { NonTrainingTgtpc10Component } from './PIA/non-training-tgtpc10/non-training-tgtpc10.component';
import { NonTrainingTgtpc4Component } from './PIA/non-training-tgtpc4/non-training-tgtpc4.component';
import { NonTrainingRich6aComponent } from './PIA/non-training-rich6a/non-training-rich6a.component';
import { HelpSupportComponent } from './PIA/help-support/help-support.component';
import { ViewIncompleteParticipantsComponent } from './PIA/view-incomplete-participants/view-incomplete-participants.component';

import { ViewResourceListComponent } from './master-list/pages/view-resource-list/view-resource-list.component';
import { MasterListComponent } from './master-list/master-list.component';
import { ViewOutcomesComponent } from './PIA/view-outcomes/view-outcomes.component';
import { NonTrainingExpendituresComponent } from './PIA/non-training-expenditures/non-training-expenditures.component';
import { ViewProgramDicComponent } from './PIA/view-program-dic/view-program-dic.component';
import { TrainingExpenditureVerificatonComponent } from './PIA/training-expenditure-verificaton/training-expenditure-verificaton.component';
import { NonTrainingExpVerficationTrackerComponent } from './PIA/non-training-exp-verfication-tracker/non-training-exp-verfication-tracker.component';
import { EditProgramStatusViewComponent } from './PIA/edit-program-status-view/edit-program-status-view.component';
import { SampleUiComponent } from './PIA/sample-ui/sample-ui.component';
import { ProgressReportDownloadComponent } from './PIA/progress-report-download/progress-report-download.component';
const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'admin',
        component: AdminComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU] }
    },
    {
        path: 'profile',
        component: ProfileComponent,
    },
    {
        path: 'password-settings',
        component: PasswordSettingsComponent,
    },
    {
        path: 'user-registration',
        component: UserRegistrationComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU] }
    },
    {
        path: 'program-creation',
        component: ProgramCreationComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'program-creation-edit/:id',
        component: ProgramCreationComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'veiw-program-creation',
        component: VeiwProgramCreationComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    //   {
    //     path: 'program-monitoring',
    //     component: ProgramMonitoringComponent,
    //     canActivate: [AuthGuard],
    //     data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    // },
     {
        path: 'training-Expenditure-verfication',
        component: TrainingExpenditureVerificatonComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,,Role.FINANCE] }
    },
     {
        path: 'expenditure-verification',
        component: FinanceExpenditureComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.FINANCE] }
    },
     {
        path: 'Non-training-Expenditure',
        component: NonTrainingExpendituresComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.FINANCE] }
    },
     {
        path: 'edit-program-status-view',
        component: EditProgramStatusViewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.FINANCE] }
    },
     {
        path: 'Non-training-Expenditure-tracker',
        component: NonTrainingExpVerficationTrackerComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.FINANCE] }
    },
   
     {
        path: 'program-monitoring',
        component: ProgramMonitoringNewComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'veiw-program',
        component: ViewProgramAgenciesComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'veiw-program-dic',
        component: ViewProgramDicComponent,
        canActivate: [AuthGuard],
    },
    {
        path: 'add-participant-data',
        component: AddParticipantDataComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'add-participant-data-edit/:id',
        component: AddParticipantDataComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'add-non-participant-data',
        component: AddNonParticipantsDataComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'add-non-participant-data-edit/:id',
        component: AddNonParticipantsDataComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'update-program-execution',
        component: UpdateProgramExecutionComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-program-participate',
        component: ViewParticipateCreationComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'upload-program-participate',
        component: UploadParticipantsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-table-organization',
        component: MasterListComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER, Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-Outcomes',
        component: ViewOutcomesComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER, Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'capture-outcome',
        component: CaptureOutcomeDynamicComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'esdp-training',
        component: ESDPTrainingComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },   
    {
        path: 'view-application',
        component: ViewApplicationComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    }, 
    {
        path: 'shg-training',
        component: ShgTrainingStatusComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'MSME-councellor-registeration',
        component: MsmeCouncellorRegisterationComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
      {
        path: 'assign-Counsellor',
        component: AssignCounsellorComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
      {
        path: 'Registration',
        component: RegistrationNewComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'assessment',
        component: StartupAssesmentComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-MSME-councellor',
        component: ViewMsmeCouncellorDataComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'global-dashboard',
        component: GlobalDashboardComponent,
        canActivate: [AuthGuard],
        // data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.CALL_CENTER,Role.Admin,Role.SPIU,Role.DIC,Role.FINANCE] }
    },
    {
        path: 'notification-viewer-update',
        component: NotificationViewerUpdateComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.CALL_CENTER,Role.Admin,Role.SPIU] }
    },
    {
        path: 'view-participant-data',
        component: ViewParticipantComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'ViewPrograms-district-wise',
        component: ViewProgramsSeperateComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-Completed-data',
        component: ViewCompletedComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-Completed-program-related',
        component: ViewAllProgramsRelatedDataComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-Completed-data-new',
        component: ViewAllAgencyCompletedComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'program-sessions',
        component: ProgramSessionsComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'add-sessions',
        component: AddProgramSessionsComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'view-agency-sessions',
        component: ViewAllAgencySessionsComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU] }
    },
    {
        path: 'program-sessions-edit/:id',
        component: ProgramSessionsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'attendance-Participant',
        component: AttentanceParticipantComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'rawMaterials-Participant',
        component: RawMaterialsParticipantsComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'program-expenditure',
        component: ProgramExpenditureComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'program-summary',
        component: ProgramSummaryComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'collage-home',
        component: CollageHomeComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'collage-creation',
        component: CollageCreationComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'bulk-expenditure',
        component: BulkExpenditureComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR]}
    },
    {
        path: 'participant-details',
        component: VerificationParticipantComponent,
        canActivate: [AuthGuard],
        data: { roles:  [Role.CALL_CENTER] }
    },
    {
        path: 'financial-targets',
        component: FinancialTargetsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'physical-targets',
        component: PhysicalTargetsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'training-targets',
        component: TrainingTargetsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'download-excel-pdf',
        component: DownloadExcelPdfComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU, Role.AGENCY_MANAGER, Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-nimme',
        component: NonTrainingNimsmeComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-targets',
        component: NonTrainingTargetsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress',
        component: NonTrainingTargetCodeComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
      {
        path: 'non-training-progress-wehub',
        component: NonTrainingProgressWehubComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-coi',
        component: NonTrainingCoiComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path:"reshedule-programs",
        component:ResheduleProgramsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-cipet',
        component: NonTrainingCipetComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-tgtpc4',
        component: NonTrainingTgtpc4Component,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-rich6a',
        component: NonTrainingRich6aComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'non-training-progress-tgtpc10',
        component: NonTrainingTgtpc10Component,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'non-training-progress-tihcl',
        component: NonTrainingTihclComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'progress-monitoring',
        component: ProgressMonitoringComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'output-progress',
        component: OutputProgressComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path:'question-assignment',
        component:QuestionAssignmentComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU] }
    },
    {
        path: 'progress-monitoring-report',
        component: ProgressMonitoringReportComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'progress-monitoring-report-approval',
        component: ProgramMonitoringReportApprovalComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.DEPARTMENT] }
    },
    {
        path: 'msme-by-month',
        component: MsmeByMonthComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU, Role.AGENCY_MANAGER, Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'msme-by-quarter',
        component: MsmeByQuarterComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU, Role.AGENCY_MANAGER, Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'Training-Non-trainingAchievements',
        component: TargetsAndAchievementsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
     {
        path: 'Training-Non-training-targets',
        component: TrainigNontrainingTargetsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR] }
    },
    {
        path: 'help-support',
        component: HelpSupportComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.CALL_CENTER,Role.DEVELOPER] }
    },
    {
        path: 'sample-screen-ui',
        component: SampleUiComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.DEVELOPER] }
    },
     {
        path: 'progress-report-download',
        component: ProgressReportDownloadComponent,
        canActivate: [AuthGuard],
       
    },
     {
        path: 'view-participants-incomplete-programs',
        component: ViewIncompleteParticipantsComponent,
        canActivate: [AuthGuard],
        data: { roles: [Role.Admin,Role.SPIU,Role.AGENCY_MANAGER,Role.AGENCY_EXECUTOR,Role.CALL_CENTER] }
    },
    {
        path: 'login',
        component: LoginComponent
    },

    // otherwise redirect to home
    { path: '**', redirectTo: '' }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
