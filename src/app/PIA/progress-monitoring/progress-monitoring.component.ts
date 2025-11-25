import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-progress-monitoring',
  templateUrl: './progress-monitoring.component.html',
  styleUrls: ['./progress-monitoring.component.css']
})
export class ProgressMonitoringComponent implements OnInit {
localStorageData: any;
  sessionDetailsList: any;
  tableList: any;
  tableListTraining: any;
  dataTable: any;
  agencyList: any = [];
  loginsessionDetails: any;
  agencyId: any;
  activeTab: any;

 constructor(
     private toastrService: ToastrService,
     private _commonService: CommonServiceService,
     private router: Router,
   ) { 
     this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
     this.selectedAgencyId = this.loginsessionDetails.agencyId;
   }
 

  ngOnInit(): void {
    this.activeTab = 'nav-twos';
    this.getAgenciesList()
  }
    onTabChange(activeTab:any){
    this.activeTab = activeTab;
    if(Number(sessionStorage.getItem('selectedAgencyIdByProgressMonitoring'))){
          this.selectedAgencyId=Number(sessionStorage.getItem('selectedAgencyIdByProgressMonitoring'))
          this.GetProgramsByAgency(this.selectedAgencyId);
        }
        else{
          //  this.selectedAgencyId = res.data[0].agencyId;
          this.GetProgramsByAgency(this.selectedAgencyId);
        }
  }
 selectedAgencyId: any;
  agencyListFiltered: any;
  getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered=this.agencyList;
        if(Number(sessionStorage.getItem('selectedAgencyIdByProgressMonitoring'))){
          this.selectedAgencyId=Number(sessionStorage.getItem('selectedAgencyIdByProgressMonitoring'))
          this.GetProgramsByAgency(this.selectedAgencyId);
        }
        else{
           this.selectedAgencyId = res.data[0].agencyId;
          this.GetProgramsByAgency(this.selectedAgencyId);
        }
       
      }, (error) => {
        // this.toastrService.error(error.message);
      });
    }
    getAgencyName(val:any){
      return this.agencyList.find((item:any)=>item.agencyId==val)?.agencyName || '';
    }
    tableheaderList:any
        GetProgramsByAgency(value?: any) {
          this.tableList = []
          this.tableListTraining = []
          this.tableheaderList = []
          
          // Initialize with sample data structure
          // this.tableList = {
          //     "trainingPrograms": [
                
          //     ],
          //     "nonTrainingPrograms": [
          //     ]
          // }
          
          // Make API call to get actual data
          this._commonService.getDataByUrl(APIS.progressMonitoring.getTrainigAndNonTraining+"?agencyId="+value).subscribe({
            next: (dataListResponse: any) => {
              if(dataListResponse ) {
                  this.tableList = dataListResponse;
              }
           
             console.log('Progress Monitoring Data:', this.tableList);
            },
            error: (error: any) => {
             console.error('Error fetching progress monitoring data:', error);
            }
          });
          this._commonService.getDataByUrl(APIS.progressMonitoring.getNonTrainingProgress+"?agencyId="+value).subscribe({
            next: (dataListResponse: any) => {
              if(dataListResponse && dataListResponse) {
                  this.tableListTraining = dataListResponse;
              }
           
             console.log('Progress Monitoring Data:', this.tableList);
            },
            error: (error: any) => {
             console.error('Error fetching progress monitoring data:', error);
            }
          });
        }
        redirectAchievements(){
          sessionStorage.setItem('selectedAgencyIdByProgressMonitoring',this.selectedAgencyId)
          this.router.navigate(['/Training-Non-trainingAchievements'])
        }
         redirectPrograms(){
          this.router.navigate(['/veiw-program'])
        }
}
