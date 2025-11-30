import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { Role } from '@app/_models';
import { LoaderService } from '@app/common_components/loader-service.service';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { FormControl } from '@angular/forms';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-msme-by-month',
  templateUrl: './msme-by-month.component.html',
  styleUrls: ['./msme-by-month.component.css']
})
export class MsmeByMonthComponent implements OnInit {
  namemonth='Select Month'
  selectedAgencyId: any = null;
  selectedFinancialYear: any = '';
  financialYears: any[] = [];
  financialYRFiltered: any[] = [];
  selectedMonth: Date | null = null;
  monthsList: string[] = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december'
  ];
  selectedMonthName: string = 'april';
  agencyList: any[] = [];
  agencyListFiltered: any[] = [];

  constructor(
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private loaderService: LoaderService,
    private dateAdapter: DateAdapter<Date>
  ) {
    this.dateAdapter.setLocale('en-GB');
  }

  ngOnInit(): void {
    this.getAgenciesList();
    this.generateFinancialYears();
      // Set current month by default
  }
selectedInterventionId:any=''
  getAgenciesList() {
     this._commonService.getDataByUrl(APIS.msmeQueaterly.getUniqueIntervention).subscribe({
       next: (res: any) => {
         this.agencyList = res.data;
         this.selectedInterventionId=res.data[0]
         this.selectedMonthName='april'
         this.agencyListFiltered = this.agencyList;
         this.GetCompoentsBasedIntervention(this.selectedInterventionId)
       },
       error: (err) => {
         this.toastrService.error(err.error.message);
       },
     });
    }
    compoentData:any=[]
    filteredComponentList:any=[]
    selectedComponent:any=''
    GetCompoentsBasedIntervention(value: any) {
      this.getTableData=[]
      this.selectedInterventionId=value
      this.compoentData=[]
      this.filteredComponentList=[]
      this.selectedAgencyId=''
      this._commonService.getDataByUrl(APIS.msmeQueaterly.getCompoentsBasedIntervention+'?intervention='+value).subscribe({
       next: (res: any) => {
         this.compoentData = res.data;
         this.filteredComponentList = this.compoentData;
         this.selectedComponent=this.compoentData[0]
         this.GetActivitiessBasedComponent(this.selectedComponent)
       },
       error: (err) => {
         this.toastrService.error(err.error.message);
       },
     });

    }
    // Project%20team%20%283%20team%20members%20%40%202.9%20lakh%20per%20month%29
    ActivitiesData:any=[]
    fiteredActivitiesList:any=[]
    selectedActivity:any=''
    GetActivitiessBasedComponent(value: any) {
      this.selectedComponent=value
      this.selectedAgencyId=''
      this._commonService.getDataByUrl(APIS.msmeQueaterly.getActiitiedBasedComp+value).subscribe({
       next: (res: any) => {
         this.ActivitiesData = res.data;
         this.fiteredActivitiesList = this.ActivitiesData;
         this.selectedAgencyId=this.ActivitiesData[0]?.moMSMEActivityId
         this.getBasedOnQuarterSelection()
       },
       error: (err) => {
         this.toastrService.error(err.error.message);
       },
     });

    }

  isAddingRow = false;
newRow: any = {};
tableData: any[] = []; // Your data array

showViewModal = false;
viewRowData: any=[] ;



closeViewModal() {
  this.showViewModal = false;
} 

  GetProgramsByAgency(value: any) {
    this.selectedAgencyId = value;
    this.getBasedOnQuarterSelection()
    // Add your logic here
  }

  generateFinancialYears() {
    const currentYear = new Date().getFullYear();
    const range = 2;
    for (let i = 2024; i < currentYear; i++) {
      const year = i;
      this.financialYears.push(`${year}-${year + 1}`);
    }
    for (let i = 0; i <= range; i++) {
      const year = currentYear + i;
      this.financialYears.push(`${year}-${year + 1}`);
    }
    this.financialYRFiltered = this.financialYears;
    this.selectedFinancialYear = this.getCurrentFinancialYear();
  }

  getCurrentFinancialYear(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    return month >= 4 ? `${year}-${year + 1}` : `${year - 1}-${year}`;
  }

  getBasedOnYearSelection(value: any) {
    this.selectedFinancialYear = value;
     this.getBasedOnQuarterSelection()
    // Add your logic here
  }
 getSelectedMonth(event:any){
    this.selectedMonthName=event
        this.getBasedOnQuarterSelection()
     }
     getTableData:any=[]
    errorMessage:any=''
 getBasedOnQuarterSelection() {
    this.isAddingRow = false;
      this.errorMessage='Data Not Available'
      if(!this.selectedAgencyId){
        this.toastrService.error('Please select Intervention');
        return;
      }
      if(!this.selectedFinancialYear){
        this.toastrService.error('Please select Financial Year');
        return;
      }
      if(!this.selectedMonthName){
        this.toastrService.error('Please select Month');
        return;
      }
      this.getTableData=[]
        let url=APIS.msmeQueaterly.getMSMEByMonth+'?moMSMEActivityId='+this.selectedAgencyId+'&financialYear='+this.selectedFinancialYear+'&month='+this.selectedMonthName
         this._commonService.getDataByUrl(url).subscribe({
       next: (res: any) => {

       
         if(Object.keys(res.data).length){
            this.errorMessage=''
            this.getTableData = res.data;

            this.newRow = { ...this.getTableData }; // Create a copy of the existing row data
         }
         else{
           this.errorMessage='Data Not Available'
         this.getTableData =[]
         }
         console.log(this.getTableData,'getTableData' );
       },
       error: (err) => {
        this.errorMessage='Data Not Available'
         this.getTableData =[]
         this.toastrService.error(err.error.message);
       },
     });
    }
    editRow(row:any) {
      this.isAddingRow = true;
      this.newRow = { ...this.getTableData[0] };
      if(this.getTableData[0].currentMonthMoMSMEBenefitedDto && Object.keys(this.getTableData[0].currentMonthMoMSMEBenefitedDto).length ){
        this.newRow.currentMonthMoMSMEBenefitedDto = { ...this.getTableData[0].currentMonthMoMSMEBenefitedDto };
      }
      else{
        this.newRow.currentMonthMoMSMEBenefitedDto = { total:0, women:0, sc:0, st:0, obc:0 }
      }
      console.log( this.newRow,'newRow');
      
       // Create a copy of the existing row data
      // this.viewRow(this.getTableData); // Open the view modal with the existing data

      }


saveRow(newRow?: any) {
  let payload={
  "moMSMEActivityId": this.selectedAgencyId,
  "financialYear": this.selectedFinancialYear,
  "month": this.selectedMonthName,
  "physicalAchievement": newRow?.currentPhysicalAchievement || 0,
  "financialAchievement": newRow?.currentFinancialAchievement || 0,
  "total": newRow.currentMonthMoMSMEBenefitedDto.total,
  "women": newRow.currentMonthMoMSMEBenefitedDto.women,
  "sc": newRow.currentMonthMoMSMEBenefitedDto.sc,
  "st": newRow.currentMonthMoMSMEBenefitedDto.st,
  "obc": newRow.currentMonthMoMSMEBenefitedDto.obc,
  
}
  // this.tableData.push({ ...this.newRow });
   this._commonService.add(APIS.msmeQueaterly.saveMonth,payload).subscribe({
       next: (res: any) => {
        this.getBasedOnQuarterSelection()
        this.toastrService.success('Data saved successfully.');
       
       
       },
       error: (err) => {
        this.getBasedOnQuarterSelection()
        this.toastrService.error(err.error.message);
       
       },
     });
  this.isAddingRow = false;
  this.newRow = {};
}

cancelRow() {
  this.isAddingRow = false;
  this.newRow = {};
  this.getBasedOnQuarterSelection()
}

viewRow(row?: any) {
  this.viewRowData=[]
  this.showViewModal = true;
  let url=APIS.msmeQueaterly.getCuulativebyIntervention+'?moMSMEActivityId='+row.moMSMEActivityId+'&financialYear='+this.selectedFinancialYear
  this._commonService.getDataByUrl(url).subscribe({
       next: (res: any) => {
          this.viewRowData = res?.data?.data || [];
          console.log( this.viewRowData,'viewRowData', );
       },
       error: (err) => {
         this.toastrService.error(err.error.message);
       },
     });
}
checkValidation(row:any){
  if((!row.currentPhysicalAchievement || row.currentPhysicalAchievement==0) && (!row.currentFinancialAchievement || row.currentFinancialAchievement==0) && (!row.currentMonthMoMSMEBenefitedDto || (row.currentMonthMoMSMEBenefitedDto && Object.keys(row.currentMonthMoMSMEBenefitedDto).length && (!row.currentMonthMoMSMEBenefitedDto.total || row.currentMonthMoMSMEBenefitedDto.total==0) && (!row.currentMonthMoMSMEBenefitedDto.women || row.currentMonthMoMSMEBenefitedDto.women==0) && (!row.currentMonthMoMSMEBenefitedDto.sc || row.currentMonthMoMSMEBenefitedDto.sc==0) && (!row.currentMonthMoMSMEBenefitedDto.st || row.currentMonthMoMSMEBenefitedDto.st==0) && (!row.currentMonthMoMSMEBenefitedDto.obc || row.currentMonthMoMSMEBenefitedDto.obc==0)))){
    return true
  }
  else{
    return false
  } 
}
    pushedDataOfMomse:any ={}
   confirmationForPush(item: any) {
    this.pushedDataOfMomse = item;
    console.log(this.pushedDataOfMomse, 'deletePhysicalId');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    const myModal = new bootstrap.Modal(document.getElementById('exampleModalDeleteProgram'));
    myModal.show();
     
 }

 closeModalDelete(): void {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    const editSessionModal = document.getElementById('exampleModalDeleteProgram');
  if (editSessionModal) {
    const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
    modalInstance.hide();
  }
  // this.GetProgramsByAgency(this.selectedAgencyId);
   } 
pushtoMomse(row?: any) {
  let url=APIS.msmeQueaterly.pushToMoMSME
  // Find the quarter based on the selected month
  const monthIndex = this.monthsList.indexOf(this.selectedMonthName); // 0-based index
  const quarter = monthIndex >= 0 ? Math.ceil((monthIndex + 1) / 3) : null;

  // Determine the correct year based on selectedFinancialYear and selectedMonthName
  let yearParts = this.selectedFinancialYear.split('-');
  let year = parseInt(yearParts[0], 10);
  // If month is Jan/Feb/Mar (index 0,1,2), use the second year part
  if (monthIndex >= 0 && monthIndex < 3) {
    year = parseInt(yearParts[1], 10);
  }

  let payloadVal = {
    "StateRAMPDashbrdData": [
      {
        "Intervention": row?.intervention,
        "Component": row?.component,
        "Activity": row?.activity,
        "Year": year,
        "Quarter": 'Q'+quarter,
        "PhysicalTarget": row?.physicalTarget || 0,
        "PhysicalAchieved": row?.physicalAchievement || 0,
        "FinancialTarget": row?.financialTarget || 0,
        "FinancialAchieved": row?.financialAchievement || 0,  
        "MSMEsBenefittedTotal": row?.currentMonthMoMSMEBenefitedDto?.total || 0,
        "MSMEsBenefittedWoman": row?.currentMonthMoMSMEBenefitedDto?.women || 0,
        "MSMEsBenefittedSC": row?.currentMonthMoMSMEBenefitedDto?.sc || 0,
        "MSMEsBenefittedST": row?.currentMonthMoMSMEBenefitedDto?.st || 0,
        "MSMEsBenefittedOBC": row?.currentMonthMoMSMEBenefitedDto?.obc || 0 
      }
    ]
  }
 
  this._commonService.add(url,payloadVal).subscribe({
       next: (res: any) => {
        this.pushedDataOfMomse={}
        this.getBasedOnQuarterSelection()
        this.closeModalDelete()
         this.toastrService.success(res?.message || 'Pushed to MoMSME successfully.');
       },
       error: (err) => {
        this.pushedDataOfMomse={}
        this.getBasedOnQuarterSelection()
        this.closeModalDelete()
         this.toastrService.error(err.error.message || 'Error pushing to MoMSME.');
       },
     });
}
  
}
