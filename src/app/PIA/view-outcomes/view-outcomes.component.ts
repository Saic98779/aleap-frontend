import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-view-outcomes',
  templateUrl: './view-outcomes.component.html',
  styleUrls: ['./view-outcomes.component.css']
})
export class ViewOutcomesComponent implements OnInit {

  loginsessionDetails: any;
  agencyId: any;
  outcomeName: any;
  selectedAgencyId: any;
  agencyList: any;
  agencyListFiltered: any;
  outcomesList: any;
  outcomesListFiltered: any;
  outcomeData: any = [];
  outcomeHeaders: any = [];
  dataTable: any;
  isTableInitialized: boolean = false;
  currentOutcome: string = ''; // Track current outcome to detect changes

  constructor(
    private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router
  ) {
    this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    this.selectedAgencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
  }

  ngOnInit(): void {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    if (this.loginsessionDetails.userRole == 'ADMIN') {
      this.getAgenciesList();
    } else {
      this.getOutcomesList();
    }
  }

  getAgenciesList() {
    this.agencyList = [];
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
      this.agencyList = res.data;
      this.agencyListFiltered = this.agencyList;
      if (res.data && res.data.length > 0) {
        this.selectedAgencyId = res.data[0].agencyId;
        this.getOutcomesList();
      }
    }, (error) => {
      this.toastrService.error(error.error?.message || 'Error loading agencies');
    });
  }

  getOutcomesList() {
    this.outcomeData = [];
    this._commonService.getDataByUrl(APIS.captureOutcome.getOutcomelistData).subscribe({
      next: (res: any) => {
        this.outcomesList = res?.data || [];
        this.outcomesListFiltered = this.outcomesList;
        if (this.outcomesList && this.outcomesList.length > 0) {
          this.outcomeName = this.outcomesList[0].outcomeTableName;
          this.currentOutcome = this.outcomeName;
          this.loadOutcomeHeaders();
        }
      },
      error: (err) => {
        this.toastrService.error(err.error?.message || 'Error loading outcomes list');
        console.error('Error loading outcomes list:', err);
      }
    });
  }

  dropdownOutcomesList(event: any, type: any) {
    const newOutcome = event.value;
    
    // Check if outcome actually changed
    if (newOutcome !== this.currentOutcome) {
      this.outcomeName = newOutcome;
      this.currentOutcome = newOutcome;
      
      if (type == 'table' && event.value) {
        // Reset headers and force table recreation
        this.outcomeHeaders = [];
        this.isTableInitialized = false;
        this.loadOutcomeHeaders();
      }
    }
  }

  loadOutcomeHeaders() {
    if (!this.outcomeName || !this.selectedAgencyId) {
      console.warn('Missing required parameters: outcomeName or agencyId');
      return;
    }

    // First load to get headers structure
    const url = `${APIS.captureOutcome.viewOutcomelistData}?outcomeName=${this.outcomeName}&agencyId=${this.selectedAgencyId}&page=0&size=1`;
    
    this._commonService.getDataByUrl(url).subscribe({
      next: (res: any) => {
        console.log('Headers API Response:', res);
        
        let newHeaders = [];
        
        if (res?.data?.outcome?.headers) {
          newHeaders = res.data.outcome.headers;
        } else if (res?.data?.headers) {
          newHeaders = res.data.headers;
        } else if (res?.data?.outcome?.body && res.data.outcome.body.length > 0) {
          // Generate headers from first row if headers not provided
          newHeaders = Object.keys(res.data.outcome.body[0]).map(key => ({
            fieldName: key,
            fieldDisplayName: this.formatColumnTitle(key),
            fieldType: 'text'
          }));
        } else if (res?.data?.body && res.data.body.length > 0) {
          // Generate headers from first row if headers not provided
          newHeaders = Object.keys(res.data.body[0]).map(key => ({
            fieldName: key,
            fieldDisplayName: this.formatColumnTitle(key),
            fieldType: 'text'
          }));
        }
        
        // Check if headers actually changed
        const headersChanged = !this.areHeadersEqual(this.outcomeHeaders, newHeaders);
        
        if (headersChanged || !this.isTableInitialized) {
          console.log('Headers changed or table not initialized, recreating table');
          this.outcomeHeaders = newHeaders;
          this.recreateDataTable();
        } else {
          console.log('Headers unchanged, reloading data');
          this.initializeOrUpdateDataTable();
        }
      },
      error: (err) => {
        this.toastrService.error(err.error?.message || 'Error loading outcome headers');
        console.error('Error loading outcome headers:', err);
      }
    });
  }

  // Helper method to compare headers
  areHeadersEqual(headers1: any[], headers2: any[]): boolean {
    if (!headers1 || !headers2 || headers1.length !== headers2.length) {
      return false;
    }
    
    return headers1.every((header, index) => {
      const header2 = headers2[index];
      return header.fieldName === header2.fieldName && 
             header.fieldDisplayName === header2.fieldDisplayName;
    });
  }

  recreateDataTable() {
    // Always destroy and recreate when headers change
    if (this.dataTable) {
      this.dataTable.destroy();
      $('#view-table-outcomes').empty();
      this.isTableInitialized = false;
    }
    
    // Initialize new table with new headers
    setTimeout(() => {
      this.initializeDataTable();
    }, 100);
  }

  initializeOrUpdateDataTable() {
    if (this.dataTable && this.isTableInitialized) {
      // If table exists and headers haven't changed, just reload the data
      this.dataTable.ajax.reload();
    } else {
      this.recreateDataTable();
    }
  }

  initializeDataTable() {
    const self = this;

    // Don't initialize if no headers available
    if (!this.outcomeHeaders || this.outcomeHeaders.length === 0) {
      console.warn('No headers available for table initialization');
      return;
    }

    this.dataTable = $('#view-table-outcomes').DataTable({
      scrollY: "415px",
      scrollX: true,
      scrollCollapse: true,
      paging: true,
      serverSide: true,
      processing: true,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      autoWidth: false,
      info: true,
      searching: false,
      ajax: (data: any, callback: any, settings: any) => {
        // Extract pagination and sorting parameters
        const page = data.start / data.length;
        const size = data.length;
        const sortColumn = data.order[0]?.column;
        const sortDirection = data.order[0]?.dir;
        
        // Get sort field name (skip S.No column)
        let sortField = '';
        if (sortColumn > 0 && this.outcomeHeaders && this.outcomeHeaders[sortColumn - 1]) {
          sortField = this.outcomeHeaders[sortColumn - 1].fieldName;
        }
        
        // Prepare parameters for API call
        let params = `?outcomeName=${this.outcomeName}&agencyId=${this.selectedAgencyId}&page=${page}&size=${size}`;
        
        if (sortField && sortDirection) {
          params += `&sort=${sortField},${sortDirection}`;
        }
        
        // Add search filter if any
        if (data.search.value) {
          params += `&search=${encodeURIComponent(data.search.value)}`;
        }
        
        const url = `${APIS.captureOutcome.viewOutcomelistData}${params}`;
        
        this._commonService.getDataByUrl(url).subscribe({
          next: (res: any) => {
            console.log('Paginated API Response:', res);
            
            let responseData = [];
            let totalRecords = 0;
            
            if (res?.data?.outcome) {
              responseData = res.data.outcome.body || [];
              totalRecords = res.totalElements || res.data.outcome.totalElements || responseData.length;
            } else if (res?.data) {
              responseData = res.data.body || res.data || [];
              totalRecords = res.totalElements || responseData.length;
            }
            
            callback({
              draw: data.draw,
              recordsTotal: totalRecords,
              recordsFiltered: totalRecords,
              data: responseData
            });
          },
          error: (err) => {
            this.toastrService.error(err.error?.message || 'Error loading outcome data');
            console.error('Error loading outcome data:', err);
            callback({
              draw: data.draw,
              recordsTotal: 0,
              recordsFiltered: 0,
              data: []
            });
          }
        });
      },
      columns: this.buildTableColumns(),
      language: {
        emptyTable: "No outcome data available",
        processing: "Loading outcome data...",
        loadingRecords: "Loading...",
        zeroRecords: "No matching records found"
      },
      columnDefs: [
        { className: "text-center", targets: 0 }
      ],
        headerCallback: function(thead: any, data: any, start: any, end: any, display: any) {
      $(thead).addClass('bg-lime-green');
    },
      initComplete: function() {
        self.isTableInitialized = true;
        console.log('DataTable initialized successfully');
      }
    });
  }

  buildTableColumns() {
    const columns: any = [
      {
        title: 'S.No',
        data: null,
        render: function(data: any, type: any, row: any, meta: any) {
          return meta.settings._iDisplayStart + meta.row + 1;
        },
        orderable: false,
        width: '60px'
      }
    ];

    // Add columns based on headers from API response
    if (this.outcomeHeaders && Array.isArray(this.outcomeHeaders) && this.outcomeHeaders.length > 0) {
      this.outcomeHeaders.forEach((header: any) => {
        const column: any = {
          data: header.fieldName,
          title: header.fieldDisplayName,
          render: (data: any, type: any, row: any) => {
            return this.formatCellData(data, header.fieldType, row);
          },
          orderable: true
        };
        columns.push(column);
      });
    }

    console.log('Built columns:', columns);
    return columns;
  }

  formatColumnTitle(key: string): string {
    // Convert camelCase to Title Case
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  }

  formatCellData(data: any, fieldType: string, row: any): string {
    if (data === null || data === undefined) {
      return '';
    }

    switch (fieldType) {
      case 'boolean':
        return data === true || data === 'true' ? 'Yes' : 'No';
      case 'date':
      case 'datetime':
        return data ? data.toString() : '';
      case 'number':
        return data ? data.toString() : '';
      case 'text':
      case 'label':
      default:
        return (data==false?'No':(data==true?'Yes': (data ? data:'')));
    }
  }

  downloadOutcome(type: string) {
    if (!this.outcomeName || !this.selectedAgencyId) {
      this.toastrService.warning('Please select outcome and agency first');
      return;
    }

    let payload = `?agencyId=${this.selectedAgencyId}&outcomeName=${this.outcomeName}`;
    
    let linkUrl = type === 'excel' ? 
      `${APIS.captureOutcome.viewOutcomelistData}/download/excel${payload}` : 
      `${APIS.captureOutcome.viewOutcomelistData}/download/pdf${payload}`;
      
    const link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.setAttribute("href", linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  ngOnDestroy() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }
}