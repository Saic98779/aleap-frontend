import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ToastrService } from 'ngx-toastr';
import { APIS } from '@app/constants/constants';
@Component({
  selector: 'app-capture-outcome-dynamic',
  templateUrl: './capture-outcome-dynamic.component.html',
  styleUrls: ['./capture-outcome-dynamic.component.css']
})
export class CaptureOutcomeDynamicComponent implements OnInit {
  MobileNumber:any
  ListOfOutCome:any=[]
  ParticipantData:any={}
  ListOfDynamicFormData:any=[]
  formData:any={}
  agencyId: any;
  isFromNonTrainingTargets:boolean=false
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private router: Router,
    private _commonService: CommonServiceService) { 
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
      this.MobileNumber=this._commonService.getOption('mobileNumberForNonParticipant')
      if(this._commonService.getOption('mobileNumberForNonParticipant')){
        this.Search();
      }
      console.log(this._commonService.getOption('subActivityId'))
      if(this._commonService.getOption('subActivityId')){
          this.isFromNonTrainingTargets=true
      }
      else {
        this.isFromNonTrainingTargets=false
      }
    }

  ngOnInit(): void {
    this.GetOutComes()
    this.formDetails()
  }
  OutComeForm!:FormGroup

  get f2(){
    return this.OutComeForm.controls
  }
  formDetails(){
    this.OutComeForm=new FormGroup({outcomesName:new FormControl('',[Validators.required])})
  }
  GetParticipantByMobile(mobile:any){
    this._commonService.getById(APIS.captureOutcome.getParticipantData,mobile).subscribe({
      next: (res: any) => {
        this.ParticipantData = res?.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  addParticipant(){
    this._commonService.setOption('mobileNumberForNonParticipant', this.MobileNumber);
    // this._commonService.navigateToRoute('/PIA/add-non-participant-data');
    this.router.navigateByUrl('/add-non-participant-data');
  }
  enableButtoneTrue:boolean=false
  Search(){
    this.enableButtoneTrue=false
    this._commonService.getById(APIS.captureOutcome.getParticipantDataByMobile,this.MobileNumber).subscribe({
      next: (res: any) => {
        if(res.data){
          this.enableButtoneTrue=false
          this.ParticipantData = res?.data
        }
        else{
          this.enableButtoneTrue=true
          this.toastrService.warning('No participant data found for this mobile number. Please add Non participant details to proceed.', "Capture Program Outcome!");
          this.ParticipantData={}
        }
        

      },
      error: (err) => {
        this.enableButtoneTrue=true
         this.toastrService.warning('No participant data found for this mobile number. Please add Non participant details to proceed.', "Capture Program Outcome!");
        new Error(err);
      }
    })
  }
  // OutComes data
  
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
  getDynamicFormBasedOnOutCome(Outcome:any){
    const outcomeTableName = this.ListOfOutCome.find(
        (item: any) => (item.outcomeTableDisplayName === Outcome) )?.outcomeTableName;
    this.formData={}
    this.OutComeForm=new FormGroup({outcomesName:new FormControl('',[Validators.required])})
    this.OutComeForm.patchValue({outcomesName:Outcome})
    let type:any=''
    console.log(Outcome.includes('ZED'),Outcome)
    if(Outcome.includes('ZED')){
      // console.log('Outcome Table Display Name:', outcomeTableDisplayName);
      type=Outcome.split(' ')[2]
      console.log(type)
      Outcome=outcomeTableName+'?type='+type
    }
    console.log(outcomeTableName.includes('ZEDCertification'))
    if(this.ParticipantData?.participantId || this.ParticipantData?.influencedId ){
      let url:any =APIS.captureOutcome.getDynamicFormDataBasedOnOutCome+(this.ParticipantData?.influencedId?this.ParticipantData?.influencedId:this.ParticipantData?.participantId)+'/'+outcomeTableName+'?isInfluenced='+(this.ParticipantData?.influencedId?true:false)
      if(outcomeTableName.includes('ZED')){
        url =APIS.captureOutcome.getDynamicFormDataBasedOnOutCome+(this.ParticipantData?.influencedId?this.ParticipantData?.influencedId:this.ParticipantData?.participantId)+'/'+Outcome+'&isInfluenced='+(this.ParticipantData?.influencedId?true:false)
      }
      else{
         url =APIS.captureOutcome.getDynamicFormDataBasedOnOutCome+(this.ParticipantData?.influencedId?this.ParticipantData?.influencedId:this.ParticipantData?.participantId)+'/'+outcomeTableName+'?isInfluenced='+(this.ParticipantData?.influencedId?true:false)
      }
      this._commonService.getDataByUrl(url).subscribe({
        next: (res: any) => {
          if(res.status==200){
          let object:any
          this.ListOfDynamicFormData = res?.data?.outcomeForm;
          res.data?.outcomeForm?.map((item:any)=>{
            if(item.fieldType!='label'){
              this.OutComeForm.addControl( item?.fieldName, new FormControl('',[Validators.required]))
            }
            // if(item.fieldType=='label'){
            //   this.OutComeForm.addControl( item?.fieldName, new FormControl(item?.fieldValue,[Validators.required]))
            // }
            
          })
        }
        else{
          this.toastrService.error(res?.message, "Capture Program Outcome!");
          this.ListOfDynamicFormData = []
          this.OutComeForm.reset()
        }
        },
        error: (err) => {
          this.toastrService.error(err?.error?.message, "Capture Program Outcome!");
          this.ListOfDynamicFormData = []
          this.OutComeForm.reset()
          new Error(err);
        }
      })
    }
    else{
      this.toastrService.warning('Please Fetch Participant Details', "Capture Program Outcome!");
    }
    
  }
  SubmitOutCome(){
    if(Object.keys(this.ParticipantData)?.length){
      console.log(this.OutComeForm.value?.outcomesName,this.ParticipantData)
    
    // {"ondcRegistrationDate": "01-01-2025","ondcRegistrationNo": "ONDC123","participantId": 1,"organizationId": 1,"agencyId": 1}
    let formData = new FormData();
    let payload:any={}
    Object?.keys(this.OutComeForm.value)?.map((item:any)=>{
      if(item!='outcomesName'){
        payload[item]=this.OutComeForm.value[item]
      }
      
    })
        if(this.OutComeForm.value?.outcomesName.includes('ZED')){
           payload['zedCertificationType']=this.OutComeForm.value?.outcomesName.split(' ')?.[2]
        this.OutComeForm.value['outcomesName']= this.ListOfOutCome.find(
          (item: any) => (item.outcomeTableDisplayName === this.OutComeForm.value?.outcomesName) )?.outcomeTableName;
     
      }
      else{
        this.OutComeForm.value['outcomesName']= this.ListOfOutCome.find(
          (item: any) => (item.outcomeTableDisplayName === this.OutComeForm.value?.outcomesName) )?.outcomeTableName;
      }
    formData.set("data", JSON.stringify({...payload,
      participantId:this.ParticipantData?.participantId,
      influencedId:this.ParticipantData?.influencedId,
      organizationId:this.ParticipantData?.organizationId,
      agencyId:this.agencyId
   }));
      this._commonService.add(APIS.captureOutcome.saveOutComes+this.OutComeForm.value?.outcomesName,formData).subscribe({
        next: (res: any) => {
          if(res.status==200){
             this.toastrService.success('Capture Program Outcome Created Successfully', "Capture Program Outcome Success!");
          }
          else{
            this.toastrService.error(res?.message, "Capture Program Outcome!");
          }
         
        this.OutComeForm.reset()
        },
        error: (err) => {
          console.log(err)
          new Error(err);
          this.toastrService.error(err, "Capture Program Outcome!");
        }
      })
    }
    else{
      this.toastrService.warning('You can not Able to Sumbit without Participant Details.Please Add Partipant Details', "Capture Program Outcome!");
    } 
    

  }
  addArrayItem(fieldName: string, inputElement: HTMLInputElement) {
    const newValue = inputElement.value.trim();
    if (newValue) {
        const currentArray = this.f2[fieldName].value || [];
        currentArray.push(newValue);
        this.f2[fieldName].setValue(currentArray);
        inputElement.value = ''; // Clear the input
        this.f2[fieldName].markAsTouched();
    }
}

removeArrayItem(fieldName: string, index: number) {
    const currentArray = this.f2[fieldName].value || [];
    currentArray.splice(index, 1);
    this.f2[fieldName].setValue(currentArray);
    this.f2[fieldName].markAsTouched();
}
BackToPrevious(){
  if(this._commonService.getOption('subActivityId').split('-')[2]=='tgtpc10'){
    this.router.navigateByUrl('/non-training-progress-tgtpc10');
  this._commonService.setOption('subActivityId', this._commonService.getOption('subActivityId') );
  }
  else{
    this.router.navigateByUrl('/non-training-targets');
  this._commonService.setOption('subActivityId', this._commonService.getOption('subActivityId') );
  }
  
}

}
