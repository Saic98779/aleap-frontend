import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { debounceTime, fromEvent } from 'rxjs';
import { Subject } from 'rxjs';
@Component({
  selector: 'app-esdp-training',
  templateUrl: './esdp-training.component.html',
  styleUrls: ['./esdp-training.component.css']
})
export class ESDPTrainingComponent implements OnInit {

  ESDPTraningForm!: FormGroup;
  MobileNumber:any
  ParticipantData:any;
  agencyId:any
  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
  ) { 
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    this.searchSubject.pipe(debounceTime(1000)).subscribe(value => {
      this.MobileNumber = value;      
      this.Search();
    });
  }

  ngOnInit(): void {
    this.formDetails();
    this.getESDPProgram();
  }

  esdpTrainingList:any;
  getESDPProgram() {
    this._commonService.getDataByUrl(APIS.programCreation.getESDPProgram).subscribe({
      next: (res: any) => {
        console.log(res)
        this.esdpTrainingList = res.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  formDetails() {
    this.ESDPTraningForm  = new FormGroup({      
      agencyId: new FormControl(""),
      participantId: new FormControl(""),
      participantName: new FormControl(""),
      organizationId: new FormControl(""),
      organizationName: new FormControl(""),
      dateOfAwarenessProgram: new FormControl("",[Validators.required]),
      interestedInAttending15Days: new FormControl("",[Validators.required]),
      dateOfApplicationReceived: new FormControl("",[Validators.required]),
      selectedForTraining: new FormControl("",[Validators.required]),
      organizationCategory: new FormControl("",[Validators.required]),
      nameOfTheSHG: new FormControl(""),
    });    
  }

  programDatesDropdown=[]
  showParticpantFlag:boolean = false
  Search(){
    this.ESDPTraningForm.reset()
    this.programDatesDropdown = []
    this.showParticpantFlag = false
    this._commonService.getById(APIS.captureOutcome.getParticipantData,this.MobileNumber).subscribe({
      next: (res: any) => {
        if(res.data) {
          this.ParticipantData = res?.data
          this.showParticpantFlag = false
          this.programDatesDropdown = res?.data?.programDates
          this.ESDPTraningForm.patchValue({
            agencyId: this.agencyId,
            participantId: this.ParticipantData.participantId,
            organizationId: this.ParticipantData.organizationId,
            participantName: this.ParticipantData.participantName,
            organizationName: this.ParticipantData.organizationName,
            organizationCategory: this.ParticipantData.organizationCategory,
          })
          this.toastrService.success('Participant data found successfully');
        }else {
          this.showParticpantFlag = true
          this.toastrService.error('No Records Found. Please add the participant data first');  
        }
        
      },
      error: (err) => {
        new Error(err);
        this.showParticpantFlag = true
        this.toastrService.error('No Records Found. Please add the participant data first');
      }
    })
  }

  private searchSubject = new Subject<string>();

  onSearchChange(event:any){
    
    if(event && event.length == 10) {
      this.showParticpantFlag = false
      this.searchSubject.next(event);
    }else {
      this.showParticpantFlag = true
    }
  }

  onModalSubmitRegister(){
    if(this.showParticpantFlag){
      this.toastrService.error('Please search the participant data first');
      return;
    }
      
    let dateOfApplicationReceived = moment(this.ESDPTraningForm.value.dateOfApplicationReceived, moment.ISO_8601, true).isValid() 
      ? moment(this.ESDPTraningForm.value.dateOfApplicationReceived).format('DD-MM-YYYY') 
      : '';
    let dataObj = {      
      ...this.ESDPTraningForm.value,
      dateOfApplicationReceived: dateOfApplicationReceived,
    }
    
    this._commonService.add(APIS.programCreation.addESDPProgram, dataObj).subscribe((res: any) => {
      this.toastrService.success('ESDP Program added successfully', 'Success');
      this.ESDPTraningForm.reset();
      this.getESDPProgram();
    }, (error) => {
      this.toastrService.error('Error while adding ESDP Program');
    });
  }
}
