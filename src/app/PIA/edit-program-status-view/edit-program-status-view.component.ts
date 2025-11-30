import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var bootstrap: any;

@Component({
  selector: 'app-edit-program-status-view',
  templateUrl: './edit-program-status-view.component.html',
  styleUrls: ['./edit-program-status-view.component.css']
})
export class EditProgramStatusViewComponent implements OnInit {

  loginsessionDetails: any;
    agencyId: any;
    programIds:any
    constructor(private fb: FormBuilder,
      private toastrService: ToastrService,
      private _commonService: CommonServiceService, private router: Router,) { 
        this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      }
  
    ngOnInit(): void {
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
      if(this.loginsessionDetails.userRole == 'ADMIN') {
        this.getAgenciesList()
      }
     
     
    }
     selectedAgencyId:any;
    agencyList:any;
    agencyListFiltered:any;
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.agencyListFiltered= this.agencyList;
      this.selectedAgencyId = res.data[0].agencyId
      this.getProgramsByAgencyAdmin(this.selectedAgencyId)
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }
   agencyProgramList: any;
    agencyProgramListFiltered:any;
    getProgramsByAgencyAdmin(agency:any) {
     
      this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgency+'/'+agency}`).subscribe({
        next: (res: any) => {
          this.agencyProgramList = res?.data
          this.agencyProgramListFiltered = this.agencyProgramList
          this.programIds = this.agencyProgramList[0]
          this.dropdownProgramsList(this.agencyProgramList[0],'table')
        },
        error: (err) => {
          new Error(err);
        }
      })
    }
    ProgramsDataBasedOnSelection:any={}
    dropdownProgramsList(event:any,from:any){
      console.log(event);
      this.ProgramsDataBasedOnSelection= event;
    }

}
