import { Component, OnInit, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { event } from 'jquery';
declare var bootstrap: any;
declare var $: any;
import { LoaderService } from '@app/common_components/loader-service.service';

@Component({
  selector: 'app-reshedule-programs',
  templateUrl: './reshedule-programs.component.html',
  styleUrls: ['./reshedule-programs.component.css']
})
export class ResheduleProgramsComponent implements OnInit {
 localStorageData: any;
  sessionDetailsList: any;
  tableList: any;
  dataTable: any;
  agencyList: any = [];
  loginsessionDetails: any;
  agencyId: any;
  constructor(
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,
    private loader:LoaderService
  ) { 
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
    this.agencyId = this.loginsessionDetails.agencyId;
  }

  ngOnInit(): void {
    // console.log(this.loginsessionDetails);
    if(this.loginsessionDetails.userRole == 'ADMIN') {
      this.getAgenciesList()
    }
    else{
      this.getProgramDetails();
      // this.getData()
      this.selectedAgencyId=this.agencyId?this.agencyId:-1
    }
    
  }

  ngAfterViewInit() {
    this.initializeDataTable(this.agencyId?this.agencyId:this.selectedAgencyId);
  }


     StatusData:any=''
  getProgramsByStatus(status: string) {
    if(status==this.StatusData){
      this.StatusData=''
    }
    else{
       this.StatusData= status;
    }
      this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails + this.selectedAgencyId).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data;
          this.reinitializeDataTable();
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      });
  }
  GetProgramsByAgency(event:any){
    this.agencyByAdmin=event;
    this.selectedAgencyId = event;
    // this.getData()
    this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails+event).subscribe({
      next: (dataList: any) => {
        this.tableList = dataList.data;
         
        dataList.data.map((item: any) => {
          if(item?.district){
            item['district'] = item?.district
          }
          else{
            item['district'] = ''
          }
        })
       
        this.reinitializeDataTable();
      },
      error: (error: any) => {
        this.toastrService.error(error.error.message);
      }
    });
  }

  getProgramDetails(): any {
    this.tableList = '';
    this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByAgencyDetails+this.loginsessionDetails.agencyId).subscribe({
      next: (dataList: any) => {
        this.tableList = dataList.data;
        dataList.data.map((item: any) => {
          if(item?.district){
            item['district'] = item?.district
          }
          else{
            item['district'] = ''
          }
        })
        this.reinitializeDataTable();
      },
      error: (error: any) => {
        this.toastrService.error(error.error.message);
      }
    });
  }

  sessionDetails(dataList: any): any {
    // console.log(dataList)
    this.sessionDetailsList = dataList.programSessionList;
  }

  editProgram(dataList: any): any {
    this.router.navigateByUrl('/program-creation-edit/' + dataList.programId);
  }

  editSession(dataList: any): any {
    this.router.navigateByUrl('/program-sessions-edit/' + dataList.programId);
  }
//  <button type="button" class="btn btn-default btn-sm text-danger delete-btn" data-id="${row.id}" title="Delete"><span class="bi bi-trash"></span></button>
  initializeDataTable(agency:any) { 
    const self = this;
    this.dataTable = new DataTable('#view-table-program', {
      scrollY: "505px",
      scrollX: true,
      scrollCollapse: true,
      paging: true,
      serverSide: true, // Enable server-side processing
      pageLength: 10, // Default page size
      lengthMenu: [5, 10, 25, 50], // Available page sizes
      autoWidth: true,
      info: false,
      searching: false,
      destroy: true,
    //   ajax: function (data:any, callback, settings) {
    //     // Extract pagination parameters
    //     let page = data.start / data.length;
    //     let size = data.length;
       
    //     // Fetch data from API
    //     fetch(APIS.programCreation.getProgramsListByAgencyDetails+agency+`?page=${page}&size=${size}`)
    //         .then(res => res.json())
    //         .then(json => {
    //             callback({
    //                 draw: data.draw,
    //                 recordsTotal: json.totalElements,
    //                 recordsFiltered: json.totalElements,
    //                 data: json.data
    //             });
    //         });
    // },
    ajax: (data: any, callback: any, settings: any) => {
      // Extract pagination and sorting parameters
      const page = data.start / data.length;
      const size = data.length;
      const sortColumn = data.order[0]?.column;
      const sortDirection = data.order[0]?.dir;
      const sortField = data.columns[sortColumn]?.data;
      
      // Prepare parameters for API call
      let statusDataurl=`&status=${this.StatusData}`
      let params = `?page=${page}&size=${size}`;
      params=this.StatusData?`&page=${page}&size=${size}`:`?page=${page}&size=${size}`
      if(sortField=='programLocationName' || sortField=='subActivityName' || sortField=='activityName'){
        params=this.StatusData?`&page=${page}&size=${size}`:`?page=${page}&size=${size}`
        // params = `?page=${page}&size=${size}`
        
      }
      else{
        if (sortField && sortDirection) {
          params += `&sort=${sortField},${sortDirection}`;
        }
      }
     
      
      // Add search filter if any
      if (data.search.value) {
        params += `&search=${encodeURIComponent(data.search.value)}`;
      }
       if(this.StatusData){
        
        statusDataurl = `?status=${this.StatusData}`;

      }
      if(this.StatusData){
        this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyByStatusDetails}${agency?agency:this.selectedAgencyId}${statusDataurl}${params}`)
        .pipe()
        .subscribe({
          next: (res: any) => {
            callback({
              draw: data.draw,
              recordsTotal: res.totalElements,
              recordsFiltered: res.totalElements,
              data: res.data
             
            });
            // console.log(data)
          },
          error: (err) => {
            // this.toastrService.error(err.message, "Programs Data Error!");
            console.error(err);
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
      }
      else{
        this.loader.show();
         this._commonService.getDataByUrl(`${APIS.resheduleProgram.getResheduleData}${agency}${params}`)
        .pipe()
        .subscribe({
          next: (res: any) => {
            this.loader.hide();
            callback({
              draw: data.draw,
              recordsTotal: res.totalElements,
              recordsFiltered: res.totalElements,
              data: res.data
            });
          },
          error: (err) => {
            this.loader.hide();

            // this.toastrService.error(err.message, "Programs Data Error!");
            console.error(err);
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
      }
     
    },
    columns: [
      { 
          title: 'S.No',
          orderable: false ,
          render: function(data, type, row, meta:any) {
            // console.log(data,meta,type, row)
              return meta.settings?._iDisplayStart+meta.row  + 1;
          },
          className: 'dt-center'
      },
   
      { 
        title: 'Actions',
        data: null,
  render: function(data:any, type:any, row:any, meta:any) {
    const today = new Date();
    const fiveDaysAgo = new Date(today);
    fiveDaysAgo.setDate(today.getDate() - 6);

    function parseDateOnly(dateStr: string): Date | null {
      if (!dateStr) return null;
      const [day, month, year] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // dd-MM-yyyy → Date
    }

    const startDate = parseDateOnly(row.startDate);
    const isEditDisabled = startDate && (startDate > fiveDaysAgo && startDate <= today);
    //  const isEditDisabled = startDate && (startDate < today || startDate > fiveDaysAgo);

    console.log(row.startDate, startDate, isEditDisabled, 'iseditdisable');

    return `
     
      <button type="button" class="btn btn-default btn-sm text-lime-green reschedule-btn" 
        title="Reshedule Data" data-bs-toggle="modal" data-bs-target="#viewSheduleModal" 
        data-id="${row.id}">
        <span class="bi bi-arrow-repeat"></span>
      </button>
    `;
  },
  //  <button type="button" class="btn btn-default btn-sm text-lime-green edit-btn" 
  //       title="Sessions" data-bs-toggle="modal" data-bs-target="#viewModal" 
  //       data-id="${row.id}">
  //       <span class="bi bi-eye"></span>
  //     </button>
  //     <button type="button" 
  //       class="btn btn-default btn-sm text-danger editable-btn"
  //       data-id="${row.id}" title="Edit" 
  //       ${isEditDisabled ? 'disabled' : ''}>
  //       <span class="bi bi-pencil"></span>
  //     </button>
        orderable: false,
        className: 'text-center'
    },
        { 
          data: 'startDate',
          title: 'Start Date',
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      { 
        data: 'endDate',
        title: 'End Date',
        render: function(data, type, row) {
          return data ? data : '';
        }
    },
      { 
          data: 'startTime',
          title: 'In Time',
          className: 'text-center',
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      { 
          data: 'endTime',
          title: 'Out Time',
          className: 'text-center',
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      { 
        data: 'programLocationName',
        title: 'Program Location',
        orderable: false ,
        render: function(data, type, row) {
          return data ? data : '';
        }
    },
    { 
      title: 'District',
      orderable: false ,
      render: function(data, type, row, meta:any) {
        // console.log(data,meta,type, row)
          return row?.district ? row?.district : '-';   
      },
      className: 'dt-center'
  },
    { 
      data: 'agencyName',
      title: 'Agency Name',
      orderable: false,
      render: function(data, type, row) {
        return data ? data : '';
      }
    },
    { 
      data: 'programTitle',
      title: 'Title Of Program',
      render: function(data, type, row) {
        return data ? data : '';
      }
    },
    { 
      data: 'status',
      title: 'Status',
      render: function(data, type, row) {
        return data ? data : '';
      }
    },
     { 
          data: 'activityName',
          title: 'Type Of Activity',
          orderable: false ,
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      { 
          data: 'subActivityName',
          title: 'Sub Activity',
          orderable: false ,
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      
     
      { 
          data: 'spocName',
          title: 'SPOC Name',
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
      { 
          data: 'spocContactNo',
          title: 'SPOC Contact No.',
          render: function(data, type, row) {
            return data ? data : '';
          }
      },
     
      // { 
      //   data: null,
      //   title: 'Edit / Delete',
      //   render: (data: any, type: any, row: any, meta: any) => {
      //     // Use meta.row for the current displayed row index
      //     return `
      //       <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" data-index="${meta.row}">
      //         <span class="bi bi-eye"></span>
      //       </button>
      //       // <button type="button" class="btn btn-default text-danger btn-sm delete-btn" data-index="${meta.row}">
      //       //   <span class="bi bi-trash"></span>
      //       // </button>
      //     `;
      //   },
      //   className: 'text-center',
      //   orderable: false
      // }
     
  ],
  initComplete: function() {
    // Use proper event handling with arrow function
    $('#view-table-program').on('click', '.edit-btn', (event:any) => {
     
      const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
      const button = $(this);
      if (rowData.overdue) {
        button.addClass('disabled');
      } else {
        button.addClass('disabled-row');
      }
      self.sessionDetails(rowData); // Call your method with proper data
    });
   $('#view-table-program').on('click', '.editable-btn', (event:any) => {
  if ($(event.currentTarget).prop('disabled')) {
    return; // don’t execute editProgram if disabled
  }
  const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
  self.editProgram(rowData);
});

   $('#view-table-program').on('click', '.overDue-btn', (event:any) => {
      const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
      self.OverDue(rowData);
    });
    $('#view-table-program').on('click', '.reschedule-btn', function(event: any) {
      const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
      self.openRescheduleModal(rowData);
    });
    // $('#view-table-program').on('click', '.delete-btn', (event:any) => {
    //   const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
    //   self.deleteExpenditure(rowData);
    // });
  }
    });
  }
  
//  $('#view-table-program').off('click', '.delete-btn').on('click', '.delete-btn', (event: any) => {
//   const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
//   self.deleteExpenditure(rowData);
// });
  reinitializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      if( this.loginsessionDetails?.userRole == 'ADMIN'){
        this.initializeDataTable(this.agencyId?this.agencyId:this.selectedAgencyId);
      }
      else{
        this.initializeDataTable(this.agencyId?this.agencyId:this.selectedAgencyId)
      }
     
    }, 0);
  }
  agencyByAdmin:any
  selectedAgencyId:any=-1
  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.selectedAgencyId =-1
      this.getData()
      // this.GetProgramsByAgency(-1);
    }, (error) => {
      this.toastrService.error(error.error.message);
    });
  }

  previewData:any;    
  async showPreviewPopup(dataList: any) {
    this.previewData = ''
    let url = `${API_BASE_URL}/program/file/download/${dataList.programSessionFileId}`
    this.previewData = url
  }

  getFileIcon(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return 'fas fa-file-pdf';
      case 'doc':
      case 'docx': return 'fas fa-file-word';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      case 'ppt':
      case 'pptx': return 'fas fa-file-powerpoint';
      default: return 'fas fa-file';
    }
  }
selectedRescheduleData: any = [];
  openRescheduleModal(row: any) {
  // Store the selected row/session data if needed
  this.selectedRescheduleData = [];
  // Show the modal using Bootstrap JS
  // const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();

  this.loader.show();

  this._commonService.getById(APIS.programCreation.resheduleData, row.programId).subscribe({
    next: (res: any) => {
      this.selectedRescheduleData = res?.data;
      this.loader.hide();
  //      const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();
      // console.log(this.selectedRescheduleData, 'selectedRescheduleData');
    },
    error: (err) => {
  //      const modal = new bootstrap.Modal(document.getElementById('viewSheduleModal'));
  // modal.show();
      this.loader.hide();
      this.toastrService.error('Data Not Available', "Session Data Error!");
      new Error(err);
    },
  });

  




}
  
  getIconColor(filePath: string): string {
    const ext = filePath.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '#e74c3c';
      case 'doc':
      case 'docx': return '#3498db';
      case 'xls':
      case 'xlsx': return '#2ecc71';
      case 'ppt':
      case 'pptx': return '#e67e22';
      default: return '#7f8c8d';
    }
  }
  
  getFileName(filePath: string): string {
    return filePath.split('/').pop() || 'Download';
  }
  
  collapseStates: { [key: number]: boolean } = {};

  toggleIcon(index: number): void {
    this.collapseStates[index] = !this.collapseStates[index];
  }
  PrigramSummaryData:any={}
  getData() {
    this.PrigramSummaryData ={}
    this._commonService.getById(APIS.programCreation.programSummary, this.agencyId?this.agencyId:this.selectedAgencyId).subscribe({
      next: (res: any) => {          
        // this.PrigramSummaryData = res?.data   
      // console.log( this.PrigramSummaryData)
      this.PrigramSummaryData = res?.data
      },
      error: (err) => {
        // this.toastrService.error('Data Not Available', "Summary Data Error!");
        new Error(err);
      },
    });
    // console.log(this.ParticipantAttentance)
  }

// OverDue
overDueId:any
OverDue(item: any) {
  this.overDueId=item?.programId
  document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
   const myModal = new bootstrap.Modal(document.getElementById('exampleModalOverDueProgram'));
    myModal.show();
}

closeModalOverDue(): void {

  const editSessionModal = document.getElementById('exampleModalOverDueProgram');
if (editSessionModal) {
  const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
  modalInstance.hide();
}

  // const myModal = bootstrap.Modal.getInstance(document.getElementById('exampleModalDelete'));
  // myModal.hide();
 } 
 ConfirmOverDue(id:any){
  this._commonService.updatedata(APIS.programCreation.updateOverDue+id+'/update-overdue',{}).subscribe({
    next: (data: any) => {
      if(data?.status==400){
        // this.toastrService.error(data?.message, "Program Data Error!");
        this.closeModalOverDue();
        this.overDueId =''
      }
      else{
        this.closeModalOverDue();
       this.getProgramDetails()
       this.reinitializeDataTable();
       
      this.overDueId =''
      this.toastrService.success( 'OverDue Succesfully Updated', "Program Data Success!");
      }
      
    },
    error: (err) => {
      this.closeModalOverDue();
      this.overDueId ={}
      this.toastrService.error(err.message, "Program Data Error!");
      new Error(err);
    },
  });
 }

     // delete Expenditure
     deleteProgramId:any ={}
     deleteExpenditure(item: any) {
      
       if(item?.status=='Program Scheduled' || item.status=='Sessions Created'){
        this.deleteProgramId = item?.programId
         document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        const myModal = new bootstrap.Modal(document.getElementById('exampleModalDeleteProgram'));
         myModal.show();
       }
      else{
        // console.log(item,'warming')
        this.toastrService.warning('Selected Program has Participants Added hence can not be deleted!', "Delete not Allowed!");
        return;
      }
     
   }

     ConfirmdeleteExpenditure(item:any){
       this._commonService
       .deleteId(APIS.programCreation.deleteProgram,item).subscribe({
         next: (data: any) => {
           if(data?.status==400){
             this.toastrService.error(data?.message, "Program Data Error!");
             this.closeModalDelete();
             this.deleteProgramId =''
           }
           else{
            this.getProgramDetails()
            this.reinitializeDataTable();
             this.closeModalDelete();
             this.deleteProgramId =''
           this.toastrService.success( 'Program Deleted Successfully', "Program Data Success!");
           }
           
         },
         error: (err) => {
           this.closeModalDelete();
           this.deleteProgramId ={}
           this.toastrService.error(err.message, "Program Data Error!");
           new Error(err);
         },
       });
 
     }
     
     closeModalDelete(): void {

      const editSessionModal = document.getElementById('exampleModalDeleteProgram');
    if (editSessionModal) {
      const modalInstance = bootstrap.Modal.getInstance(editSessionModal);
      modalInstance.hide();
    }

      // const myModal = bootstrap.Modal.getInstance(document.getElementById('exampleModalDelete'));
      // myModal.hide();
     } 
     @ViewChild('fileInput') fileInput!: ElementRef;
    openFileUploadModal() {
      const modal1 = new bootstrap.Modal(document.getElementById('addDocumentModel'));
      modal1.show();
      this.selectedfiles=[]
      this.fileInput.nativeElement.value = ''
    }
    selectUploadedFiles: File = null!
    multipleFiles: any;
    fileName: any;
    fileSize: any;
    fileType: any;
    fileErrorMsg: any
    selectedfiles:any=[]
    file: any;
    onFilesSelected(event: any) {
      this.fileErrorMsg = '';
      this.multipleFiles = []
      this.selectedfiles = event.target.files;
      this.selectUploadedFiles = event.target.files[0];
      let formData = new FormData();
      let totalSize = 0;
      this.multipleFiles = [];
  
      for (var i = 0; i < this.selectedfiles.length; i++) {
        this.fileName = this.selectedfiles[i].name;
        this.fileSize = this.selectedfiles[i].size;
        this.fileType = this.selectedfiles[i].type;
        totalSize += this.fileSize;
  
        if (totalSize > 25 * 1024 * 1024) { // 25MB in bytes
          this.fileErrorMsg = 'Total file size exceeds 25MB';
          //this.toastrService.error('Total file size exceeds 25MB', 'File Upload Error');
          return;
        }
  
        this.multipleFiles.push(this.selectedfiles[i]);
      }
  
      if (this.multipleFiles.length > 0) {
      }
      // console.log(this.multipleFiles, 'hshshsh')
  
      // console.log(event.target.files,this.multipleFiles, "selectedFiles")
    }
    uploadManualFiles() {

      let formData = new FormData();
      if (this.selectedfiles.length == 1) {
        formData.append("file", this.selectUploadedFiles);
      }
      else {
        //formData.set("file", this.multipleFiles);
        this.multipleFiles.forEach((file: any) => {
          formData.append("file", file);
        })
      }
  
      this._commonService.add(APIS.programCreation.uploadProgram, formData).pipe().subscribe(
        {
          next: (res: any) => {
            // console.log(res, "res")
            this.toastrService.success('Program Data Uploaded successfully', "Program Data Success!");
             this.getProgramDetails()
             this.reinitializeDataTable();
            this.selectedfiles=[]
            // console.log(data)
          },
          error: (err) => {
            // console.log(err, "error")
            this.toastrService.success('Program Data Uploaded successfully', "Program Data Success!");
            this.getProgramDetails()
            this.reinitializeDataTable();
            this.selectedfiles=[]
          }
        })
    }
    downloadProgram(type:any){
     
      let linkUrl = type=='excel'?APIS.programCreation.downloadProgramsDataExcel+this.agencyId:APIS.programCreation.downloadProgramsDataPdf+this.agencyId
      const link = document.createElement("a");
      link.setAttribute("download", linkUrl);
      link.setAttribute("target", "_blank");
      link.setAttribute("href", linkUrl);
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
}