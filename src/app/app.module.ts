import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// used to create fake backend
import { fakeBackendProvider } from './_helpers';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { AdminComponent } from './admin';
import { LoginComponent } from './login';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { ToastrModule } from 'ngx-toastr';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { ProfileComponent } from './profile/profile.component';
import { PasswordSettingsComponent } from './password-settings/password-settings.component';
import { UserRegistrationComponent } from './user-registration/user-registration.component';
import { ProgramCreationComponent } from './PIA/program-creation/program-creation.component';
import { AddParticipantDataComponent } from './PIA/add-participant-data/add-participant-data.component';
import { VeiwProgramCreationComponent } from './PIA/veiw-program-creation/veiw-program-creation.component';
import { UpdateProgramExecutionComponent } from './PIA/update-program-execution/update-program-execution.component';
import { HasRoleDirective } from './app.component'; // Import the directive
import { ViewParticipateCreationComponent } from './PIA/view-praticipate-creation/view-praticipate-creation.component';
import { OrganizationsListComponent } from './organizations-list/organizations-list.component';
import { CaptureOutcomeComponent } from './PIA/capture-outcome/capture-outcome.component';
import { CaptureOutcomeDynamicComponent } from './PIA/capture-outcome-dynamic/capture-outcome-dynamic.component';
import { ESDPTrainingComponent } from './PIA/esdp-training/esdp-training.component';
import { ShgTrainingStatusComponent } from './PIA/shg-training-status/shg-training-status.component';
import { GlobalDashboardComponent } from './Dashboard/global-dashboard/global-dashboard.component';
import { MsmeCouncellorRegisterationComponent } from './PIA/msme-councellor-registeration/msme-councellor-registeration.component';
import { ViewParticipantComponent } from './PIA/view-participant/view-participant.component';
import { GetOutcomeComponent } from './PIA/get-outcome/get-outcome.component';
import { ViewMsmeCouncellorDataComponent } from './PIA/view-msme-councellor-data/view-msme-councellor-data.component';
import { ProgramSessionsComponent } from './PIA/program-sessions/program-sessions.component';
import { AllParticipantsVerificationComponent } from './CALL_CENTER/all-participants-verification/all-participants-verification.component';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AttentanceParticipantComponent } from './PIA/attentance-participant/attentance-participant.component';
import { VerificationParticipantComponent } from './CALL_CENTER/verification-participant/verification-participant.component';
import { RawMaterialsParticipantsComponent } from './PIA/raw-materials-participants/raw-materials-participants.component';
import { MaterialModule } from './shared/material/material/material.module';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ProgramExpenditureComponent } from './PIA/program-expenditure/program-expenditure.component';
import { BulkExpenditureComponent } from './PIA/bulk-expenditure/bulk-expenditure.component';
import { ProgramSummaryComponent } from './PIA/program-summary/program-summary.component';
import { AddProgramSessionsComponent } from './PIA/add-program-sessions/add-program-sessions.component';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
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
import { AssignCounsellorComponent } from './PIA/assign-counsellor/assign-counsellor.component';
import { ViewApplicationComponent } from './PIA/view-application/view-application.component';
import { RegistrationNewComponent } from './PIA/registration-new/registration-new.component';
import { StartupAssesmentComponent } from './PIA/startup-assesment/startup-assesment.component';
import { MatSelectFilterModule } from 'mat-select-filter';
import { MatFormFieldModule } from '@angular/material/form-field';import { StarRatingComponent } from './manual-components/star-rating/star-rating.component';
import { UploadParticipantsComponent } from './PIA/upload-participants/upload-participants.component';
import { TrainingTargetsComponent } from './PIA/training-targets/training-targets.component';
import { ProgressMonitoringComponent } from './PIA/progress-monitoring/progress-monitoring.component';
import { NonTrainingTargetsComponent } from './PIA/non-training-targets/non-training-targets.component';
import { TargetsAndAchievementsComponent } from './PIA/targets-and-achievements/targets-and-achievements.component';
import { MonthlyRangeComponent } from './PIA/monthly-range/monthly-range.component';
import { ViewProgramsSeperateComponent } from './PIA/view-programs-seperate/view-programs-seperate.component';
import { AddProjectComponent } from './aleapModules/add-project/add-project.component';
import { ViewProjectComponent } from './aleapModules/view-project/view-project.component';

@NgModule({
    imports: [
        MaterialModule,
        BrowserModule,
        MatSelectFilterModule,
        MatFormFieldModule,
        ReactiveFormsModule,
        HttpClientModule,
        AppRoutingModule,
        FormsModule,
        CommonModule,
        BrowserAnimationsModule,
        NgMultiSelectDropDownModule.forRoot(), // Make sure this is here
        ToastrModule.forRoot({
            positionClass: 'toast-top-right',
            timeOut: 15000, // 15 seconds
            closeButton: true,
            progressBar: true,
        }),
        MatTableModule,
        MatPaginatorModule,
        MatSortModule,
        NgxMaterialTimepickerModule,
        NgxDocViewerModule,
        FontAwesomeModule
    ],
    declarations: [
        AppComponent,
        HomeComponent,
        AdminComponent,
        LoginComponent,
        ProfileComponent,
        PasswordSettingsComponent,
        UserRegistrationComponent,
        ProgramCreationComponent,
        AddParticipantDataComponent,
        VeiwProgramCreationComponent,
        UpdateProgramExecutionComponent,
        HasRoleDirective, // Declare the directive
        ViewParticipateCreationComponent,
        OrganizationsListComponent,
        CaptureOutcomeComponent,
        CaptureOutcomeDynamicComponent,
        ESDPTrainingComponent,
        ShgTrainingStatusComponent,
        GlobalDashboardComponent,
        MsmeCouncellorRegisterationComponent,
        ViewParticipantComponent,
        GetOutcomeComponent,
        ViewMsmeCouncellorDataComponent,
        ProgramSessionsComponent, 
        AllParticipantsVerificationComponent, 
        AttentanceParticipantComponent,
        VerificationParticipantComponent,
        RawMaterialsParticipantsComponent,
        ProgramExpenditureComponent,
        BulkExpenditureComponent,
        ProgramSummaryComponent,
        AddProgramSessionsComponent,
        ViewProgramAgenciesComponent,
        ProgramMonitoringComponent,
        ViewAllAgencySessionsComponent,
        ViewCompletedComponent,
        CollageCreationComponent,
        CollageHomeComponent,
        PhysicalTargetsComponent,
        ViewAllAgencyCompletedComponent,
        FinancialTargetsComponent,
        ViewAllProgramsRelatedDataComponent,
        ProgramMonitoringNewComponent,
        FinanceExpenditureComponent,
        AssignCounsellorComponent,
        ViewApplicationComponent,
        RegistrationNewComponent,
        StartupAssesmentComponent,
        StarRatingComponent,
        UploadParticipantsComponent,
        TrainingTargetsComponent,
        ProgressMonitoringComponent,
        NonTrainingTargetsComponent,
        TargetsAndAchievementsComponent,
        MonthlyRangeComponent,
        ViewProgramsSeperateComponent,
        AddProjectComponent,
        ViewProjectComponent

    ],
    exports:[MaterialModule],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // provider used to create fake backend
        fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }