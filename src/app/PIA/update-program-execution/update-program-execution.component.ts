import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import { forkJoin } from 'rxjs';
import moment from "moment";
import { DomSanitizer } from '@angular/platform-browser';
declare var $: any;
declare var bootstrap: any;
@Component({
  selector: 'app-update-program-execution',
  templateUrl: './update-program-execution.component.html',
  styleUrls: ['./update-program-execution.component.css']
})
export class UpdateProgramExecutionComponent implements OnInit {

  imageUrlDownloadPath = `${API_BASE_URL}/program/file/download/`;
  imagePreviewUrl: any
  mediaCoverageForm!: FormGroup;
  mediaExecutionForm!: FormGroup;
  isEditMode = false;
  // Store files separately
  selectedFiles: { [key: string]: any } = {};
  agencyId: any
   Role :any='';
  constructor(
    private router: Router,
    private fb: FormBuilder,
    private _commonService: CommonServiceService,
    private toastrService: ToastrService,
    private sanitizer: DomSanitizer
  ) {
   
	    this.Role=JSON.parse(sessionStorage.getItem('user') || '{}').userRole;
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
  }

  ngOnInit(): void {
    this.getProgramsByAgency()
    this.getSessionResource()
    this.mediaCoverageForm = this.fb.group({
      date: ['', Validators.required],
      mediaCoverageType: ['', Validators.required],
      mediaCoverageUrl: ['', Validators.required],
      programId: [''],
      mediaCoverageId: [''],
      image1: [''],
      image2: [''],
      image3: [''],
    });
    this.mediaExecutionForm = this.fb.group({
      sessionDetails: ['', Validators.required],
      resourceId: ['', Validators.required],
      programId: [''],
      sessionStreamingUrl: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
      sessionDate: ['', Validators.required],
      programSessionId: [''],
      image1: [''],
      image2: [''],
      image3: [''],
      // image4: [''],
      // image5: [''],
    });

  }

  agencyProgramList: any;
  programId: any = ''
  agencyProgramListFiltered: any;
  getProgramsByAgency() {
    this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyStatus + '/' + this.agencyId + '?status=Program Execution'}`).subscribe({
      next: (res: any) => {
        this.agencyProgramList = res?.data
        this.agencyProgramListFiltered= this.agencyProgramList
      },
      error: (err) => {
        new Error(err);
      }
    })
  }

  dropdownProgramsList(event: any, type: any) {
    if (event.value) {
      this.programId = event.value
      this.getProgramDetailsById(this.programId);
    } else {
      this.programId = ''
      this.ProgramData = ''
    }
  }

  ProgramData: any
  getProgramDetailsById(programId: string) {
    this.ProgramData = ''
    this._commonService.getById(APIS.programCreation.getSingleProgramsList, programId).subscribe({
      next: (data: any) => {
        this.ProgramData = data.data;
      }, error: (err: any) => {
        new Error(err);
      }
    })
  }

  ngAfterViewInit() {
    // setTimeout(() => {
    //   new DataTable('#creation-table', {              
    //   // scrollX: true,
    //   // scrollCollapse: true,    
    //   // responsive: true,    
    //   // paging: true,
    //   // searching: true,
    //   // ordering: true,
    //   scrollY: "415px",     
    //   scrollX:        true,
    //   scrollCollapse: true,
    //   autoWidth:         true,  
    //   paging:         false,  
    //   info: false,   
    //   searching: false,  
    //   destroy: true, // Ensure reinitialization doesn't cause issues
    //   });
    // }, 500);
  }
  submitRedirect() {
    this.router.navigateByUrl('/veiw-program-creation');
  }

  fileErrors: any = {};
  onFileChange(event: any, field: string) {
    const allowedExtensions = ['jpg', 'jpeg', 'png'];
    const maxSize = 50 * 1024; // 50KB
    this.fileErrors = this.fileErrors || {}; // Initialize fileErrors object if not already
    if (event.target.files && event.target.files.length > 0) {

      const file = event.target.files[0];
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const fileSize = file.size;

      // Validate file type
      if (!allowedExtensions.includes(fileExtension)) {
        this.fileErrors[field] = `Invalid file type. Only ${allowedExtensions.join(', ')} are allowed.`;
        this.selectedFiles[field] = null;
        return;
      }

      // Validate file size
      if (fileSize > maxSize) {
        this.fileErrors[field] = `File size exceeds the maximum limit of 50KB.`;
        this.selectedFiles[field] = null;
        return;
      }

      // If valid, clear errors and set the file
      this.fileErrors[field] = '';
      //this.selectedFiles[field] = file;

      this.selectedFiles[field] = event.target.files[0];
    }
  }

  hasFileErrors(): boolean {
    return Object.values(this.fileErrors).some(error => error !== '');
  }

  loading = false;
  onSubmit() {
    this.loading = true;
    if (this.mediaCoverageForm.invalid) return;
    this.mediaCoverageForm.value.programId = Number(this.programId)
    let objectnew: any = [this.mediaCoverageForm.value]
    const formData = new FormData();
    const API_ADD_URL = APIS.programExecutions.saveMediaCoverage;
    const apiCalls = objectnew.map((element: any, index: any) => {
      element['date'] = moment(element['date']).format('DD-MM-YYYY');
      formData.set("data", JSON.stringify(element));
      return this._commonService.uploadImageResource(API_ADD_URL, formData);
    })

    // Append images
    if (this.selectedFiles['image1']) {
      formData.append('image1', this.selectedFiles['image1']);
    }
    if (this.selectedFiles['image2']) {
      formData.append('image2', this.selectedFiles['image2']);
    }
    if (this.selectedFiles['image3']) {
      formData.append('image3', this.selectedFiles['image3']);
    }

    if (this.isEditMode) {
      console.log('Edit FormData:', formData);
      // Call your update API with formData
      forkJoin(apiCalls).subscribe({
        next: (results) => {
          this.loading = false;
          this.closeModalMedia();
          this.toastrService.success('Media Coverage Updated Successfully', "Media Coverage Success!");
          this.mediaCoverageForm.reset();
          this.selectedFiles = {}; // Reset selected files
          this.getProgramDetailsById(this.programId);
        },
        error: (err) => {
          this.loading = false;
          this.closeModalMedia();
          this.mediaCoverageForm.reset();
          this.selectedFiles = {}; // Reset selected files
          this.toastrService.error(err, "Media Coverage Error!");
        },
      });
    } else {
      console.log('Add FormData:', formData);
      // Call your create API with formData
      forkJoin(apiCalls).subscribe({
        next: (results) => {
          this.loading = false;
          this.closeModalMedia();
          this.toastrService.success('Media Coverage Created Successfully', "Media Coverage Success!");
          this.mediaCoverageForm.reset();
          this.selectedFiles = {}; // Reset selected files
          this.getProgramDetailsById(this.programId);
        },
        error: (err) => {
          this.loading = false;
          this.closeModalMedia();
          this.mediaCoverageForm.reset();
          this.selectedFiles = {}; // Reset selected files
          this.toastrService.error(err, "Session Creation Error!");
        },
      });
    }
  }

  closeModalMedia(): void {
    const editSessionModal = document.getElementById('sessionFormMediaModal');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }

  closeModal(): void {

    const editSessionModal = document.getElementById('sessionFormExectuionModal');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }

  }

  showSessionEditModal(session?: any) {
    this.selectedFiles = {}
    this.fileErrors = {}
    $('#image1').val('')
    $('#image2').val('')
    $('#image3').val('')
    if (!this.ProgramData?.programId) {
      this.toastrService.error("Please Select atleast one Program to add Media Coverage", "Program Error");
      return;
    }

    if (!session) {
      this.isEditMode = false;
      const editSessionModal = document.getElementById('sessionFormMediaModal');
      if (editSessionModal) {
        const modalInstance = new bootstrap.Modal(editSessionModal);
        modalInstance.show();
      }
      this.mediaCoverageForm.reset();
      return;
    }

    this.isEditMode = true;
    this.mediaCoverageForm.patchValue({
      date: this.convertToISOFormat(session?.date),
      mediaCoverageType: session?.mediaCoverageType,
      mediaCoverageUrl: session?.mediaCoverageUrl,
      programId: this.ProgramData?.programId,
      mediaCoverageId: session?.mediaCoverageId,
      image1: session?.image1,
      image2: session?.image2,
      image3: session?.image3,
    });
    console.log(this.mediaCoverageForm.value, 'sessionFormValue', session)
    const editSessionModal = document.getElementById('sessionFormMediaModal');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }

  }

  getSessionResourceData: any = [];
  resourcekeyidData: any = {}
  getSessionResource() {
    this.resourcekeyidData = {}
    this.getSessionResourceData = []
    this._commonService
      .getById(APIS.programCreation.getAllResource+'/', this.agencyId)
      .subscribe({
        next: (data: any) => {
          this.getSessionResourceData = data.data;
          this.getSessionResourceData.map((item: any) => {
            this.resourcekeyidData[item?.resourceId] = item.name
          })

        },
        error: (err: any) => {
          new Error(err);
        },
      });
  }


  editFlag: boolean = false;
  showExecutionEditModal(session?: any) {
    $('#image1').val('')
    $('#image2').val('')
    $('#image3').val('')
    // $('#image4').val('')
    // $('#image5').val('')
    this.selectedFiles = {}
    this.fileErrors = {}
    if (!this.ProgramData?.programId) {
      this.toastrService.error("Please Select atleast one Program to add Session Details", "Program Error");
      return;
    }

    if (!session) {

      const editSessionModal = document.getElementById('sessionFormExectuionModal');
      if (editSessionModal) {
        const modalInstance = new bootstrap.Modal(editSessionModal);
        modalInstance.show();
      }
      this.editFlag = false;
      return;
    }

    this.editFlag = true;
    this.mediaExecutionForm.patchValue({
      programId: this.ProgramData?.programId,
      resourceId: session?.resourceId,
      sessionDetails: session?.sessionDetails,
      sessionStreamingUrl: session?.sessionStreamingUrl,
      sessionDate: this.convertToISOFormat(session.sessionDate),
      startTime: this.convertTo24HourFormat(session.startTime),
      endTime: this.convertTo24HourFormat(session.endTime),
      programSessionId: session?.sessionId,
      image1: session?.image1,
      image2: session?.image2,
      image3: session?.image3,
      // image4: session?.image4,
      // image5: session?.image5,
    });
    console.log(this.mediaExecutionForm.value, 'sessionFormValue', session)
    const editSessionModal = document.getElementById('sessionFormExectuionModal');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }

  convertToISOFormat(date: string): string {
    const [day, month, year] = date.split('-');
    return `${year}-${month}-${day}`; // Convert to yyyy-MM-dd format
  }

  convertTo24HourFormat(time: string): string {
    const [timePart, modifier] = time.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);

    if (modifier === 'PM' && hours !== 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  onSubmitExecution() {
    this.loading = true;
    if (this.mediaExecutionForm.invalid) return;
    this.mediaExecutionForm.value.programId = Number(this.programId)
    let objectnew: any = [this.mediaExecutionForm.value]
    console.log('objectnew', objectnew) 
    const formData = new FormData();
    const API_ADD_URL = APIS.programExecutions.saveProgramExecution;
    const apiCalls = objectnew.map((element: any, index: any) => {
      console.log('element', element)
      element['sessionDate'] =  element['sessionDate']? moment(element['sessionDate']).format('DD-MM-YYYY'):moment(element['Date']).format('DD-MM-YYYY');
      formData.set("data", JSON.stringify(element));
      return this._commonService.uploadImageResource(API_ADD_URL, formData);
    })

    // Append images
    if (this.selectedFiles['image1']) {
      formData.append('image1', this.selectedFiles['image1']);
    }
    if (this.selectedFiles['image2']) {
      formData.append('image2', this.selectedFiles['image2']);
    }
    if (this.selectedFiles['image3']) {
      formData.append('image3', this.selectedFiles['image3']);
    }
    // if (this.selectedFiles['image4']) {
    //   formData.append('image4', this.selectedFiles['image4']);
    // }
    if (this.selectedFiles['image5']) {
      formData.append('image5', this.selectedFiles['image5']);
    }

    forkJoin(apiCalls).subscribe({
      next: (results) => {
        this.loading = false;
        this.closeModal();
        this.toastrService.success('Program Execution Updated Successfully', "Program Execution Success!");
        this.mediaExecutionForm.reset();
        this.selectedFiles = {}; // Reset selected files
        this.getProgramDetailsById(this.programId);
      },
      error: (err) => {
        this.loading = false;
        this.closeModal();
        this.mediaExecutionForm.reset();
        this.selectedFiles = {}; // Reset selected files
        this.toastrService.error(err, "Program Execution Error!");
      },
    });
  }

  showImagePreview(url: any, value: string) {
    this.imagePreviewUrl = null; // Reset the image preview URL
    this.imagePreviewUrl = url + value;

    const editSessionModal = document.getElementById('imagePreview');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }

  validateDate(type: any) {
    if (type == 'MIN' && this.ProgramData?.startDate) {
      const startDate = this.convertToISOFormat(this.ProgramData?.startDate);
      return startDate;
    } else if (type == 'MAX' && this.ProgramData?.endDate) {
      const endDate = this.convertToISOFormat(this.ProgramData?.endDate);
      return endDate;
    }
    // else if(type == 'MIN' && !this.ProgramData?.startDate){
    //   let startDate = moment().startOf('Q').format('DD-MM-YYYY');
    //   return this.convertToISOFormat(startDate);
    // }else if(type == 'MAX' && !this.ProgramData?.endDate){
    //   let endDate = moment().endOf('Q').format('DD-MM-YYYY');
    //   return this.convertToISOFormat(endDate);
    // }    
    return ''
  }

  sessionSubmissionFinal() {
    let data = {}
    this._commonService.add(`${APIS.programCreation.updateSessionByStatus}${this.programId}?status=Program Execution Updated`, data).subscribe({
      next: (data: any) => {
        console.log('Response from API:', data);
        this.toastrService.success('Program Execution Details Submitted Successfully', "");
        this.closeConfirmSession();
        this.ProgramData = ''
        this.programId = ''
        this.getProgramsByAgency()
      },
      error: (err: any) => {
        this.closeConfirmSession();
        this.toastrService.error("Something unexpected happened!!");
        new Error(err);
      },
    });
  }

  closeConfirmSession() {
    const editSessionModal = document.getElementById('exampleModalDeleteConfirm');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }

  deleteFileData: any = {}
  deleteFile(fileId: number, fileIndex: number): void {
    this.deleteFileData = {
      fileId: fileId,
      fileIndex: fileIndex
    }
    const editSessionModal = document.getElementById('exampleModalDelete');
    if (editSessionModal) {
      const modalInstance = new bootstrap.Modal(editSessionModal);
      modalInstance.show();
    }
  }

  confirmDeleteFile(deleteFileData:any){    
    // Call your delete API here
    let url = `${deleteFileData?.fileId}`    
    this._commonService.deleteId(APIS.programCreation.sessionFilesDelete, url).subscribe({
      next: (data: any) => {        
        console.log('Response from API:', data);
        if (data?.message.includes('File deleted successfully')) {
          this.toastrService.success('File deleted successfully', "");          
        } else {        
          this.toastrService.error("Something unexpected happened!!");          
        }
        this.closeModalDelete();        
        this.getProgramDetailsById(this.programId);
      },
      error: (err: any) => {        
        this.closeModalDelete();        
        this.toastrService.error("Something unexpected happened!!");
        new Error(err);
      },
    });
  }

  closeModalDelete(): void {
    const editSessionModal = document.getElementById('exampleModalDelete');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }
  }
}
