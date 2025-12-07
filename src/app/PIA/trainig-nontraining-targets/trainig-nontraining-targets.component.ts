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
  selector: 'app-trainig-nontraining-targets',
  templateUrl: './trainig-nontraining-targets.component.html',
  styleUrls: ['./trainig-nontraining-targets.component.css']
})
export class TrainigNontrainingTargetsComponent implements OnInit {
   localStorageData: any;
   sessionDetailsList: any;
   tableList: any;
   dataTable: any;
   agencyList: any = [];
   loginsessionDetails: any;
   agencyId: any;
   targetsScreenForm!: FormGroup;
    activeTab: any;
   constructor(
     private toastrService: ToastrService,
     private _commonService: CommonServiceService,
     private router: Router,
   ) { 
     // this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
     // this.selectedAgencyId = this.loginsessionDetails.agencyId;
   }
 

   ngOnInit(): void {
    this.activeTab = 'nav-twos';
     this.getAgenciesList() 
     this.generateFinancialYears() 
     
     this.GetOutComes()
     this.getActivitiesList()
     
     this.formDetails()
   }
     onTabChange(activeTab:any){
    this.activeTab = activeTab;
  }
   activitiesList: any[] = [];
  subActivitiesList: any[] = [];
  selectedTargetType: string = 'training'; // 'training' or 'non-training'

  
 
   selectedAgencyId: any;
   FinanCialYear: any;
   agencyListFiltered:any;
   getAgenciesList() {
       this.agencyList = [];
       this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
         this.agencyList = res.data;
         this.agencyListFiltered = this.agencyList;
         let id=Number(sessionStorage.getItem('selectedAgencyIdByProgressMonitoring')) || null
         console.log(id, typeof(id),'selectedAgencyIdByProgressMonitoring');
         if(id){
           this.selectedAgencyId=id
         }
         else{
            this.selectedAgencyId = res.data[0].agencyId;
         }
        
         this.GetProgramsByAgency(this.selectedAgencyId);
       }, (error) => {
         // this.toastrService.error(error.message);
       });
     }
     getAgencyName(val:any){
      return this.agencyList.find((item:any)=>item.agencyId==val)?.agencyName || '';
    }
     goBack(){
        this.router.navigate(['/progress-monitoring'])
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
     financialYRFiltered:any;
     selectedFinancialYear: any = '';
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
       this.financialYRFiltered=this.financialYears
       // Set default selection to current financial year
       this.selectedFinancialYear = this.getCurrentFinancialYear();
       // console.log(this.inancialYears, 'financialYears',this.selectedFinancialYear );
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
 
  //  formDetails() {
  //      this.targetsScreenForm = new FormGroup({
  //        "outcomeId": new FormControl("", [Validators.required]),
  //        "financialYear": new FormControl(this.selectedFinancialYear, [Validators.required]),
  //        "q1":new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
  //        "q2": new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
  //        "q3": new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
  //        "q4": new FormControl("",[Validators.required,Validators.pattern(/^[1-9]\d*$/)]),
  //      }
  //    );
  //  }
   tableheaderList:any
   getBasedOnYearSelection(val:any){
     this.getDataByAgencyAndYear(this.selectedAgencyId,val)
      this.getDataByAgencyAndYearNonTraing(this.selectedAgencyId,val)
   }
     GetProgramsByAgency(value: any) {
       this.tableList=[]
       this.tableheaderList =[] 
       this.getActivitiesList()
       this.getDataByAgencyAndYear(value,this.selectedFinancialYear)
       this.getDataByAgencyAndYearNonTraing(value,this.selectedFinancialYear)
       // Destroy existing DataTable if it exists
       
      
     }
     getDataByAgencyAndYear(agency: any,year:any) {
       this._commonService.getDataByUrl(APIS.progressMonitoring.getTrainigTargetsAchievements+agency+'?year='+year).subscribe({
         next: (dataList: any) => {
           if(dataList?.length) {
             console.log(dataList, 'dataList');
             const allYears = new Set<string>();
             // this.tableheaderList = Object.values(dataList.data).map((item:any) => {
             //   item.financialYear.forEach((fy: any) => allYears.add(fy.financialYear));
             //   return item;
             // });
             // this.tableheaderList = Array.from(allYears).sort();
             this.tableheaderList=[this.selectedFinancialYear]
             this.tableList = dataList
             // Object.keys(dataList.data || {}).map((key: any) => {
             //   this.tableList.push(dataList.data[key]) 
             // })
             // if ($.fn.DataTable.isDataTable('#view-physical-table')) {
             //     $('#view-physical-table').DataTable().destroy();
             //   }
             this.reinitializeDataTable();
           }
           else{
             // this.tableheaderList=[this.getCurrentFinancialYear()]
             this.tableheaderList=[this.selectedFinancialYear]
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
           this.tableheaderList=[this.selectedFinancialYear]
           this.tableList=[]
           // this.toastrService.error(error?.error?.message || 'Error fetching data', 'Error');
         }
       });
     }
     tableListNonTraining:any=[]
      getDataByAgencyAndYearNonTraing(agency: any,year:any) {
       this._commonService.getDataByUrl(APIS.progressMonitoring.getNonTrainigTargetsAchievements+agency+'?year='+year).subscribe({
         next: (dataList: any) => {
           if(dataList?.length) {
             console.log(dataList, 'dataList');
             const allYears = new Set<string>();
             // this.tableheaderList = Object.values(dataList.data).map((item:any) => {
             //   item.financialYear.forEach((fy: any) => allYears.add(fy.financialYear));
             //   return item;
             // });
             // this.tableheaderList = Array.from(allYears).sort();
             this.tableheaderList=[this.selectedFinancialYear]
             this.tableListNonTraining = dataList
             // Object.keys(dataList.data || {}).map((key: any) => {
             //   this.tableListNonTraining.push(dataList.data[key]) 
             // })
             // if ($.fn.DataTable.isDataTable('#view-physical-table')) {
             //     $('#view-physical-table').DataTable().destroy();
             //   }
             this.reinitializeDataTable();
           }
           else{
             // this.tableheaderList=[this.getCurrentFinancialYear()]
             this.tableheaderList=[this.selectedFinancialYear]
 
             this.tableListNonTraining=[]
           }
           // if ($.fn.DataTable.isDataTable('#view-physical-table')) {
           //   $('#view-physical-table').DataTable().destroy();
           // }
         
           console.log(this.tableheaderList,  this.tableListNonTraining,'tableheaderList');
           // this.reinitializeDataTable(value)
           console.log(this.tableListNonTraining, 'tableListNonTraining');
         },
         error: (error: any) => {
           this.tableheaderList=[this.selectedFinancialYear]
           this.tableListNonTraining=[]
           // this.toastrService.error(error?.error?.message || 'Error fetching data', 'Error');
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
    //  openTargetsModal(type:any,item?:any) {
    //    this.editRow= type === 'edit' ? true : false;
    //    this.targetsScreenForm.reset();
       
    //    this.physicalTargetId=''
    //    if(this.editRow){
    //      this.physicalTargetId = item.physicalTargetId;
    //      this.targetsScreenForm.patchValue({...item});
    //    }
    //    else{
    //      this.targetsScreenForm.patchValue({financialYear:this.selectedFinancialYear,})
    //    }
       
    //    const modal1 = new bootstrap.Modal(document.getElementById('addTarget'));
    //    modal1.show();
 
    //  }
 
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
         // Destroy existing instance if it exists
   if ($.fn.DataTable.isDataTable('#view-physical-table')) {
     $('#view-physical-table').DataTable().destroy();
   }
 
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
 
     reinitializeDataTable() {
       if (this.dataTable) {
         this.dataTable.destroy();
       }
       setTimeout(() => {
         this.initializeDataTable();
       }, 0);
     }
 
    //  submitTarget(){
    //    console.log(this.targetsScreenForm.value, 'targetsScreenForm');
    //    let payload: any = { ...this.targetsScreenForm.value };
    //    payload['outcomeId'] = Number(this.targetsScreenForm.value.outcomeId);
    //    payload['agencyId'] = this.selectedAgencyId;
    //    if(this.editRow){
    //      this._commonService
    //      .update(APIS.physicalTagets.updateTargets, payload,this.physicalTargetId)
    //      .subscribe({
    //        next: (data) => {
    //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    //          this.toastrService.success('Physical Targets updated Successfully', "Success!");
    //          this.targetsScreenForm.reset();
    //          this.GetProgramsByAgency(this.selectedAgencyId);
    //        },
    //        error: (err) => {
    //          console.log(err, 'err');
    //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    //          this.toastrService.error(err, "Physical Targets Creation Error!");
    //          new Error(err);
    //        },
    //      });
    //    }
    //    else{
    //      this._commonService
    //      .add(APIS.physicalTagets.saveTargets, payload)
    //      .subscribe({
    //        next: (data) => {
    //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    //          this.toastrService.success('Physical Targets Added Successfully', "Success!");
    //          this.targetsScreenForm.reset();
    //          this.GetProgramsByAgency(this.selectedAgencyId);
    //        },
    //        error: (err) => {
    //          console.log(err, 'err');
    //          document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    //          this.toastrService.error(err, "Physical Targets Creation Error!");
    //          new Error(err);
    //        },
    //      });
    //    }
       
    //  }
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
       formDetails() {
    this.targetsScreenForm = new FormGroup({
      "activityId": new FormControl("", [Validators.required]),
      "subActivityId": new FormControl("", [Validators.required]),
      "financialYear": new FormControl(this.selectedFinancialYear, [Validators.required]),
      "q1Target": new FormControl("", [Validators.required, Validators.min(0)]),
      "q2Target": new FormControl("", [Validators.required, Validators.min(0)]),
      "q3Target": new FormControl("", [Validators.required, Validators.min(0)]),
      "q4Target": new FormControl("", [Validators.required, Validators.min(0)]),
      "q1Budget": new FormControl("", [Validators.required, Validators.min(0)]),
      "q2Budget": new FormControl("", [Validators.required, Validators.min(0)]),
      "q3Budget": new FormControl("", [Validators.required, Validators.min(0)]),
      "q4Budget": new FormControl("", [Validators.required, Validators.min(0)])
    });
  }

  getActivitiesList() {
    // Replace with your actual API endpoint for activities
     this._commonService.getById(APIS.programCreation.getActivityListbyId,this.agencyId?this.agencyId:this.selectedAgencyId).subscribe({
      next: (data: any) => {
        this.activitiesList = data.data;
      },
      error: (err: any) => {
        this.activitiesList = [];
      }
    })
  }
  

  onActivityChange(event: any) {
    const activityId = event.target.value;
    if (activityId) {
      this.getSubActivitiesByActivity(activityId);
    } else {
      this.subActivitiesList = [];
    }
    // Reset sub activity selection
    this.targetsScreenForm.patchValue({ subActivityId: "" });
  }

  getSubActivitiesByActivity(activityId: any) {
    this._commonService.getDataByUrl(`${APIS.programCreation.getSubActivityListByActivity+'/'+activityId}`).subscribe({
      next: (data: any) => {
        this.subActivitiesList = data.data.subActivities;
      },
      error: (err: any) => {
        this.subActivitiesList = [];
      }
    })
    // // Replace with your actual API endpoint for sub-activities
    // this._commonService.getDataByUrl(`${APIS.masterList.subActivitiesList}/${activityId}`).subscribe((res: any) => {
    //   this.subActivitiesList = res.data || [];
    // }, (error) => {
    //   console.error('Error fetching sub-activities:', error);
    //   this.subActivitiesList = [];
    // });
  }


  openTargetsModal(type: any, item?: any) {
    this.editRow = type === 'edit';
    this.selectedTargetType = this.activeTab === 'nav-twos' ? 'training' : 'non-training';
    
    this.targetsScreenForm.reset();
    
    if (this.editRow && item) {
      this.physicalTargetId = item.physicalTargetId;
      this.targetsScreenForm.patchValue({
        activityId: item.activityId,
        subActivityId: item.subActivityId,
        financialYear: item.financialYear,
        q1Target: item.q1Target,
        q2Target: item.q2Target,
        q3Target: item.q3Target,
        q4Target: item.q4Target,
        q1Budget: item.q1Budget,
        q2Budget: item.q2Budget,
        q3Budget: item.q3Budget,
        q4Budget: item.q4Budget
      });
      
      // Load sub-activities for the selected activity
      if (item.activityId) {
        this.getSubActivitiesByActivity(item.activityId);
      }
    } else {
      this.targetsScreenForm.patchValue({
        financialYear: this.selectedFinancialYear
      });
    }
    
    const modal1 = new bootstrap.Modal(document.getElementById('addTarget'));
    modal1.show();
  }

  submitTarget() {
    if (this.targetsScreenForm.invalid) {
      this.targetsScreenForm.markAllAsTouched();
      return;
    }

    console.log(this.targetsScreenForm.value, 'targetsScreenForm');
    
    let payload: any = {
      agencyId: this.selectedAgencyId,
      subActivityId: Number(this.targetsScreenForm.value.subActivityId),
      financialYear: this.targetsScreenForm.value.financialYear,
      q1Target: Number(this.targetsScreenForm.value.q1Target),
      q2Target: Number(this.targetsScreenForm.value.q2Target),
      q3Target: Number(this.targetsScreenForm.value.q3Target),
      q4Target: Number(this.targetsScreenForm.value.q4Target),
      q1Budget: Number(this.targetsScreenForm.value.q1Budget),
      q2Budget: Number(this.targetsScreenForm.value.q2Budget),
      q3Budget: Number(this.targetsScreenForm.value.q3Budget),
      q4Budget: Number(this.targetsScreenForm.value.q4Budget)
    };

    // Determine API endpoint based on target type
    const apiEndpoint = this.selectedTargetType === 'training' 
      ? APIS.progressMonitoring.saveTrainingTargets 
      : APIS.progressMonitoring.saveNonTrainingTargets;

    if (this.editRow) {
      this._commonService.update(apiEndpoint, payload, this.physicalTargetId).subscribe({
        next: (data) => {
          this.handleSubmitSuccess(`${this.selectedTargetType === 'training' ? 'Training' : 'Non-Training'} Targets updated Successfully`);
        },
        error: (err) => {
          this.handleSubmitError(err);
        }
      });
    } else {
      this._commonService.add(apiEndpoint, payload).subscribe({
        next: (data) => {
          this.handleSubmitSuccess(`${this.selectedTargetType === 'training' ? 'Training' : 'Non-Training'} Targets Added Successfully`);
        },
        error: (err) => {
          this.handleSubmitError(err);
        }
      });
    }
  }

  private handleSubmitSuccess(message: string) {
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    this.toastrService.success(message, "Success!");
    this.targetsScreenForm.reset();
    this.GetProgramsByAgency(this.selectedAgencyId);
    this.closeModalTargets();
  }

  private handleSubmitError(err: any) {
    console.log(err, 'err');
    document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
    this.toastrService.error(err?.error?.message || err, "Target Creation Error!");
  }
 }

 // ...existing code...

 