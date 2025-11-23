import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { API_BASE_URL, APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;

@Component({
  selector: 'app-view-programs-seperate',
  templateUrl: './view-programs-seperate.component.html',
  styleUrls: ['./view-programs-seperate.component.css']
})
export class ViewProgramsSeperateComponent implements OnInit ,AfterViewInit {
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
    ) { 
      this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');    
      this.agencyId = this.loginsessionDetails.agencyId;
    }
  
    ngOnInit(): void {
      // this.getAgenciesList() 
      this.getAllDistricts()
    }
  
    ngAfterViewInit() {
      this.initializeDataTable(-1);
    }
    GetProgramsByAgency(event:any){
      this.agencyByAdmin=event;
      this.StatusData=''
      this.selectedDistrictId = event;
      // this.getData()
      this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByDistrictDetails+event).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data;
          this.reinitializeDataTable();
        },
        error: (error: any) => {
          this.toastrService.error(error.error.message);
        }
      });
    }
    StatusData:any=''
  getProgramsByStatus(status: string) {
    if(status==this.StatusData){
      this.StatusData=''
    }
    else{
       this.StatusData= status;
    }
   
      this._commonService.getDataByUrl(APIS.programCreation.getProgramsListByDistrictDetails + this.selectedAgencyId).subscribe({
        next: (dataList: any) => {
          this.tableList = dataList.data;
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
  
    initializeDataTable(agency:any) { 
      const self = this;
      this.dataTable = new DataTable('#view-program', {
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
      columns: [
        { 
            title: 'S.No',
            render: function(data, type, row, meta:any) {
              // console.log(data,meta,type, row)
                return meta.settings?._iDisplayStart+meta.row  + 1;
            },
            className: 'dt-center'
        },
        { 
          title: 'Actions',
          data: null,
          render: function(data:any, type:any, row:any,meta: any) {
            // console.log(data,row,meta)
              // if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR') {
                  return `  <button type="button" class="btn btn-default btn-sm text-lime-green edit-btn" 
                  title="Sessions" data-bs-toggle="modal" data-bs-target="#viewModal" 
                  data-id="${row.id}" title="View">
                  <span class="bi bi-eye"></span>
                </button>`;
              // }
              // return '';
          },
          orderable: false,
          className: 'text-center'
      },
      
      { 
        data: 'startDate',
        title: 'Start Date'
    },
    { 
      data: 'endDate',
      title: 'End Date'
  }, { 
      data: 'programTitle',
      title: 'Title Of Program'
  },
    { 
      data: 'status',
      title: 'Status',
  },
   { 
      data: 'programLocationName',
      orderable: false,
      title: 'Program Location',
      render: function(data, type, row) {
        return data ? data : '';
      }
  },
  { 
        data: 'agencyName',
        orderable: false,
        title: 'Agency Name'
    },
        { 
            data: 'activityName',
            orderable: false,
            title: 'Type Of Activity'
        },
        { 
            data: 'subActivityName',
            orderable: false,
            title: 'Sub Activity'
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
            data: 'spocName',
            title: 'SPOC Name'
        },
        { 
            data: 'spocContactNo',
            title: 'SPOC Contact No.'
        },
     
    // { 
    //     data: 'startTime',
    //     title: 'In Time',
    //     className: 'text-center'
    // },
    // { 
    //     data: 'endTime',
    //     title: 'Out Time',
    //     className: 'text-center'
    // },
   
 
  //   { 
  //     data: 'programType',
  //     title: 'Budget Head'
  // },
     
   
  
      
      
       
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
        this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByAgencyByStatusDetails}${agency}${statusDataurl}${params}`)
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
            this.toastrService.error(err.message, "Programs Data Error!");
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
        this._commonService.getDataByUrl(`${APIS.programCreation.getProgramsListByDistrictDetails}${agency}${params}`)
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
            this.toastrService.error(err.message, "Programs Data Error!");
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
   
    initComplete: function() {
      // Use proper event handling with arrow function
      $('#view-program').on('click', '.edit-btn', (event:any) => {
        const rowData = self.dataTable.row($(event.currentTarget).parents('tr')).data();
        self.sessionDetails(rowData); // Call your method with proper data
      });
    }
      });
    }
  
    reinitializeDataTable() {
      if (this.dataTable) {
        this.dataTable.destroy();
      }
      setTimeout(() => {
        this.initializeDataTable( this.selectedDistrictId);
       
      }, 0);
    }
    agencyByAdmin:any=-1
    selectedAgencyId:any=-1
    agencyListFiltered:any;
    getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
        this.agencyListFiltered=this.agencyList;
        this.selectedAgencyId =-1
        // this.GetProgramsByAgency(-1);
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }
  selectedDistrictId:any
  allDistricts:any
  allDistrictsFiltered:any=[]
  getAllDistricts(){
    this.allDistricts = []
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data.data;
        this.allDistrictsFiltered=this.allDistricts;
        this.selectedDistrictId=this.allDistricts[0]?.districtName
        this.GetProgramsByAgency(this.allDistrictsFiltered[0]?.districtName)
      },
      error: (err: any) => {
        this.allDistricts = [];
      }
    })
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
      this._commonService.getById(APIS.programCreation.programSummary, this.selectedAgencyId).subscribe({
        next: (res: any) => {          
          // this.PrigramSummaryData = res?.data   
        // console.log( this.PrigramSummaryData)
        this.PrigramSummaryData = res?.data
        },
        error: (err) => {
          this.toastrService.error('Data Not Available', "Summary Data Error!");
          new Error(err);
        },
      });
      // console.log(this.ParticipantAttentance)
    }
  }
