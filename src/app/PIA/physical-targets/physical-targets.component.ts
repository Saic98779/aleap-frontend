import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { FormControl, FormGroup, Validators } from '@angular/forms';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-physical-targets',
  templateUrl: './physical-targets.component.html',
  styleUrls: ['./physical-targets.component.css']
})
export class PhysicalTargetsComponent implements OnInit {
  localStorageData: any;
  sessionDetailsList: any;
  tableList: any;
  dataTable: any;
  agencyList: any = [];
  loginsessionDetails: any;
  agencyId: any;
  targetsScreenForm!: FormGroup;
  constructor(
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
  ) { 
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
    this.selectedAgencyId = this.loginsessionDetails.agencyId;
  }

  ngOnInit(): void {
    this.getAgenciesList() 
    this.GetOutComes()
    this.generateFinancialYears() 
    this.formDetails()
  }

  selectedAgencyId: any;
  agencyListFiltered: any;
  getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered=this.agencyList;
        this.selectedAgencyId = res.data[0].agencyId;
        this.GetProgramsByAgency(this.selectedAgencyId);
      }, (error) => {
        // this.toastrService.error(error.message);
      });
    }
    ListOfOutCome:any
    GetOutComes(){
      this._commonService.getDataByUrl(APIS.captureOutcome.getOutcomelistData).subscribe({
        next: (res: any) => {
          this.ListOfOutCome = res?.data
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    financialYears:any=[]
    selectedFinancialYear: string = '';
    generateFinancialYears() {
      const currentYear = new Date().getFullYear();
      const fixedYear = 2024; // Fixed year for the first two entries 
      const range = 2; // Show 5 years before and after current year
    
      for (let i = 2024; i < currentYear; i++) {
        const year = i;
        this.financialYears.push(`${year}-${(year + 1)}`);
      }
      for (let i = 0; i <= range; i++) {
        const year = currentYear + i;
        this.financialYears.push(`${year}-${(year + 1)}`);
      }
      
      // Set default selection to current financial year
      this.selectedFinancialYear = this.getCurrentFinancialYear();
      // console.log(this.financialYears, 'financialYears',this.selectedFinancialYear );
    }
  
    getCurrentFinancialYear(): string {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // January is 0
      
      // Adjust based on your financial year start (April in this example)
      return month >= 4 ? `${year}-${(year + 1)}` : `${year - 1}-${year}`;
    }

  get f2() {
    return this.targetsScreenForm.controls;
  }

  formDetails() {
      this.targetsScreenForm = new FormGroup({
        "outcomeId": new FormControl("", [Validators.required]),
        "financialYear": new FormControl(this.selectedFinancialYear, [Validators.required]),
        "q1":new FormControl("",[Validators.required,Validators.pattern(/^[0-9]\d*$/)]),
        "q2": new FormControl("",[Validators.required,Validators.pattern(/^[0-9]\d*$/)]),
        "q3": new FormControl("",[Validators.required,Validators.pattern(/^[0-9]\d*$/)]),
        "q4": new FormControl("",[Validators.required,Validators.pattern(/^[0-9]\d*$/)]),
      }
    );
  }
  tableheaderList:any
    GetProgramsByAgency(value?: any) {
      this.tableList=[]
      this.tableheaderList =[]
      // Destroy existing DataTable if it exists
      
      this._commonService.getDataByUrl(APIS.physicalTagets.getTargets+value).subscribe({
        next: (dataList: any) => {
          if(Object.keys(dataList.data ).length) {
            console.log(dataList.data, 'dataList');
            const allYears = new Set<string>();
            this.tableheaderList = Object.values(dataList.data).map((item:any) => {
              item.financialYear.forEach((fy: any) => allYears.add(fy.financialYear));
              return item;
            });
            this.tableheaderList = Array.from(allYears).sort();
            Object.keys(dataList.data || {}).map((key: any) => {
              this.tableList.push(dataList.data[key]) 
            })
            // if ($.fn.DataTable.isDataTable('#view-physical-table')) {
            //     $('#view-physical-table').DataTable().destroy();
            //   }
            // this.reinitializeDataTable(value);
          }
          else{
            this.tableheaderList=[this.getCurrentFinancialYear()]
            this.tableList=[]
          }
          // if ($.fn.DataTable.isDataTable('#view-physical-table')) {
          //   $('#view-physical-table').DataTable().destroy();
          // }
        
          console.log(this.tableheaderList,  this.tableList,'tableheaderList');
          // this.reinitializeDataTable(value)
          console.log(this.tableList, 'tableList');
        },
        error: (error: any) => {
          this.tableheaderList=[this.getCurrentFinancialYear()]
          this.tableList=[]
          this.toastrService.error(error?.error?.message);
        }
      });
    }
    getYearData(item: any, year: string) {
      // Find the data for this specific year
      const yearData = item.financialYear.find((fy: any) => fy.financialYear === year);
      
      // Return the data or zeros if not found
      return yearData || {
        total: 0,
        q1: 0,
        q2: 0,
        q3: 0,
        q4: 0
      };
    }
    editRow:boolean = false;
    physicalTargetId:any=''
    editFinancialYear:any=[]
    objectOfEditRow: any = [];
    openTargetsModal(type:any,item?:any) {
      this.editFinancialYear = [];
      this.objectOfEditRow=[]
      this.editRow= type === 'edit' ? true : false;
      this.targetsScreenForm.reset();
      
      this.physicalTargetId=''
      if(this.editRow){
      
        if(item?.financialYear && item?.financialYear.length>0){
          this.objectOfEditRow=item?.financialYear;
           this.editFinancialYear =item?.financialYear.map((item:any)=>{
            return item.financialYear
           }) || [];
            this.physicalTargetId = item.financialYear[0].physicalTargetId;
            this.targetsScreenForm.patchValue({...item.financialYear[0],financialYear:item?.financialYear[0]?.financialYear,outcomeId:item?.financialYear[0]?.outcomeId,});
        }
        
      }
      else{
        this.targetsScreenForm.patchValue({financialYear:this.selectedFinancialYear,})
      }
      
      const modal1 = new bootstrap.Modal(document.getElementById('addTarget'));
      modal1.show();

    }
    onFinancialYearChange(value:any){
       
      const item = this.objectOfEditRow.find((itm:any)=>{
        console.log(itm.financialYear,'itm.financialYear',value,itm);
        return itm.financialYear === value
      } );
      console.log(item, value,this.objectOfEditRow,'item');
      this.physicalTargetId = item.physicalTargetId;
      this.targetsScreenForm.patchValue({...item,financialYear:item?.financialYear,outcomeId:item?.outcomeId,});
    }

    closeModalTargets(): void {
      
      const editSessionModal = document.getElementById('addTarget');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    }
    this.GetProgramsByAgency(this.selectedAgencyId);
     } 
    initializeDataTable() {
      this.dataTable = new DataTable('#view-physical-table', {
        // scrollX: true,
        // scrollCollapse: true,    
        // responsive: true,    
        // paging: true,
        // searching: true,
        // ordering: true,
        scrollY: "415px",
        scrollX: true,
        scrollCollapse: true,
        autoWidth: true,
        paging: true,
        info: false,
        searching: false,
        destroy: true, // Ensure reinitialization doesn't cause issues
      });
    }
    reinitializeDataTable(agencyId:any) {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      setTimeout(() => {
        this.initializeDataTable();
      }, 0);
    }

    submitTarget(){
      console.log(this.targetsScreenForm.value, 'targetsScreenForm');
      let payload: any = { ...this.targetsScreenForm.value };
      payload['outcomeId'] = Number(this.targetsScreenForm.value.outcomeId);
      payload['agencyId'] = this.selectedAgencyId;
      if(this.editRow){
        this._commonService
        .update(APIS.physicalTagets.updateTargets, payload,this.physicalTargetId)
        .subscribe({
          next: (data) => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            this.toastrService.success('Physical Targets updated Successfully', "Success!");
            this.targetsScreenForm.reset();
            this.GetProgramsByAgency(this.selectedAgencyId);
          },
          error: (err) => {
            console.log(err, 'err');
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            this.toastrService.error(err, "Physical Targets Creation Error!");
            new Error(err);
          },
        });
      }
      else{
        this._commonService
        .add(APIS.physicalTagets.saveTargets, payload)
        .subscribe({
          next: (data) => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            this.toastrService.success('Physical Targets Added Successfully', "Success!");
            this.targetsScreenForm.reset();
            this.GetProgramsByAgency(this.selectedAgencyId);
          },
          error: (err) => {
            console.log(err, 'err');
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            this.toastrService.error(err, "Physical Targets Creation Error!");
            new Error(err);
          },
        });
      }
      
    }
     // delete Expenditure
     deletePhysicalId:any ={}
     deleteExpenditure(item: any) {
      this.deletePhysicalId = item?.physicalTargetId;
      console.log(this.deletePhysicalId, 'deletePhysicalId');
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      const myModal = new bootstrap.Modal(document.getElementById('exampleModalDeleteProgram'));
      myModal.show();
       
     
   }

   ConfirmdeleteTargets(item:any){
       this._commonService
       .deleteId(APIS.physicalTagets.deleteTargets,item).subscribe({
         next: (data: any) => {
           if(data?.status==400){
             this.toastrService.error(data?.message, "Physical Target Error!");
             this.closeModalDelete();
             this.deletePhysicalId =''
           }
           else{
             this.closeModalDelete();
             this.deletePhysicalId =''
           this.toastrService.success( 'Physical Target Deleted Successfully', "Physical Target Success!");
           }
           
         },
         error: (err) => {
           this.closeModalDelete();
           this.deletePhysicalId ={}
           this.toastrService.error(err.message, "Physical Target Error!");
           new Error(err);
         },
       });
 
     }
     
     closeModalDelete(): void {
      document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
      const editSessionModal = document.getElementById('exampleModalDeleteProgram');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
    this.GetProgramsByAgency(this.selectedAgencyId);
     } 
}