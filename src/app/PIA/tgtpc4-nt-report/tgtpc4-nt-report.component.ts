import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
 import { FormBuilder, FormGroup, Validators } from '@angular/forms';
 import { Router } from '@angular/router';
 import { CommonServiceService } from '@app/_services/common-service.service';
 import { APIS } from '@app/constants/constants';
 import { ToastrService } from 'ngx-toastr';
 import moment from 'moment';
 declare var bootstrap: any;
 import DataTable from 'datatables.net-dt';
 import 'datatables.net-buttons-dt';
 import 'datatables.net-responsive-dt';
 import { MonthlyRangeComponent } from '../monthly-range/monthly-range.component';

@Component({
  selector: 'app-tgtpc4-nt-report',
  templateUrl: './tgtpc4-nt-report.component.html',
  styleUrls: ['./tgtpc4-nt-report.component.css']
})
export class Tgtpc4NtReportComponent implements OnInit {


  ngOnInit(): void {
  }
  
   @Input() activityId: any;
    @Input() subActivityId: any;
    @Output() handHoldingDataChange= new EventEmitter<number>();
  // ...existing code...
  tgtpcReportsForm!: FormGroup;
  tgtpcReportsList: any = [];
  iseditModeTgtpcReports = false;
  tgtpcReportsID: any;
  deleteTgtpcReportsID: any;

  constructor(private fb: FormBuilder, private toastrService: ToastrService,
       private _commonService: CommonServiceService,
       private router: Router) {
        this.getTgtpcReportsDataById()
       this.tgtpcReportsForm = this.createFormTgtpcReports();
       console.log('Sub Activity ID:', this.subActivityId);
  }

   ngOnChanges(): void {
    console.log('Activity ID changed:', this.activityId);
    console.log('Sub Activity ID changed:', this.subActivityId);
    
    if (this.activityId && this.subActivityId) {
      this.getTgtpcReportsDataById();
    }
  }

  // Create Form for TGTPC Reports
  createFormTgtpcReports(): FormGroup {
    return this.fb.group({
      sectorName: ['', [Validators.required, Validators.minLength(2)]],
      productName: ['', [Validators.required, Validators.minLength(2)]],
      reportSubmissionDate: ['', Validators.required],
      approvalDate: ['', Validators.required],
      nonTrainingSubActivityId: [0]
    });
  }

  get fTgtpcReports() {
    return this.tgtpcReportsForm.controls;
  }

  // Get TGTPC Reports Data
  getTgtpcReportsDataById() {
    this.tgtpcReportsList = [];
    this._commonService.getDataByUrl(APIS.nontrainingtargets.getTgtpcNtReports + this.subActivityId).subscribe((res: any) => {
      this.tgtpcReportsList = res.data;
      // this.financialTargetAchievement = 0;
      this.tgtpcReportsList?.map((item: any) => {
        // this.financialTargetAchievement += 1; // Count of reports
      });
    }, (error) => {
      console.error('Error fetching TGTPC reports:', error);
    });
  }
isSubmitted = false;
  // Open Modal for Add/Edit
  openModelTgtpcReports(mode: string, item?: any): void {
    if (mode === 'add') {
      this.tgtpcReportsForm.reset();
      this.iseditModeTgtpcReports = false;
      this.isSubmitted = false;
    }
    if (mode === 'edit') {
      this.tgtpcReportsID = item?.reportId;
      this.iseditModeTgtpcReports = true;
      this.tgtpcReportsForm.patchValue({
        sectorName: item?.sectorName || '',
        productName: item?.productName || '',
        reportSubmissionDate: item?.reportSubmissionDate ? this.convertToISOFormat(item?.reportSubmissionDate) : '',
        approvalDate: item?.approvalDate ? this.convertToISOFormat(item?.approvalDate) : '',
        nonTrainingSubActivityId: item?.nonTrainingSubActivityId || 0
      });
    }
    const modal1 = new bootstrap.Modal(document.getElementById('addTgtpcReports'));
    modal1.show();
  }
  convertToISOFormat(date: string): string {   
   if(date) {
     const [day, month, year] = date.split('-');
     return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
   }
   else{
     return '';
   }
  
 }
  // Submit Form
  onSubmitTgtpcReports(): void {
    this.isSubmitted = true;
    if (this.tgtpcReportsForm.valid) {
      this.fTgtpcReports['nonTrainingSubActivityId'].setValue(Number(this.subActivityId));

      if (this.iseditModeTgtpcReports) {
        // Update
        const payload = {
          ...this.tgtpcReportsForm.value,
          reportSubmissionDate: this.tgtpcReportsForm.value.reportSubmissionDate ? moment(this.tgtpcReportsForm.value.reportSubmissionDate).format('DD-MM-YYYY') : null,
          approvalDate: this.tgtpcReportsForm.value.approvalDate ? moment(this.tgtpcReportsForm.value.approvalDate).format('DD-MM-YYYY') : null
        };

        this._commonService.update(APIS.nontrainingtargets.updateTgtpcNtReports, payload, this.tgtpcReportsID).subscribe((res: any) => {
          this.toastrService.success('Report updated successfully', 'Success!');
          this.resetFormTgtpcReports();
          this.getTgtpcReportsDataById()
          this.isSubmitted = false;
          this.closeModalTgtpcReports();
          
        }, (error) => {
          this.toastrService.error(error.message, "Error!");
          this.resetFormTgtpcReports();
          this.getTgtpcReportsDataById()
          this.isSubmitted = false;
          this.closeModalTgtpcReports();
        });
      } else {
        // Add
        const payload = {
          ...this.tgtpcReportsForm.value,
          reportSubmissionDate: this.tgtpcReportsForm.value.reportSubmissionDate ? moment(this.tgtpcReportsForm.value.reportSubmissionDate).format('DD-MM-YYYY') : null,
          approvalDate: this.tgtpcReportsForm.value.approvalDate ? moment(this.tgtpcReportsForm.value.approvalDate).format('DD-MM-YYYY') : null
        };

        this._commonService.add(APIS.nontrainingtargets.saveTgtpcNtReports, payload).subscribe((res: any) => {
          this.toastrService.success('Report saved successfully', 'Success!');
          this.tgtpcReportsList.push(res.data);
          this.resetFormTgtpcReports();
          this.getTgtpcReportsDataById()
          this.isSubmitted = false;
          this.closeModalTgtpcReports();
          // this.getDeatilOfTargets();
        }, (error) => {
          this.toastrService.error(error.message, "Error!");
          this.resetFormTgtpcReports();
          this.getTgtpcReportsDataById()
          this.isSubmitted = false;
          this.closeModalTgtpcReports();
        });
      }
    }
  }

  // Delete Report
  deleteTgtpcReports(id: any): void {
    this.deleteTgtpcReportsID = id;
    const previewModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }

  ConfirmDeleteTgtpcReports(id: any) {
    this._commonService.deleteId(APIS.nontrainingtargets.deleteTgtpcNtReports, id).subscribe({
      next: (data: any) => {
        if (data?.status == 400) {
          this.toastrService.error(data?.message, "Error!");
          this.closeModalDeleteTgtpcReports();
          this.getTgtpcReportsDataById()
          this.deleteTgtpcReportsID = '';
        } else {
          this.closeModalDeleteTgtpcReports();
          this.getTgtpcReportsDataById()
          this.deleteTgtpcReportsID = '';
          this.toastrService.success('Record deleted successfully', "Success!");
          // this.getDeatilOfTargets();
        }
      },
      error: (err) => {
        this.closeModalDeleteTgtpcReports();
        this.getTgtpcReportsDataById()
        this.deleteTgtpcReportsID = '';
        this.toastrService.error(err.message, "Error!");
      }
    });
  }

  closeModalTgtpcReports(): void {
    const modalElement = document.getElementById('addTgtpcReports');
    const modal1 = modalElement ? bootstrap.Modal.getInstance(modalElement) : null;
    if (modal1) {
      modal1.hide();
    }
  }

  closeModalDeleteTgtpcReports(): void {
    const editSessionModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }

  resetFormTgtpcReports(): void {
    this.tgtpcReportsForm.reset();
    this.isSubmitted = false;
  }
}
