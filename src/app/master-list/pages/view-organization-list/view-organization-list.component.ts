import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '../../../_services/common-service.service';
import { APIS } from '../../../constants/constants';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-view-organization-list',
  templateUrl: './view-organization-list.component.html',
  styleUrls: ['./view-organization-list.component.css']
})
export class ViewOrganizationListComponent implements OnInit, OnDestroy {
  
  organizations: any = '';
  agencyList: any = [];
  loginsessionDetails: any;
  dataTableOrganizations: any;
  
  // Organization edit/delete properties
  editOrganizationForm!: FormGroup;
  selectedOrganization: any = null;
  updateLoading = false;
  deleteLoading = false;
  agencyId: any = '';

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private fb: FormBuilder,
  ) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.initializeEditOrganizationForm();
  }

  ngOnInit(): void {
    this.getAgenciesList();
    if (this.loginsessionDetails?.userRole == 'ADMIN') {
      this.agencyId = -1;
    } else {
      this.agencyId = this.loginsessionDetails?.agencyId;
    }
    
    // Ensure Bootstrap is loaded
    if (typeof bootstrap === 'undefined') {
      console.warn('Bootstrap not loaded');
    }

    // Initialize organizations data table
    setTimeout(() => {
      this.initializeDataTableOrganizations();
    }, 100);
  }

  // Initialize Edit Organization Form
  initializeEditOrganizationForm() {
    this.editOrganizationForm = this.fb.group({
      organizationId: [''],
      organizationName: ['', [Validators.required]],
      organizationType: [''],
      ownerName: [''],
      contactNo: [''],
      email: ['', [Validators.email]],
      address: [''],
      agencyId: ['']
    });
  }

  get fEditOrganization() {
    return this.editOrganizationForm.controls;
  }

  // Edit organization
  editOrganization(organization: any) {
    this.selectedOrganization = organization;
    
    // Populate the edit form with current organization data
    this.editOrganizationForm.patchValue({
      organizationId: organization.organizationId,
      organizationName: organization.organizationName,
      organizationType: organization.organizationType,
      ownerName: organization.ownerName,
      contactNo: organization.contactNo,
      email: organization.email,
      address: organization.address,
      agencyId: organization.agencyId
    });

    // Show edit modal
    this.showModal('editOrganizationModal');
  }

  // Update organization
  onUpdateOrganization() {
    if (this.editOrganizationForm.valid) {
      this.updateLoading = true;
      let formData = { ...this.editOrganizationForm.value };
      
      this._commonService.updatedata(APIS.masterList.updateLocationStatus + formData.organizationId, formData).subscribe({
        next: (response: any) => {
          this.updateLoading = false;
          this.toastrService.success('Organization updated successfully!', 'Success');
          this.closeEditOrganizationModal();
          this.refreshOrganizationsList();
        },
        error: (error: any) => {
          this.updateLoading = false;
          this.toastrService.error('Failed to update organization', 'Error');
          console.error('Error updating organization:', error);
        }
      });
    }
  }

  // Delete organization
  deleteOrganization(organization: any) {
    this.selectedOrganization = organization;
    this.showModal('deleteOrganizationModal');
  }

  // Confirm delete organization
  confirmDeleteOrganization() {
    if (this.selectedOrganization && this.selectedOrganization.organizationId) {
      this.deleteLoading = true;
      
      this._commonService.deleteById(APIS.masterList.deleteLocation, this.selectedOrganization.organizationId).subscribe({
        next: (response: any) => {
          this.deleteLoading = false;
          this.toastrService.success('Organization deleted successfully!', 'Success');
          this.closeDeleteOrganizationModal();
          this.refreshOrganizationsList();
        },
        error: (error: any) => {
          this.deleteLoading = false;
          this.toastrService.error('Failed to delete organization', 'Error');
          console.error('Error deleting organization:', error);
        }
      });
    }
  }

  // Close edit modal
  closeEditOrganizationModal() {
    this.hideModal('editOrganizationModal');
    this.editOrganizationForm.reset();
    this.selectedOrganization = null;
  }

  // Close delete modal
  closeDeleteOrganizationModal() {
    this.hideModal('deleteOrganizationModal');
    this.selectedOrganization = null;
  }

  // Refresh organizations list
  refreshOrganizationsList() {
    if (this.loginsessionDetails?.userRole == 'ADMIN') {
      this.agencyId = -1;
    } else {
      this.agencyId = this.loginsessionDetails?.agencyId;
    }
    this.reinitializeDataTableOrganizations();
  }

  getOrganizationsByAgency(event: any) {
    console.log(event);
    this.agencyId = event;
    if (event == 'All Agency') {
      this.agencyId = -1;
    } else {
      if (this.loginsessionDetails?.userRole == 'ADMIN') {
        this.agencyId = event;
      } else {
        this.agencyId = this.loginsessionDetails?.agencyId;
      }
    }
    this.reinitializeDataTableOrganizations();
  }

  initializeDataTableOrganizations() {
    console.log('initializeDataTableOrganizations agencyId:', this.agencyId);
    const self = this;

    // Destroy existing table if it exists
    if (this.dataTableOrganizations) {
      this.dataTableOrganizations.destroy();
      this.dataTableOrganizations = null;
    }

    this.dataTableOrganizations = $('#view-table-organization').DataTable({
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
      searching: false ,
      destroy: true,
      ajax: (data: any, callback: any, settings: any) => {
        // Extract pagination and sorting parameters
        const page = data.start / data.length;
        const size = data.length;
        const sortColumn = data.order[0]?.column;
        const sortDirection = data.order[0]?.dir;
        const sortField = data.columns[sortColumn]?.data;
        
        // Prepare parameters for API call
        let params = `?page=${page}&size=${size}`;
        
        if (sortField && sortDirection) {
          params += `&sort=${sortField},${sortDirection}`;
        }
        
        // Add search filter if any
        if (data.search.value) {
          params += `&search=${encodeURIComponent(data.search.value)}`;
        }
        
        // Add agency filter
        // if (self.agencyId && self.agencyId !== -1) {
        //   params += `&agencyId=${self.agencyId}`;
        // }
        
        let apiurl = '';
        if (self.agencyId == -1) {
          apiurl = APIS.masterList.getOrgnizationDetailsById;
        } else {
          //  + '/' + self.agencyId;
          apiurl = APIS.masterList.getOrgnizationDetailsById
        }
        
        // Call the API with pagination parameters
        self._commonService.getDataByUrl(`${apiurl}${params}`)
          .pipe()
          .subscribe({
            next: (res: any) => {
              callback({
                draw: data.draw,
                recordsTotal: res.totalElements || res.recordsTotal || res.data?.length || 0,
                recordsFiltered: res.totalElements || res.recordsFiltered || res.data?.length || 0,
                data: res.data || res.content || res || []
              });
            },
            error: (err) => {
              self.toastrService.error(err.message || 'Error loading organizations', "Organization Data Error!");
              console.error(err);
              callback({
                draw: data.draw,
                recordsTotal: 0,
                recordsFiltered: 0,
                data: []
              });
            }
          });
      },
      columns: [
        { 
          title: 'S.No',
          data: null,
          render: function(data: any, type: any, row: any, meta: any) {
            return meta.settings?._iDisplayStart + meta.row + 1;
          },
          className: 'text-start',
          orderable: false,
          width: '60px'
        },
        // { 
        //   data: null,
        //   title: 'Actions',
        //   render: (data: any, type: any, row: any, meta: any) => {
        //     if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || 
        //         this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR' || 
        //         this.loginsessionDetails?.userRole == 'ADMIN') {
        //       return `   
        //         <button type="button" class="btn btn-default text-lime-green btn-sm edit-organization-btn" data-index="${meta.row}">
        //           <span class="bi bi-pencil"></span>
        //         </button>
        //         <button type="button" class="btn btn-default text-danger btn-sm delete-organization-btn" data-index="${meta.row}">
        //           <span class="bi bi-trash"></span>
        //         </button>
        //       `;
        //     } else {
        //       return '';
        //     }
        //   },
        //   className: 'text-center',
        //   orderable: false,
        //   width: '120px'
        // },
        ...(this.loginsessionDetails?.userRole === 'ADMIN' ? [{
          data: 'agencyName',
          title: 'Agency',
          render: function(data: any, type: any, row: any) {
            return data || 'N/A';
          }
        }] : []),
        {
          data: 'organizationType',
          title: 'Type Of Organization',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'organizationName',
          title: 'Organization Name',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'ownerName',
          title: 'Name Of Director/Promotor/Leader',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'contactNo',
          title: 'Contact',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'email',
          title: 'Email',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'address',
          title: 'Address',
          render: function(data: any) {
            return data || 'N/A';
          }
        }
      ],
       headerCallback: function(thead: any, data: any, start: any, end: any, display: any) {
      $(thead).addClass('bg-lime-green');
    },
      initComplete: function() {
        // Add green background to table headers
        $('#view-table-organization thead th').addClass('bg-success text-white');
        
        // Add event listeners for edit/delete buttons
        $('#view-table-organization').off('click', '.edit-organization-btn').on('click', '.edit-organization-btn', function(this: any) {
          const rowData = self.dataTableOrganizations.row($(this).parents('tr')).data();
          self.editOrganization(rowData);
        });
        
        $('#view-table-organization').off('click', '.delete-organization-btn').on('click', '.delete-organization-btn', function(this: any) {
          const rowData = self.dataTableOrganizations.row($(this).parents('tr')).data();
          self.deleteOrganization(rowData);
        });
      }
    });
  }

  reinitializeDataTableOrganizations() {
    if (this.dataTableOrganizations) {
      this.dataTableOrganizations.destroy();
      this.dataTableOrganizations = null;
    }
    setTimeout(() => {
      this.initializeDataTableOrganizations();
    }, 100);
  }

  getAgenciesList() {
    this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe({
      next: (data: any) => {
        this.agencyList = data.data;
      },
      error: (err: any) => {
        console.error('Error fetching agencies:', err);
      }
    });
  }

  downloadProgramApi(type: string) {
    if (type === 'org') {
      let downloadUrl = '';
      if (this.agencyId == -1) {
        downloadUrl = APIS.masterList.organizationDownload;
      } else {
        downloadUrl = APIS.masterList.organizationDownload + '/' + this.agencyId;
      }
      
      this._commonService.downloadFile(downloadUrl).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `organizations_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          this.toastrService.error('Failed to download organizations data', 'Error');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dataTableOrganizations) {
      this.dataTableOrganizations.destroy();
      this.dataTableOrganizations = null;
    }
  }

  // Utility method to safely show Bootstrap modal
  private showModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    } catch (error) {
      console.error('Error showing modal:', error);
    }
  }

  // Utility method to safely hide Bootstrap modal
  private hideModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement && typeof bootstrap !== 'undefined') {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    } catch (error) {
      console.error('Error hiding modal:', error);
    }
  }
}