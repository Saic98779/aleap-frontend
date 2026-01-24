import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { Role } from '@app/_models';
import { LoaderService } from '@app/common_components/loader-service.service';

@Component({
  selector: 'app-download-excel-pdf',
  templateUrl: './download-excel-pdf.component.html',
  styleUrls: ['./download-excel-pdf.component.css']
})
export class DownloadExcelPdfComponent implements OnInit {
  currentUser: any;
  isAdmin: boolean = false;
  agencyId: any;
  agencyList: any[] = [];
  agencyListFiltered: any[] = [];
  programList: any[] = [];
  programListFiltered: any[] = [];
  selectedAgencyId: any = '';
  selectedProgramId: any = '';
  isDownloading: boolean = false;

  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private loaderService: LoaderService
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.isAdmin = this.currentUser.userRole === 'ADMIN' || this.currentUser.userRole === 'SPIU';
    this.agencyId = this.currentUser.agencyId;

    if (this.isAdmin) {
      this.getAgenciesList();
    } else {
      this.selectedAgencyId = this.agencyId;
      this.getProgramsByAgency(this.agencyId);
    }
  }

  getAgenciesList() {
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe({
      next: (res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered = this.agencyList;
      },
      error: (err) => {
        this.toastrService.error(err.error.message);
      },
    });
  }

  getProgramsByAgency(agencyId: any) {
    if (!agencyId) {
      this.programList = [];
      this.programListFiltered = [];
      this.selectedProgramId = '';
      return;
    }
    this.loaderService.show()
    this._commonService
      .getDataByUrl(`${APIS.programCreation.getNewProgramListByAgency + agencyId}?statuses=Sessions%20Created&statuses=Participants%20Added&statuses=Attendance%20Marked&statuses=Program%20Execution%20Updated&statuses=Program%20Execution&statuses=Program%20Expenditure%20Updated&statuses=Program Expenditure Approved`)
      .subscribe({
        next: (res: any) => {
          this.loaderService.hide()
          this.programList = res?.data || [];
          this.programListFiltered = this.programList;
          this.selectedProgramId = '';
        },
        error: (err) => {
            this.loaderService.hide()
          this.programList = [];
          this.programListFiltered = [];
          this.selectedProgramId = '';
          this.toastrService.error(err.error.message);
        },
      });
  }

  onAgencySelect(agencyId: any) {
    this.selectedAgencyId = agencyId;
    this.getProgramsByAgency(agencyId);
  }

  onProgramSelect(programId: any) {
    this.selectedProgramId = programId;
  }


 downloadAllParticipantsExcel(value: any) {
  const agency = this.selectedAgencyId || this.agencyId;
     if (!agency) {
      this.toastrService.info('Please select an Agency.');
      return;
    }
  if (value == '1') {
      if (this.isAdmin) {
    //      if(!this.programIds && this.selectedAgencyId){
    //   payload = '?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)
    // }
    // else{
    //   payload ='?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.programIds
    // }
        let url=APIS.participantdata.downloadParticipantDataExcel+'?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)
        // let url = APIS.participantdata.downloadParticipantAgencyDataEXcel+this.selectedAgencyId
        let fileName = "All_Participants_Report.xls"
        this.downloadFile(url, fileName)
      } else {
        let url=APIS.participantdata.downloadParticipantDataExcel+'?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)
        let fileName = "All_Participants_Report.xls"
        this.downloadFile(url, fileName)
      }
    }
  else if (value == '2') { // All Programs
     if (this.isAdmin) {


        let url = APIS.programCreation.downloadProgramsDataExcel+this.selectedAgencyId
        let fileName = "All_Programs_Report.xls"
        this.downloadFile(url, fileName)
      } else {
         let url = APIS.programCreation.downloadProgramsDataExcel+this.selectedAgencyId
        let fileName = "All_Programs_Report.xls"
        this.downloadFile(url, fileName)
      }
  }
  else if (value == '3') { // All Expenditure
     //      if(!this.programIds && this.selectedAgencyId){
    //   payload = '?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)
    // }
    // else{
    //   payload ='?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.programIds
    // }
    let url = `${APIS.programCreation.downloadCombinedExpenditureExcel}-1`;
    let fileName = `All_Expenditure_Report.xls`;
    this.downloadFile(url, fileName);
  }
  else if (value == '4') { // All Programs Overview
    let url = `${APIS.programCreation.downloadProgramOverviewReportExcel}${agency}`;
    let fileName = `Programs_Overview_Report.xls`;
    this.downloadFile(url, fileName);
  }
} 
  downloadAllParticipantsPdf(value: string) {
     const agency = this.selectedAgencyId || this.agencyId;
    if (!agency) {
      this.toastrService.info('Please select an agency.');
      return;
    }
    if (value == '1') {
      if (this.isAdmin) {
        let url = APIS.participantdata.downloadParticipantAgencyDataPdf+agency
        let fileName = "All_Participants_Report.xls"
        this.downloadFile(url, fileName)
      } else {
        let url = APIS.participantdata.downloadParticipantAgencyDataPdf+agency
        let fileName = "All_Participants_Report.xls"
        this.downloadFile(url, fileName)
      }
    }

    else if (value == '2') {
      if (this.isAdmin) {


        let url = APIS.programCreation.downloadProgramsDataPdf+agency
        let fileName = "All_Programs_Report.pdf"
        this.downloadFile(url, fileName)
      } else {
        let url = APIS.programCreation.downloadProgramsDataPdf+agency
        let fileName = "All_Programs_Report.pdf"
        this.downloadFile(url, fileName)
      }
    }
    else if (value == '3') {
      if (this.isAdmin) {


        let url = ""
        let fileName = ""
        this.downloadFile(url, fileName)
      } else {
        let url = ""
        let fileName = ""
        this.downloadFile(url, fileName)
      }
    }
    else if (value == '4') {
      let url = ""
      let fileName = ""
      this.downloadFile(url, fileName)
    }


  }

  downloadSessionsExcel(value:string){
      if (!this.selectedProgramId) {
      this.toastrService.info('Please select a Program.');
      return;
    }
      if(value=='1'){
      let url=""
      let fileName=""
      this.downloadFile(url,fileName)
    }
      
    else  if(value=='2'){
      let url=APIS.participantdata.downloadParticipantDataExcel+'?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.selectedProgramId
      let fileName = "Program_Participants" + ".xls"
      this.downloadFile(url,fileName)
    }  
    else  if(value=='3'){
      let url=API_BASE_URL+'/export-program-expenditure?agencyId='+(this.agencyId?this.agencyId:this.selectedAgencyId)+'&programId='+this.selectedProgramId
      // let url=API_BASE_URL+"/combined/expenditure/excel/"+this.selectedProgramId
      let fileName="program_Expenditure_Combined_"+".xls"
      this.downloadFile(url,fileName)
    } 
 


  }


  downloadSessionsPdf(value:string){
      if (!this.selectedProgramId) {
      this.toastrService.info('Please select a Program.');
      return;
    }
         if(value=='1'){
      let url=APIS.programCreation.downloadSessionsData+this.selectedProgramId
      let fileName = `Program_Session.pdf`
      this.downloadFile(url,fileName)
    }
      
    else  if(value=='2'){
      let url=APIS.participantdata.downloadParticipantDataPdf+this.selectedProgramId
      let fileName="Program_Participants" + ".pdf"
      this.downloadFile(url,fileName)
    }  
    else  if(value=='3'){
      let url=""
      let fileName=""
      this.downloadFile(url,fileName)
    } 
 
  }

  
  downloadFile(url: string, fileName: string) {
    this.isDownloading = true;
    this.loaderService.show('Downloading file...');
    this._commonService.downloadFile(url).subscribe({
      next: (response: Blob) => {
        console.log(response)
        this.loaderService.hide();
        this.isDownloading = false;
        const a = document.createElement('a');
        const objectUrl = URL.createObjectURL(response);
        a.href = objectUrl;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(objectUrl);
        this.toastrService.success('File downloaded successfully.');
      },
      error: (err) => {
        this.loaderService.hide();
        this.isDownloading = false;
        this.toastrService.error(err.error?.message || 'Failed to download file.');
      },
    });
  }


  // Program Downloads
  downloadProgramExcel() {
    const agency = this.selectedAgencyId || this.agencyId;
    this.downloadFile(
      `${APIS.programCreation.downloadProgramsDataExcel}${agency}`,
      `Program_Details_${agency}.xls`
    );
  }

  downloadAllAgenciesProgramsExcel(){
    let fileName = "All_Agencies_Report.xls"
    let url=API_BASE_URL+"/program-details/excel/-1"
    this.downloadFile(url,fileName)

  }

  downloadAllAgenciesProgramsPdf(){
    let fileName="All_Agencies_Report.pdf"
    let url=API_BASE_URL+"/program/pdf/-1"
    this.downloadFile(url,fileName)

  }
  downloadAllAgenciesparticipatExcel(){
    let fileName = "All_Agencies_Participant_Report.xls"
    let url=`${APIS.participantdata.downloadParticipantDataExcel}?agencyId=-1`
    this.downloadFile(url,fileName)

  }

  downloadAllAgenciesparticipatPdf(){
    let fileName="All_Agencies_Participant_Report.pdf"
    let url=APIS.participantdata.downloadParticipantDataPdf+'-1'
    this.downloadFile(url,fileName)

  }
  downloadProgramPdf() {
    const agency = this.selectedAgencyId || this.agencyId;
    this.downloadFile(
      `${APIS.programCreation.downloadProgramsDataPdf}${agency}`,
      `Program_Details_${agency}.pdf`
    );
  }

  // Program Session Downloads
  downloadProgramSessionPdf() {
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.programCreation.downloadSessionsData}${this.selectedProgramId}`,
      `Program_Session_${this.selectedProgramId}.pdf`
    );
  }

  // Participant Downloads
  downloadParticipantExcel() {
    const agency = this.selectedAgencyId || this.agencyId;
    let url = `${APIS.participantdata.downloadParticipantDataExcel}?agencyId=${agency}`;
    if (this.selectedProgramId) {
      url += `&programId=${this.selectedProgramId}`;
    }
    this.downloadFile(
      url,
      `Participant_Details.xls`
    );
  }

  downloadParticipantPdf() {
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.participantdata.downloadParticipantDataPdf}${this.selectedProgramId}`,
      `Program_Participants_${this.selectedProgramId}.pdf`
    );
  }

  // Program Summary Downloads
  downloadProgramSummaryPdf() {
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.programCreation.downloadProgramSummaryPdf}${this.selectedProgramId}`,
      `Program_Summary_${this.selectedProgramId}.pdf`
    );
  }

  downloadProgramSummaryExcel() {
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.programCreation.downloadProgramSummaryExcel}${this.selectedProgramId}`,
      `Program_Summary_${this.selectedProgramId}.xls`
    );
  }

  // Expenditure Downloads
  downloadExpenditureSeparateExcel() {
    let url = `${APIS.programCreation.downloadProgramExpenditureExcel}?agencyId=${this.selectedAgencyId || this.agencyId}`;
    if(this.selectedProgramId){
      url += `&programId=${this.selectedProgramId}`;
    }
    this.downloadFile(
      url,
      `Program_Expenditure_Separate.xls`
    );
  }

  downloadExpenditureCombinedExcel() {
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.programCreation.downloadCombinedExpenditureExcel}${this.selectedProgramId}`,
      `Program_Expenditure_Combined_${this.selectedProgramId}.xls`
    );
  }

  // Program Overview & Status Downloads
  downloadProgramOverviewExcel() {
    const agency = this.selectedAgencyId || this.agencyId;
    this.downloadFile(
      `${APIS.programCreation.downloadProgramOverviewReportExcel}${agency}/excel`,
      `Program_Overview_${agency}.xls`
    );
  }

  downloadProgramParticipantStatusExcel() {
    const agency = this.selectedAgencyId || this.agencyId;
    this.downloadFile(
      `${APIS.programCreation.downloadProgramParticipantStatusExcel}${agency}`,
      
      `Program_Participant_Status_${agency}.xls`
    );
  }

  downloadProgramParticipantStatusPdf() {
    const agency = this.selectedAgencyId || this.agencyId;
    this.downloadFile(
      `${APIS.programCreation.downloadProgramParticipantStatusPdf}${agency}`,
      `Program_Participant_Status_${agency}.pdf`
    );
  }

  // Program Monitoring
  downloadProgramMonitoringPdf() {
    // Assuming monitoringId is available or passed. For now, this is a placeholder.
    // if (!monitoringId) {
    //   this.toastrService.info('Monitoring ID is required for this download.');
    //   return;
    // }
    if (!this.selectedProgramId) {
      this.toastrService.info('Please select a program.');
      return;
    }
    this.downloadFile(
      `${APIS.programCreation.downloadProgramMonitoringReportPdf}${this.selectedProgramId}`,
      `Program_Monitoring_Report_${this.selectedProgramId}.pdf`
    );
  }


  downloadAllParticipants(){

  }

  downloadExpenditure(){

  }

  downloadParticipants(){

  }

  downloadSessions(){

  }
  downloadAllProgramsOverview(){

  }

  downloadAllExpenditure(){

  }

  downloadAllPrograms(){

  }

  downloadAllAgencies(){
    
  }

}
