
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import moment from 'moment';
import { REGEX } from '@app/_helpers/regex';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
declare var $: any;
@Component({
  selector: 'app-add-participant-data',
  templateUrl: './add-participant-data.component.html',
  styleUrls: ['./add-participant-data.component.css'],
})
export class AddParticipantDataComponent implements OnInit {
  ParticipantDataForm!: FormGroup;
  OrganisationForm!: FormGroup;
  submitedData: any = []
  OragnizationType: any = 'SHG'
  agencyId:any
  // udyamYesOrNo:any='No'
  programIds: any = '';
  loginsessionDetails: any;
  participantdetailsId: any;
  EditProgramId: any;
  DefaultDisabled: boolean = false;
  constructor(private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
    private route: ActivatedRoute,) { 
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }
    selectedItems: any[] = [];
    dropdownList1=[];
    dropdownListOrg=[];
    dropdownSettingsOrg: IDropdownSettings = {};
    assignFluidData1Org() {
      this.dropdownSettingsOrg = {
          singleSelection: true,
          idField: 'organizationId',
          textField: 'organizationName',
          itemsShowLimit: 1,
          allowSearchFilter: true,
          clearSearchFilter: true,
          maxHeight: 197,
          searchPlaceholderText: "Search Organization",
          noDataAvailablePlaceholderText: "Data Not Available",
          closeDropDownOnSelection: false,
          showSelectedItemsAtTop: false,
          defaultOpen: false,
      };
      this.dropdownListOrg = this.OrganizationData;
     
    //   this.contractListObj.area= this.selectMapList1;
  }
   
  
    onItemSelectOrg(item: any) {
      console.log('Item selected:', item);
    }
  
  
    onItemDeSelectOrg(item: any) {
      console.log('Item deselected:', item);
    }
  
    dropdownSettings: IDropdownSettings = {};
    assignFluidData1() {
      this.dropdownSettings = {
          singleSelection: false,
          idField: 'sectorId',
          textField: 'sectorName',
          itemsShowLimit: 1,
          enableCheckAll: true,
          selectAllText: "Select All",
          unSelectAllText: "Clear All",
          allowSearchFilter: true,
          clearSearchFilter: true,
          maxHeight: 197,
          searchPlaceholderText: "Search Area",
          noDataAvailablePlaceholderText: "Data Not Available",
          closeDropDownOnSelection: false,
          showSelectedItemsAtTop: false,
          defaultOpen: false,
      };
      this.dropdownList1 = this.allSectors;
     
    //   this.contractListObj.area= this.selectMapList1;
  }
   
  
    onItemSelect(item: any) {
      console.log('Item selected:', item);
    }
  
    onSelectAll(items: any[]) {
      console.log('All items selected:', items);
    }
  
    onItemDeSelect(item: any) {
      console.log('Item deselected:', item);
    }
  
    onDeSelectAll(items: any[]) {
      console.log('All items deselected');
    }
  ngOnInit(): void {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
    this.loadOrganizations()
    this.formDetails();
    this.formDetailsOrganization();
    //this.getData()
    
    //this.getAllPrograms()
    this.getProgramsByAgency()
    //this.fOrg['udyamYesOrNo'].value.setValue('No')
    this.getAllDistricts()
    this.getAllSectors()
    this.typeOragnization('SHG')
    // = this.route.snapshot.paramMap.get('id');
    // this.participantdetailsId = this.route.snapshot.params
    this.participantdetailsId = this.route.snapshot.paramMap.get('id')?.split('-')[0];
    this.EditProgramId = this.route.snapshot.paramMap.get('id')?.split('-')[1];
    console.log(this.participantdetailsId, 'participantdetailsId');

    if (this.participantdetailsId) {
      setTimeout(() => {
        this.getParticipantDetailsById(this.participantdetailsId);
      }, 500);
      
    }
    else{
      this.DefaultDisabled= true;
    }
    console.log(this.participantdetailsId, 'programId');
  }

  allDistricts:any
  getAllDistricts(){
    this.allDistricts = []
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
      },
      error: (err: any) => {
        this.allDistricts = [];
      }
    })
  }
  allSectors:any
  getAllSectors(){
    this.allSectors = []
    this._commonService.getDataByUrl(APIS.masterList.getSectors).subscribe({
      next: (data: any) => {
        this.allSectors = data.data;
        this.assignFluidData1()
      },
      error: (err: any) => {
        this.allSectors = [];
      }
    })
  }

  agencyProgramList: any;
  getProgramsByAgency() {
    //`${APIS.programCreation.getProgramsListByAgency+'/'+this.loginsessionDetails.agencyId}`

    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListBySession + this.loginsessionDetails.agencyId}?status=Sessions Created`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  programList: any;
  getAllPrograms() {
    this.programList = []
    this._commonService.getDataByUrl(APIS.programCreation.getProgramsList).subscribe({
      next: (res: any) => {
        this.programList = res?.data
        this.programIds = this.programList[0]?.programId
        this.getData()
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  getParticipantDetailsById(id  : any){
    this._commonService.getById(APIS.participantdata.getParticipantDetailsById, id).subscribe({
      next: (res: any) => {
        if(res.data){
          this.getDataByMobileNumber(res.data.mobileNo)
          this.editRow(res.data, 0);
        }
        else{
          this.isedit=false
        }
        
      },
      error: (err) => {
        new Error(err);
      }
    })
  }
  dropdownProgramsList(event: any, type: any) {
    this.programIds = event.target.value
    if (type == 'table') {
      this.getData()
    }
  }
  ngAfterViewInit() {

  }
  get f2() {
    return this.ParticipantDataForm.controls;
  }
  get fOrg() {
    return this.OrganisationForm.controls;
  }
  formDetails() {
    this.ParticipantDataForm = new FormGroup({
      // date: new FormControl("", [Validators.required]),
      isAspirant: new FormControl("Aspirant", [Validators.required]),
      organizationId: new FormControl("",),
      participantName: new FormControl("", [Validators.required,Validators.pattern(/^[A-Za-z][A-Za-z .]*$/)]), //Validators.required
      gender: new FormControl("", [Validators.required,]),
      disability: new FormControl("N", [Validators.required]),
      // noOfDays: new FormControl("", [Validators.required,]),
      category: new FormControl("",[Validators.required,]),
      aadharNo: new FormControl("", [Validators.pattern(/^[0-9]{12}$/)]),
      mobileNo: new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      email: new FormControl("", [Validators.email]),
      designation: new FormControl("", ),
      isParticipatedBefore: new FormControl("",),
      previousParticipationDetails: new FormControl("",),
      preTrainingAssessmentConducted: new FormControl("",),
      postTrainingAssessmentConducted: new FormControl("",),
      isCertificateIssued: new FormControl("N",),
      certificateIssueDate: new FormControl("",),
      needAssessmentMethodology: new FormControl("",),
      programIds: new FormControl("", [Validators.required,]),
    
      // TargetSector: new FormControl("",[Validators.required,]),
      // targetAudience: new FormControl("",[Validators.required,]),
      // targetNoOfParticipants: new FormControl("",[Validators.required,]),
    });
  }
  formDetailsOrganization() {
    this.OrganisationForm = new FormGroup({
      // date: new FormControl("", [Validators.required]),
      
      "organizationCategory": new FormControl("",),
      "organizationType": new FormControl("", [Validators.required,]),
      "udyamregistrationNo": new FormControl(""),
      "organizationName": new FormControl("",[Validators.pattern(/^[^\s].*/)]),
      "udyamYesOrNo": new FormControl("No",),
      "dateOfRegistration": new FormControl("", ),
      "startupCertificateNo": new FormControl("",),
      "natureOfStartup": new FormControl("", ),
      "areasOfWorking": new FormControl("", ),
      "msmeStartup": new FormControl("",),

      "incorporationDate": new FormControl("",),
      "dateOfIssue": new FormControl("",),
      "validupto": new FormControl("",),
      "stateId": new FormControl("Telangana", [Validators.required,]),
      "distId": new FormControl("", [Validators.required,]),
      "sectorIds": new FormControl([], [Validators.required,]),
      "mandal": new FormControl("", [Validators.required,]),
      "town": new FormControl("", [Validators.required,]),
      "streetNo": new FormControl("", ),
      "houseNo": new FormControl("", ),
      "latitude": new FormControl("", [Validators.pattern(/^[0-9.]{1,50}$/)]),
      "longitude": new FormControl("", [Validators.pattern(/^[0-9.]{1,50}$/)]),
      "contactNo": new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      "email": new FormControl("", [Validators.email,]),
      "website": new FormControl("", ),
      // "ownerName": new FormControl("", [Validators.required,]),
      "ownerName": new FormControl("",[Validators.pattern(/^[^\s].*/)]),
      "ownerContactNo": new FormControl("", [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]),
      "ownerEmail": new FormControl("", [Validators.email,]),
      "ownerAddress": new FormControl("", ),
      "nameOfTheSHG": new FormControl("",),
      "nameOfTheVO": new FormControl("",),
      "gramaPanchayat": new FormControl("",)
    });
    
  }
  getData() {
    this.submitedData = []
    // sessionStorage.getItem('ParticipantData')
    // let resList = sessionStorage.getItem('ParticipantData') || ''
    // // let resList = sessionStorage.getItem('ParticipantData') || ''   
    // console.log(resList) 
    // if(resList){
    //   this.submitedData=JSON.parse(resList)
    // }
    this._commonService.getById(APIS.participantdata.getDataByProgramId, this.programIds).subscribe({
      next: (res: any) => {
        this.submitedData = res?.data
        this.reinitializeDataTable();
        // this.advanceSearch(this.getSelDataRange);
        // modal.close()

      },
      error: (err) => {
        // this.toastrService.error(err.message, "Participant Data Error!");
        new Error(err);
      },
    });
    // console.log(this.submitedData)
  }

  dataTable: any;
  reinitializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  initializeDataTable() {
    this.dataTable = new DataTable('#view-table-participant', {
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
      paging: false,
      info: false,
      searching: false,
      destroy: true, // Ensure reinitialization doesn't cause issues
    });
  }

  Submitform() {
    
    let payload:any={...this.ParticipantDataForm.value }
   console.log(typeof payload['programIds'],payload['programIds'],this.previousParticipationDetails?.programIds,)
    if(this.f2['isAspirant'].value!='Existing Oragnization'){
    delete payload['organizationId']
  }
  if(payload['isCertificateIssued']=='N'){
    delete payload['certificateIssueDate'];
  }
  else{
    payload['certificateIssueDate']=payload['certificateIssueDate']?moment(payload['certificateIssueDate']).format('DD-MM-YYYY'):null
  }
   
    this.submitedData.push(this.ParticipantDataForm.value)
    // sessionStorage.setItem('ParticipantData', this.submitedData)

    sessionStorage.setItem('ParticipantData', JSON.stringify(this.submitedData));
  if(this.isedit){
    console.log(this.participantId,this.previousParticipationDetails?.programIds,payload.programIds)
    if(Object?.keys(this.previousParticipationDetails)?.length){
      payload['programIds']=[payload.programIds,...this.previousParticipationDetails?.programIds]
    }
    else{
      payload['programIds'] = [Number(this.ParticipantDataForm.value.programIds)]
    }
    // payload['programIds']=[this.ParticipantDataForm.value.programIds]
    payload['participantId']=this.participantId
    this._commonService
        .add(APIS.participantdata.update, payload).subscribe({
      next: (data: any) => {
        if(data?.status==400){
          this.toastrService.error(data?.message, "Participant Data Error!");
        }
        else{
          // this.advanceSearch(this.getSelDataRange);
         this.programIds = this.ParticipantDataForm.value.programIds?this.ParticipantDataForm.value.programIds:this.programList[0]?.programId
        //  this.getData()
         this.isedit=false
         this.participantId=''
         this.ParticipantDataForm.reset()
         this.formDetails()
         this.router.navigateByUrl('/view-participant-data');
         // modal.close()
         this.toastrService.success('Participant Data updated Successfully', "Participant Data Success!");
        }
       
      },
      error: (err) => {
        this.ParticipantDataForm.reset()
        this.isedit=false
        this.formDetails()
        this.toastrService.error(err.message, "Participant Data Error!");
        new Error(err);
      },
    });
  }
  else{
    let Url=APIS.participantdata.add
    if(Object?.keys(this.previousParticipationDetails)?.length){
      Url=APIS.participantdata.update
      payload['programIds']=[payload.programIds,...this.previousParticipationDetails?.programIds]
      payload['participantId']=this.previousParticipationDetails?.participantId
    }
    else{
      payload['programIds'] = [Number(this.ParticipantDataForm.value.programIds)]
    }
    this._commonService
      .add(Url, payload).subscribe({
        next: (data: any) => {
          if(data?.status==400){
            this.toastrService.error(data?.message, "Participant Data Error!");
          }
          else{
            // this.advanceSearch(this.getSelDataRange);
          this.programIds = this.ParticipantDataForm.value.programIds?this.ParticipantDataForm.value.programIds:this.programList[0]?.programId
          // this.getData()
          this.isedit=false
          this.participantId=''
          this.ParticipantDataForm.reset()
          this.formDetails()
          // modal.close()
          this.toastrService.success('Participant Data Added Successfully', "Participant Data Success!");
          }
          
        },
        error: (err) => {
          this.ParticipantDataForm.reset()
          this.formDetails()
          this.toastrService.error(err.message, "Participant Data Error!");
          new Error(err);
        },
      });
    }
    //this.getData()  
  }
  deleteRow(item: any, i: number) {
    //  this.submitedData.pop(i)
    this.submitedData.splice(i, 1)
    console.log(this.submitedData)
    // this.submitedData.push(this.ParticipantDataForm.value)
    // sessionStorage.setItem('ParticipantData', this.submitedData)
    sessionStorage.setItem('ParticipantData', JSON.stringify(this.submitedData));
    this.getData()
  }
  isedit:any=false
  participantId:any=''
  convertToISOFormat(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }
  previousParticipationDetails: any = {};
  getDataByMobileNumber(MobileNumber:any){
    // console.log(MobileNumber,String(MobileNumber).length,MobileNumber.length==10)
    this.previousParticipationDetails={}
    if(String(MobileNumber).length){
      this.DefaultDisabled=false
      this._commonService.getById(APIS.captureOutcome.getParticipantData,MobileNumber).subscribe({
        next: (res: any) => {
          console.log(res)
          if(res.status==400){
            this.previousParticipationDetails={}
            this.ParticipantDataForm.reset()
            this.ParticipantDataForm.patchValue({mobileNo:MobileNumber})
          }
          else{
            let item = res?.data;
            this.previousParticipationDetails = item;
            if(!this.isedit){
              this.ParticipantDataForm.patchValue({ ...item,programIds: item.programIds?.[0], certificateIssueDate: item.certificateIssueDate?this.convertToISOFormat(item.certificateIssueDate):'',isAspirant:item.organizationId?'Existing Oragnization':'Aspirant'})
            }
            
          }
         
        },
        error: (err) => {
          this.previousParticipationDetails={}
          this.ParticipantDataForm.reset()
            this.ParticipantDataForm.patchValue({mobileNo:MobileNumber})
          new Error(err);
        }
      })
    }
    else{
      
    }
 
}
  editRow(item: any, i: any) {
    this.isedit=true
    this.participantId=item.participantId
   console.log(this.OrganizationData)
    this.onSearchChange(item.organizationName?.substring(0, 2) || '');
    this.ParticipantDataForm.patchValue({ ...item,programIds :item.programIds?.[0],certificateIssueDate: item.certificateIssueDate?this.convertToISOFormat(item.certificateIssueDate):'',isAspirant:item.organizationId?'Existing Oragnization':'Aspirant'})
  }

  typeOragnization(event: any) {
    this.OragnizationType = event
    this.fOrg['nameOfTheSHG'].patchValue('')
    this.fOrg['sectorIds'].patchValue([])
    this.fOrg['distId'].patchValue('')
    this.fOrg['mandal'].patchValue('')
    this.fOrg['nameOfTheVO'].patchValue('')
    this.fOrg['gramaPanchayat'].patchValue('')
    this.fOrg['organizationName'].patchValue('')
    this.fOrg['startupCertificateNo'].patchValue('')
    this.fOrg['natureOfStartup'].patchValue('')
    this.fOrg['incorporationDate'].patchValue('')
    this.fOrg['areasOfWorking'].patchValue('')
    this.fOrg['dateOfIssue'].patchValue('')
    this.fOrg['validupto'].patchValue('')
    this.fOrg['organizationCategory'].patchValue('')
    this.fOrg['udyamYesOrNo'].patchValue('')
    this.fOrg['udyamregistrationNo'].patchValue('')
    this.fOrg['dateOfRegistration'].patchValue('')
    if(this.OragnizationType=='SHG'){
      this.formDetailsOrganization();
      this.fOrg['organizationType'].patchValue('SHG')
      this.fOrg['nameOfTheSHG'].addValidators(Validators.required)
      this.fOrg['nameOfTheSHG'].addValidators(Validators.pattern(/^[^\s].*/))
      this.fOrg['distId'].addValidators(Validators.required)
      this.fOrg['mandal'].addValidators(Validators.required)
      this.fOrg['nameOfTheVO'].addValidators(Validators.required)
      this.fOrg['gramaPanchayat'].addValidators(Validators.required)
     
      this.fOrg['nameOfTheSHG'].updateValueAndValidity()
      this.fOrg['distId'].updateValueAndValidity()
      this.fOrg['mandal'].updateValueAndValidity()
      this.fOrg['gramaPanchayat'].updateValueAndValidity()
      this.fOrg['nameOfTheVO'].updateValueAndValidity()
    }
    else if(this.OragnizationType=='Start Up'){
      this.formDetailsOrganization()
      this.fOrg['organizationType'].patchValue('Start Up')
      this.fOrg['organizationName'].addValidators(Validators.required)
      this.fOrg['organizationName'].addValidators(Validators.pattern(/^[^\s].*/))
      // this.fOrg['startupCertificateNo'].addValidators(Validators.required)
      this.fOrg['natureOfStartup'].addValidators(Validators.required)
      this.fOrg['natureOfStartup'].addValidators(Validators.pattern(/^[^\s].*/))
      // this.fOrg['incorporationDate'].addValidators(Validators.required)
      // this.fOrg['dateOfIssue'].addValidators(Validators.required)
      // this.fOrg['validupto'].addValidators(null)
     
     
      this.fOrg['organizationName'].updateValueAndValidity()
      this.fOrg['startupCertificateNo'].updateValueAndValidity()
      this.fOrg['natureOfStartup'].updateValueAndValidity()
      this.fOrg['incorporationDate'].updateValueAndValidity()
      this.fOrg['areasOfWorking'].updateValueAndValidity()
      this.fOrg['dateOfIssue'].updateValueAndValidity()
      this.fOrg['validupto'].updateValueAndValidity()
      
    }
    else if(this.OragnizationType=='MSME'){
      this.formDetailsOrganization()
      this.fOrg['organizationType'].patchValue('MSME')
      this.fOrg['organizationCategory'].addValidators(Validators.required)
      this.fOrg['organizationName'].addValidators(Validators.required)
      this.fOrg['organizationName'].addValidators(Validators.pattern(/^[^\s].*/))
      this.fOrg['udyamYesOrNo'].addValidators(Validators.required)
      this.fOrg['udyamregistrationNo'].setValidators(null)
      this.fOrg['dateOfRegistration'].setValidators(null)
     
      this.fOrg['organizationCategory'].patchValue('Micro')
      this.fOrg['udyamYesOrNo'].patchValue('No')

      this.fOrg['organizationCategory'].updateValueAndValidity()
      this.fOrg['organizationName'].updateValueAndValidity()
      this.fOrg['udyamYesOrNo'].updateValueAndValidity()
      this.fOrg['udyamregistrationNo'].updateValueAndValidity()
      this.fOrg['dateOfRegistration'].updateValueAndValidity()
     
    }
    else if(this.OragnizationType=='Department'){
      this.formDetailsOrganization()
      this.fOrg['organizationType'].patchValue('Department')
      this.fOrg['organizationName'].addValidators(Validators.required)
      this.fOrg['organizationName'].addValidators(Validators.pattern(/^[^\s].*/))
      this.fOrg['sectorIds'].setValidators(null)
      this.fOrg['ownerContactNo'].setValidators(null)
      this.fOrg['sectorIds'].updateValueAndValidity()
      this.fOrg['organizationName'].updateValueAndValidity()
      this.fOrg['ownerContactNo'].updateValueAndValidity()
    
     
    }
  }

  chnageUdyam(event:any){
    console.log(event)
    if(event=='Yes'){
      this.fOrg['udyamregistrationNo'].addValidators(Validators.required)
      this.fOrg['dateOfRegistration'].addValidators(Validators.required)
      this.fOrg['udyamregistrationNo'].patchValue('')
    this.fOrg['dateOfRegistration'].patchValue('')
      this.fOrg['udyamregistrationNo'].updateValueAndValidity()
      this.fOrg['dateOfRegistration'].updateValueAndValidity()
    }
    else{
      this.fOrg['udyamregistrationNo'].setValidators(null)
      this.fOrg['dateOfRegistration'].setValidators(null)
      this.fOrg['udyamregistrationNo'].patchValue('')
    this.fOrg['dateOfRegistration'].patchValue('')
      this.fOrg['udyamregistrationNo'].updateValueAndValidity()
      this.fOrg['dateOfRegistration'].updateValueAndValidity()
    }

  }

  SubmitformOrganization() {
    console.log(this.OrganisationForm.value)
    if (this.OragnizationType == 'SHG') {
      this.OrganisationForm.value['organizationName'] = this.OrganisationForm.value['nameOfTheSHG']
    }
    if( this.OrganisationForm.value['sectorIds'].length){
      this.OrganisationForm.value['sectorIds']=this.OrganisationForm.value['sectorIds'].map((item:any)=>{
        return Number(item.sectorId)
      })
    }
    else{
      this.OrganisationForm.value['sectorIds']=[]
    }
    this._commonService.add(APIS.participantdata.saveOrgnization, { ...this.OrganisationForm.value }).subscribe({
      next: (data: any) => {
        // this.advanceSearch(this.getSelDataRange);
        // modal.close()
        this.toastrService.success('Organization Data Added Successfully', "Organization Data Success!");
      },
      error: (err) => {
        this.toastrService.error(err.message, "Organization Data Error!");
        new Error(err);
      },
    });
    this.OrganisationForm.reset();
    // this.getData()
    this.loadOrganizations()

  }
  // district list()
  MandalList:any
  GetMandalByDistrict(event: any) {
    this.MandalList=[]
    this._commonService.getDataByUrl(APIS.masterList.getMandal + event).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;
      },
      error: (err: any) => {
        this.MandalList = [];
      }
    })

  }
  MandalListSHG:any
  GetMandalByDistrictSHG(event: any) {
    this.MandalListSHG=[]
    this._commonService.getDataByUrl(APIS.masterList.getMandal + event).subscribe({
      next: (data: any) => {
        this.MandalListSHG = data.data;
      },
      error: (err: any) => {
        this.MandalListSHG = [];
      }
    })

  }
  OragnizationList(event: any) {
    if (event.target.value === 'Existing Oragnization') {
      this.loadOrganizations();
    }
  }
  
  // getOrganizationData() {
  //   this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyId).subscribe({
  //     next: (res: any) => {
  //       this.OrganizationData = res?.data
  //       this.assignFluidData1Org()
  //       // this.submitedData=res?.data?.data
  //       // this.advanceSearch(this.getSelDataRange);
  //       // modal.close()

  //     },
  //     error: (err) => {
  //       this.toastrService.error(err.message, "Organization Data Error!");
  //       new Error(err);
  //     },
  //   });
  // }
   OrganizationData: any = []
  filteredOrganizationData: any = []
  searchValue: boolean = true;
  loadOrganizations(Orgvalue?:any) {
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?page=0&size=500').subscribe({
      next: (res: any) => {
        this.OrganizationData = res?.data;
        this.filteredOrganizationData = this.OrganizationData.slice();
        
      },
      error: (err) => {
        this.toastrService.error(err.message, "Organization Data Error!");
      }
    });
  }

 onSearchChange(event: any) {
    const filterValue = event?.toLowerCase();
    if (filterValue.length >= 2) {
      this.searchValue = false;
      this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination + '?search=' + event + '&page=0&size=500')
        .subscribe({
          next: (res: any) => {
            this.OrganizationData = res?.data;
            this.filteredOrganizationData = this.OrganizationData.slice();
          },
          error: (error: any) => {
            this.filteredOrganizationData = [];
          }
        });
    } else {
      this.searchValue = true;
      this.filteredOrganizationData = this.OrganizationData.slice();
    }
  }
  // get program details 
  programData:any={}
  getProgramDetailsById(ProgrmId:any){
    this.programData={}
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, ProgrmId).subscribe({
      next: (data: any) => {
        this.programData = data.data;
        
      },
      error: (err: any) => {
        this.toastrService.error(err.message, "Error fetching program details!");
      }
    });
  }
 
}
