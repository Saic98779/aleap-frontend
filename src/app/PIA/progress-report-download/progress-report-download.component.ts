import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-progress-report-download',
  templateUrl: './progress-report-download.component.html',
  styleUrls: ['./progress-report-download.component.css']
})
export class ProgressReportDownloadComponent implements OnInit {
  
  reportForm!: FormGroup;
  agencyList: any = [];
  agencyListFiltered: any = [];
  financialYears: any = [];
  financialYRFiltered: any = [];
  selectedFinancialYear: any = '';
  username:any = '';
  dateRange = {
    start: null as Date | null,
    end: null as Date | null
  };

  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService
  ) {
    this.username = JSON.parse(sessionStorage.getItem('user') || '{}')?.userId
    console.log('Username:', this.username);
  }

  ngOnInit(): void {
    this.initializeForm();
    this.getAgenciesList();
    this.generateFinancialYears();
  }

  initializeForm() {
    this.reportForm = new FormGroup({
      agencyIds: new FormControl([], [Validators.required]),
      reportType: new FormControl('TARGET', [Validators.required]),
      trainingType: new FormControl('TRAINING_AND_NON_TRAINING', [Validators.required]),
      dateType: new FormControl('FINANCIAL_YEAR', [Validators.required]),
      financialYear: new FormControl('', [Validators.required])
    });
  }

  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe({
      next: (res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered = this.agencyList;
      },
      error: (error) => {
        this.toastrService.error('Error fetching agencies', 'Error');
      }
    });
  }

  generateFinancialYears() {
    const currentYear = new Date().getFullYear();
    const range = 2;
    
    for (let i = 2024; i < currentYear; i++) {
      this.financialYears.push(`${i}-${(i + 1)}`);
    }
    
    for (let i = 0; i <= range; i++) {
      const year = currentYear + i;
      this.financialYears.push(`${year}-${(year + 1)}`);
    }
    
    this.financialYRFiltered = this.financialYears;
    this.selectedFinancialYear = this.getCurrentFinancialYear();
    this.reportForm.patchValue({ financialYear: this.selectedFinancialYear });
  }

  getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 4 ? `${year}-${(year + 1)}` : `${year - 1}-${year}`;
  }
  onDateRangeChange() {


    // Triggered when date range changes
  }

  onReportTypeChange(value: string) {
    this.reportForm.patchValue({ reportType: value });
    
    // Clear date range when switching to TARGET
    if (value === 'TARGET') {
      this.dateRange = { start: null, end: null };
    }
  }

  onDateTypeChange(value: string) {
    this.reportForm.patchValue({ dateType: value });
    
    if (value === 'FINANCIAL_YEAR') {
      this.dateRange = { start: null, end: null };
    }
  }

  formatDate(date: Date | null): string {
    if (!date) return '';
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  buildPayload() {
    const formValue = this.reportForm.value;
   
    formValue.reportType === 'ACHIEVEMENT' ?formValue.dateType = 'DATE_RANGE':formValue.dateType = 'FINANCIAL_YEAR';
     const payload: any = {
      loginName: this.username,
      agencyIds: formValue.agencyIds,
      reportType: formValue.reportType,
      trainingType: formValue.trainingType,
      dateType: formValue.dateType,
      financialYear: formValue.financialYear
    };
    if (formValue.reportType === 'ACHIEVEMENT' && formValue.dateType === 'DATE_RANGE') {
      payload.fromDate = this.formatDate(this.dateRange.start);
      payload.toDate = this.formatDate(this.dateRange.end);
    }

    return payload;
  }

  validateForm(): boolean {
    if (this.reportForm.invalid) {
      this.toastrService.error('Please fill all required fields', 'Validation Error');
      return false;
    }

    const formValue = this.reportForm.value;
    
    if (formValue.reportType === 'ACHIEVEMENT') {
      if (!this.dateRange.start || !this.dateRange.end) {
        this.toastrService.error('Please select date range', 'Validation Error');
        return false;
      }
    }

    return true;
  }

  downloadReport(format: 'excel' | 'pdf') {
    if (!this.validateForm()) {
      return;
    }

    const payload = this.buildPayload();
    const endpoint = format === 'excel' 
      ? API_BASE_URL+'/export/progress/excel'
      : API_BASE_URL+'/export/progress/pdf';

    this._commonService.addDownload(endpoint, payload,'blob').subscribe({
      next: (response: Blob) => {
        // Create a blob URL and trigger download
        const blob = new Blob([response], { 
          type: format === 'excel' 
            ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            : 'application/pdf' 
        });
        
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `progress_report.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        link.click();
        
        window.URL.revokeObjectURL(url);
        this.toastrService.success(`${format.toUpperCase()} downloaded successfully`, 'Success');
      },
      error: (error) => {
        console.log('Error downloading report:', error);
        this.toastrService.error('Error downloading report', 'Error');
      }
    });
  }

  get f() {
    return this.reportForm.controls;
  }
}