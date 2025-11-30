import { Component, OnInit } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { Role } from '@app/_models';
import { LoaderService } from '@app/common_components/loader-service.service';

@Component({
  selector: 'app-msme-by-quarter',
  templateUrl: './msme-by-quarter.component.html',
  styleUrls: ['./msme-by-quarter.component.css']
})
export class MsmeByQuarterComponent implements OnInit {

  constructor(
     private _commonService: CommonServiceService,
     private toastrService: ToastrService,
     private loaderService: LoaderService
   ) {}
 
   ngOnInit(): void {
       this.getAgenciesList();
    this.generateFinancialYears() 

     
   }
 
    agencyList: any[] = [];
   agencyListFiltered: any[] = [];
 selectedAgencyId: any='All Intervention';
     getAgenciesList() {
     this._commonService.getDataByUrl(APIS.msmeQueaterly.getUniqueIntervention).subscribe({
       next: (res: any) => {
         this.agencyList = res.data;
         this.selectedAgencyId='All Intervention'
         this.selectedQuarter='Q1'
         this.agencyListFiltered = this.agencyList;
         this.getBasedOnQuarterSelection()
       },
       error: (err) => {
         this.toastrService.error(err.error.message);
       },
     });
   }
  selectedType: string = 'Actuals';

  onTypeChange(value: string) {
    this.selectedType = value;
    // You can add additional logic here if needed when the type changes
  }


   GetProgramsByAgency(value: any) {
     this.getBasedOnQuarterSelection()
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


    selectedQuarter: string = '';

    onQuarterChange(value: string) {
      this.selectedQuarter = value;
       this.getBasedOnQuarterSelection()
      // You can add additional logic here if needed when the quarter changes
    }

    getBasedOnYearSelection(event: any) {
      this.getBasedOnQuarterSelection()
    }
    getTableData:any={}
    errorMessage:any=''
    getBasedOnQuarterSelection() {
      this.errorMessage='Data Not Available'
      if(!this.selectedAgencyId){
        this.toastrService.error('Please select Intervention');
        return;
      }
      if(!this.selectedFinancialYear){
        this.toastrService.error('Please select Financial Year');
        return;
      }
      if(!this.selectedQuarter){
        this.toastrService.error('Please select Quarter');
        return;
      }
      this.getTableData={}
        let url=APIS.msmeQueaterly.getMSMEByQuarterIntervention+'?intervention='+this.selectedAgencyId+'&financialYear='+this.selectedFinancialYear+'&quarter='+this.selectedQuarter
         this._commonService.getDataByUrl(url).subscribe({
       next: (res: any) => {

       
         if(Object.keys(res.data).length){
            this.errorMessage=''
            this.getTableData = res.data;
         }
         else{
           this.errorMessage='Data Not Available'
         this.getTableData ={}
         }
         console.log(this.getTableData,'getTableData' );
       },
       error: (err) => {
        this.errorMessage='Data Not Available'
         this.getTableData ={}
         this.toastrService.error(err.error.message);
       },
     });
    }

}
