import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { debounceTime } from 'rxjs';
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
  allSectors:any = []
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
    this.getAllSectors();
  }

  esdpTrainingList:any;
  getESDPProgram() {
    this._commonService.getDataByUrl(APIS.programCreation.getESDPTraining).subscribe({
      next: (res: any) => {
        console.log(res)
        this.esdpTrainingList = res?.data || [];
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  normalizeSectorList(sectors: any) {
    if (Array.isArray(sectors)) {
      return sectors.map((sector: any) => sector?.sectorName || sector?.sector || sector?.name || sector).filter((sector: any) => !!sector);
    }

    if (typeof sectors === 'string' && sectors.trim()) {
      return sectors.split(',').map((sector: string) => sector.trim()).filter((sector: string) => !!sector);
    }

    return [];
  }

  getSectorDisplay(sectors: any) {
    return this.normalizeSectorList(sectors).join(', ');
  }

  getSectorLabel(sector: any) {
    return sector?.sectorName || sector?.sector || sector?.name || sector;
  }

  getSectorValue(sector: any) {
    return sector?.sectorName || sector?.sector || sector?.name || sector;
  }

  getAllSectors(){
    this.allSectors = []
    this._commonService.getDataByUrl(APIS.masterList.getSectors).subscribe({
      next: (data: any) => {
        this.allSectors = data.data;
      },
      error: () => {
        this.allSectors = [];
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
      memberId: new FormControl(""),
      sectors: new FormControl(""),
      dateOfAwarenessProgram: new FormControl("",[Validators.required]),
      interestedInAttending15Days: new FormControl("",[Validators.required]),
      dateOfApplicationReceived: new FormControl("",[Validators.required]),
      selectedForTraining: new FormControl("",[Validators.required]),
      interestedSectorsForEsdp: new FormControl([], [Validators.required]),
      organizationCategory: new FormControl(""),
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
          const autoSelectedDate = res?.data?.programDates?.[0] || ''
          const sectorsDisplay = this.getSectorDisplay(res?.data?.sectors)
          const autoApplicationDate = moment().format('DD-MM-YYYY')
          this.ESDPTraningForm.patchValue({
            agencyId: this.agencyId,
            participantId: this.ParticipantData.participantId,
            organizationId: this.ParticipantData.organizationId,
            participantName: this.ParticipantData.participantName,
            organizationName: this.ParticipantData.organizationName,
            organizationCategory: this.ParticipantData.organizationCategory,
            memberId: this.ParticipantData.memberId || '',
            sectors: sectorsDisplay,
            dateOfAwarenessProgram: autoSelectedDate,
            // dateOfApplicationReceived: autoApplicationDate,
            interestedSectorsForEsdp: this.normalizeSectorList(res?.data?.sectors),
            nameOfTheSHG: this.ParticipantData.nameOfTheSHG || ''
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

    if (this.ESDPTraningForm.invalid) {
      this.ESDPTraningForm.markAllAsTouched();
      this.toastrService.error('Please fill all required fields');
      return;
    }
      
    let dateOfApplicationReceived = this.ESDPTraningForm.value.dateOfApplicationReceived || '';
    let dataObj = {
      participantId: Number(this.ESDPTraningForm.value.participantId || 0),
      organizationId: Number(this.ESDPTraningForm.value.organizationId || 0),
      agencyId: Number(this.ESDPTraningForm.value.agencyId || 0),
      dateOfAwarenessProgram: this.ESDPTraningForm.value.dateOfAwarenessProgram,
      interestedInAttending15Days: this.ESDPTraningForm.value.interestedInAttending15Days,
      dateOfApplicationReceived: dateOfApplicationReceived,
      selectedForTraining: this.ESDPTraningForm.value.selectedForTraining,
      interestedSectorsForEsdp: this.normalizeSectorList(this.ESDPTraningForm.value.interestedSectorsForEsdp)
    }
    
    this._commonService.add(APIS.programCreation.saveESDPTraining, dataObj).subscribe((res: any) => {
      this.toastrService.success('ESDP Program added successfully', 'Success');
      this.ESDPTraningForm.reset();
      this.getESDPProgram();
    }, (error) => {
      this.toastrService.error('Error while adding ESDP Program');
    });
  }
}
