import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { ModalService } from '@app/_services/modal.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';

declare var bootstrap: any;
@Component({
  selector: 'app-tgtpc4-nt-handholding',
  templateUrl: './tgtpc4-nt-handholding.component.html',
  styleUrls: ['./tgtpc4-nt-handholding.component.css']
})
export class Tgtpc4NtHandholdingComponent implements OnInit {
  

  handholdingForm!: FormGroup;
  handholdingData: any = [];
  isEditMode = false;
  currentRecordId: any = 0;
  organizationList: any[] = [];
  
  subActivityConfig: any = {
    
// --> need to add for raw materials
    98: { name: 'Handholding Support - Raw Material Sourcing Linkage', fields: ['organizationId', 'nameOfTheSector', 'nameOfTheDomesticSupplier','nameOfTheRawMaterial', 'adoptionDate',] ,headers:{'organizationId':'Name of the MSME','nameOfTheSector':'Name of the Sector','nameOfTheDomesticSupplier':'Name of the Domestic supplier connected','nameOfTheRawMaterial':'Name of the raw material linkage','adoptionDate':'Date of Linkage'}},
    99: { name: 'Handholding support - Design & Reverse Engineering support', fields: ['organizationId', 'importedComponents', 'designDeveloped', 'adoptionDate'],headers:{'organizationId':'Name of the MSME','importedComponents':'Imported components analysed for substitution','designDeveloped':'Domestic substitute design developled (Yes/No)','adoptionDate':'Date of adoption by the MSME'} },
    100: { name: 'Handholding Support - Product Testing, Certification & Quality Compliance', fields: ['organizationId', 'domesticProductsTested','testingLab', 'testName', 'qualityCertifications'],headers:{'organizationId':'Name of the MSME','domesticProductsTested':'Name of the Domestic substitute products / components tested','testingLab':'Name of the accredited testing lab facilitated','testName':'Name of the Test','qualityCertifications':'Name of the quality certifications obtained'} },
    101: { name: 'Handholding Support - Market Integration', fields: ['organizationId', 'domesticBuyer', 'adoptionDate','productCatalogue'],headers:{'organizationId':'Name of the MSME','domesticBuyer':'Name of the Domestic Buyer onboarded for substitute products','adoptionDate':'Date of procurement','productCatalogue':'Import substitution product catalogue'} },
    102: { name: 'Handholding Support - Manufacturing Setup', fields: ['organizationId', 'manufacturingLine', 'adoptionDate','productionStartDate'],headers:{'organizationId':'Name of the MSME','manufacturingLine':'Name of the manufacturing lin planned for substituion','adoptionDate':'Date of establishment','productionStartDate':'Date of commencement of domestic production of substitute products'} },

    103: { name: 'Handholding Support - Convergence with Govt Schemes', fields: ['organizationId', 'schemeName', 'investmentValue', 'schemeSubsidy', 'releaseDate'],headers:{'organizationId':'Name of the MSME','schemeName':'Name of the Scheme converged','investmentValue':'Value of Investment','schemeSubsidy':'Subsidy through scheme','releaseDate':'Date of release'} },
    104: { name: 'Handholding Support - Financial Support', fields: ['organizationId', 'dprSubmissionDate', 'sanctionDate', 'sanctionAmount', 'bankNbfc','adoptionDate'],headers:{'organizationId':'Name of the MSME','dprSubmissionDate':'Date of DPR submission','sanctionDate':'Date of sanction','sanctionAmount':'Sanctioned amount','bankNbfc':'Name of the Bank / NBFC supported finance','adoptionDate':'Grounding date'} },

    106: { name: 'Handholding support - Commercial Production of Prototyped Products', fields: [ 'nameOfTheSector', 'dprSubmissionDate', 'adoptionDate','productLaunchDate', 'launchedProducts'],headers:{'nameOfTheSector':'Name of the Sector','dprSubmissionDate':'Date of DPR submission','adoptionDate':'Date of grounding','productLaunchDate':'Date of import substitute products launched','launchedProducts':'Name of the import substitute products launched'} },
   108: { name: 'Handholding Support - Technology Transfer / Design Adoption etc.', fields: ['organizationId', 'technologyDesign', 'technicalInstitution', 'adoptionDate', 'iprName', 'iprRegistrationDate'] ,headers:{'organizationId':'Name of the MSME','technologyDesign':'Name of the technology design mapped','technicalInstitution':'Name of the technical instituion engaged','adoptionDate':'Date of adoption','iprName':'Name of the IPR adopted','iprRegistrationDate':'Date of IPR registered'} },
    };

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private modalService: ModalService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadOrganizations();
    this.loadHandholdingData();
  }
  @Input() activityId: any;
    @Input() subActivityId: any;
    @Output() handHoldingDataChange= new EventEmitter<number>();
  @ViewChild('handholdingModal') handholdingModal: any;
   ngOnChanges(): void {
    console.log('Activity ID changed:', this.activityId);
    console.log('Sub Activity ID changed:', this.subActivityId);
    
    if (this.activityId && this.subActivityId) {
      this.loadHandholdingData();
    }
  }
  
  initializeForm(): void {
    this.handholdingForm = this.fb.group({
      nonTrainingSubActivityId: [0],
      organizationId: [0, Validators.required],
      nameOfTheSector: [''],
      importedComponents: [''],
      designDeveloped: [false],
      adoptionDate: [''],
      domesticProductsTested: [''],
      testingLab: [''],
      testName: [''],
      nameOfTheDomesticSupplier: [''],
      nameOfTheRawMaterial: [''],
      qualityCertifications: [''],
      domesticBuyer: [''],
      productCatalogue: [''],
      manufacturingLine: [''],
      productionStartDate: [''],
      schemeName: [''],
      investmentValue: [0],
      schemeSubsidy: [0],
      releaseDate: [''],
      dprSubmissionDate: [''],
      sanctionDate: [''],
      sanctionAmount: [0],
      bankNbfc: [''],
      productLaunchDate: [''],
      launchedProducts: [''],
      technologyDesign: [''],
      technicalInstitution: [''],
      iprName: [''],
      iprRegistrationDate: ['']
    });
  }

  
  OrganizationData: any[] = []
    filteredOrganizationData: any = []
      loadOrganizations() {
        this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination+'?page=0&size=500').subscribe({
          next: (res: any) => {
            this.OrganizationData = res?.data
            this.filteredOrganizationData = this.OrganizationData.slice()     
          },
          error: (err) => {
            this.toastrService.error(err.message, "Organization Data Error!");
            new Error(err);
          },
        });
      }
       @ViewChild("searchDropdownInput")
  searchDropdownInput!: ElementRef<HTMLInputElement>;
  searchValue: boolean = true;
  onSearchChange(event: any) {
    console.log(event, "type event");
   
    const filterValue = event?.toLowerCase();
    if(filterValue.length >=2){
      this.searchValue = false;
    }
    else{
      this.searchValue = true;
    }
    if (filterValue && filterValue.length >=2) {
     
    this._commonService.getDataByUrl(APIS.participantdata.getOrgnizationDataOnlyPagination+'?search='+event+'&page=0&size=500')
      .subscribe({
        next: (res:any) => {
         this.filteredOrganizationData = this.OrganizationData.slice()
          this.OrganizationData = res?.data
            this.filteredOrganizationData = this.OrganizationData.slice()
          
        },
        error: (error:any) => {
          this.filteredOrganizationData = []
        }
      })
    } else {
      this.searchValue = true;
       this.filteredOrganizationData = this.OrganizationData.slice()
    }
  }
  loadHandholdingData(): void {
    this.handholdingData = [];
    this._commonService.getById(APIS.nontrainingtargets.tgtpc4.getHandholdingBySubActivity,this.subActivityId).subscribe({
      next: (res: any) => {
        if(res.data.length>0){
          this.handholdingData = res.data
        }
        
      },
      error: (err: any) => {
        console.error('Error loading handholding data', err);
      }
    });
  }

  openModal(type:any,record?: any): void {
    this.isEditMode = type === 'edit';
    
    if (this.isEditMode) {
      this.currentRecordId = record.id;
      const formattedRecord = {
        ...record,
        adoptionDate: this.convertToISOFormat(record.adoptionDate),
        productionStartDate: this.convertToISOFormat(record.productionStartDate),
        releaseDate: this.convertToISOFormat(record.releaseDate),
        dprSubmissionDate: this.convertToISOFormat(record.dprSubmissionDate),
        sanctionDate: this.convertToISOFormat(record.sanctionDate),
        productLaunchDate: this.convertToISOFormat(record.productLaunchDate),
        iprRegistrationDate: this.convertToISOFormat(record.iprRegistrationDate)
      };
      this.handholdingForm.patchValue(formattedRecord);

    } else {
      this.handholdingForm.reset();
      this.handholdingForm.patchValue({ nonTrainingSubActivityId: 0, organizationId: 0 });
    }

    this.modalService.openModal(this.handholdingModal, { 
      modalDialogClass: 'modal-lg',
      backdrop: 'static'
    });
  }
 convertToISOFormat(date: string): string {   
   if(date) {
     const [day, month, year] = date.split('-');
     return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
   }
   else{
     return '';
   }
  }
  closeModal(): void {
    this.modalService.closeModal(this.handholdingModal);
  }

  saveHandholding(): void {
    if (this.handholdingForm.invalid) {
      this.toastrService.error('Please fill all required fields');
      return;
    }
    console.log(this.currentRecordId)
    const formData = {...this.handholdingForm.value,nonTrainingSubActivityId:this.subActivityId}
    const apiCall = this.isEditMode
      ? this._commonService.updatedata(APIS.nontrainingtargets.tgtpc4.updateHandholding+this.currentRecordId, formData)
      : this._commonService.add(APIS.nontrainingtargets.tgtpc4.saveHandholding, formData);

    apiCall.subscribe({
      next: (res: any) => {
        this.toastrService.success(this.isEditMode ? 'Updated successfully' : 'Saved successfully');
        this.closeModal();
        this.loadHandholdingData();
      },
      error: (err: any) => {
        this.toastrService.error('Operation failed');
        console.error('Error saving handholding data', err);
      }
    });
  }

// Delete Report
deleteTgtpcReportsID:any
  deleteTgtpcReports(id: any): void {
    this.deleteTgtpcReportsID = id;
    const previewModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (previewModal) {
      const modalInstance = new bootstrap.Modal(previewModal);
      modalInstance.show();
    }
  }

  ConfirmDeleteTgtpcReports(id: any) {
 
    this._commonService.deleteId(APIS.nontrainingtargets.tgtpc4.deleteHandholding,id).subscribe({
        next: (res: any) => {
          this.toastrService.success('Deleted successfully');
          this.loadHandholdingData();
          this.deleteTgtpcReportsID = '';
           this.closeModalDeleteTgtpcReports();
        },
        error: (err: any) => {
          this.toastrService.error('Delete failed');
          console.error('Error deleting record', err);
          this.deleteTgtpcReportsID = '';
           this.closeModalDeleteTgtpcReports();
        }
      });
  }
   closeModalDeleteTgtpcReports(): void {
    const editSessionModal = document.getElementById('exampleModalDeleteTgtpcReports');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }
  getSubActivityName(): string {
    return this.subActivityConfig[this.subActivityId]?.name || 'Handholding Activity';
  }

  shouldShowField(fieldName: string): boolean {
    const config = this.subActivityConfig[this.subActivityId];
    if (!config || !config.fields) return true;
    return config.fields.includes(fieldName);
  }
  // ...existing code...

getFieldLabel(fieldName: string): string {
  const config = this.subActivityConfig[this.subActivityId];
  if (!config || !config.headers) return fieldName;
  return config.headers[fieldName] || fieldName;
}

getHeaderLabel(fieldName: string): string {
  const config = this.subActivityConfig[this.subActivityId];
  if (!config || !config.headers) return fieldName;
  return config.headers[fieldName] || fieldName;
}

getVisibleFields(): string[] {
  const config = this.subActivityConfig[this.subActivityId];
  if (!config || !config.fields) return [];
  return config.fields;
}

// ...existing code...

  getOrganizationName(id: number): string {
    const org = this.organizationList.find(o => o.id === id);
    return org ? org.name : 'N/A';
  }
}