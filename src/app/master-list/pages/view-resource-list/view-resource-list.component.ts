import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '../../../_services/common-service.service';
import { APIS } from '../../../constants/constants';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-view-resource-list',
  templateUrl: './view-resource-list.component.html',
  styleUrls: ['./view-resource-list.component.css']
})
export class ViewResourceListComponent implements OnInit, OnDestroy {
  
  resources: any = '';
  agencyList: any = [];
  loginsessionDetails: any;
  dataTableResources: any;
  
  // Resource edit/delete properties
  editResourceForm!: FormGroup;
  selectedResource: any = null;
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
    this.initializeEditResourceForm();
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

    // Initialize resources data table
    setTimeout(() => {
      this.initializeDataTableResources();
    }, 100);
  }

  // Initialize Edit Resource Form - Based on AddProgramSessionsComponent
  initializeEditResourceForm() {
    this.editResourceForm = this.fb.group({
      resourceId: [''],
      name: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z .]+$/)]],
      mobileNo: ['', [Validators.required, Validators.pattern(/^[6789]\d{9}$/)]],
      email: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]],
      organizationName: ['', [Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]],
      qualification: ['', Validators.required],
      designation: ['', Validators.required],
      isVIP: [false],
      specialization: ['', Validators.required],
      briefDescription: ['', Validators.required],
      gender: ['', Validators.required],
      agencyId: ['']
    });
  }

  get fEditResource() {
    return this.editResourceForm.controls;
  }

  // Handle VIP status change - Based on AddProgramSessionsComponent
  changeResourceStatus(event: any) {
    if (event.target.checked) {
      this.editResourceForm.patchValue({ isVIP: true });
      // Remove validators for VIP resources
      this.editResourceForm.get('mobileNo')?.patchValue('');
      this.editResourceForm.get('mobileNo')?.setValidators(null);
      this.editResourceForm.get('mobileNo')?.updateValueAndValidity();
      
      this.editResourceForm.get('email')?.patchValue('');
      this.editResourceForm.get('email')?.setValidators(null);
      this.editResourceForm.get('email')?.updateValueAndValidity();
      
      this.editResourceForm.get('organizationName')?.patchValue('');
      this.editResourceForm.get('organizationName')?.setValidators(null);
      this.editResourceForm.get('organizationName')?.updateValueAndValidity();
      
      this.editResourceForm.get('qualification')?.patchValue('');
      this.editResourceForm.get('qualification')?.setValidators(null);
      this.editResourceForm.get('qualification')?.updateValueAndValidity();
      
      this.editResourceForm.get('designation')?.patchValue('');
      this.editResourceForm.get('designation')?.setValidators(null);
      this.editResourceForm.get('designation')?.updateValueAndValidity();
      
      this.editResourceForm.get('briefDescription')?.patchValue('');
      this.editResourceForm.get('briefDescription')?.setValidators(null);
      this.editResourceForm.get('briefDescription')?.updateValueAndValidity();
      
      this.editResourceForm.get('specialization')?.patchValue('');
      this.editResourceForm.get('specialization')?.setValidators(null);
      this.editResourceForm.get('specialization')?.updateValueAndValidity();
    } else {
      this.editResourceForm.patchValue({ isVIP: false });
      // Add back validators for non-VIP resources
      this.editResourceForm.get('mobileNo')?.setValidators([Validators.required, Validators.pattern(/^[6789]\d{9}$/)]);
      this.editResourceForm.get('mobileNo')?.updateValueAndValidity();
      
      this.editResourceForm.get('email')?.setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]);
      this.editResourceForm.get('email')?.updateValueAndValidity();
      
      this.editResourceForm.get('organizationName')?.setValidators([Validators.required, Validators.pattern(/^[A-Za-z][A-Za-z0-9 .]+$/)]);
      this.editResourceForm.get('organizationName')?.updateValueAndValidity();
      
      this.editResourceForm.get('qualification')?.setValidators([Validators.required]);
      this.editResourceForm.get('qualification')?.updateValueAndValidity();
      
      this.editResourceForm.get('designation')?.setValidators([Validators.required]);
      this.editResourceForm.get('designation')?.updateValueAndValidity();
      
      this.editResourceForm.get('briefDescription')?.setValidators([Validators.required]);
      this.editResourceForm.get('briefDescription')?.updateValueAndValidity();
      
      this.editResourceForm.get('specialization')?.setValidators([Validators.required]);
      this.editResourceForm.get('specialization')?.updateValueAndValidity();
    }
  }

  // Edit resource
  editResource(resource: any) {
    this.selectedResource = resource;
    
    // Populate the edit form with current resource data
    this.editResourceForm.patchValue({
      resourceId: resource.resourceId,
      name: resource.name,
      mobileNo: resource.mobileNo,
      email: resource.email,
      organizationName: resource.organizationName,
      qualification: resource.qualification,
      designation: resource.designation,
      isVIP: resource.isVIP?resource.isVIP:false,
      specialization: resource.specialization,
      briefDescription: resource.briefDescription,
      gender: resource.gender,
      agencyId: resource.agencyId
    });

    // Show edit modal
    this.showModal('editResourceModal');
  }

  // Update resource
  onUpdateResource() {
    if (this.editResourceForm.valid) {
      this.updateLoading = true;
      let formData = { ...this.editResourceForm.value,"agencyIds": [Number(this.agencyId)], };
      
      this._commonService.updatedata(APIS.masterList.updateResourceStatus + formData.resourceId, formData).subscribe({
        next: (response: any) => {
          this.updateLoading = false;
          this.toastrService.success('Resource updated successfully!', 'Success');
          this.closeEditResourceModal();
          this.refreshResourcesList();
        },
        error: (error: any) => {
          this.updateLoading = false;
          this.toastrService.error('Failed to update resource', 'Error');
          console.error('Error updating resource:', error);
        }
      });
    }
  }

  // Delete resource
  deleteResource(resource: any) {
    this.selectedResource = resource;
    this.showModal('deleteResourceModal');
  }

  // Confirm delete resource
  confirmDeleteResource() {
    if (this.selectedResource && this.selectedResource.resourceId) {
      this.deleteLoading = true;
      
      this._commonService.deleteId(APIS.masterList.deleteResource, this.selectedResource.resourceId).subscribe({
        next: (response: any) => {
          if(response.status==200){
            this.deleteLoading = false;
          this.toastrService.success('Resource deleted successfully!', 'Success');
          this.closeDeleteResourceModal();
          this.refreshResourcesList();
          }
          else{
            this.deleteLoading = false;
            this.toastrService.error(response.message, 'Error');
            console.error('Error deleting resource:', response);
              this.closeDeleteResourceModal();
          this.refreshResourcesList();
          }
          
        },
        error: (error: any) => {
          this.deleteLoading = false;
          this.toastrService.error(error, 'Error');
          console.error('Error deleting resource:', error);
        }
      });
    }
  }

  // Close edit modal
  closeEditResourceModal() {
    this.hideModal('editResourceModal');
    this.editResourceForm.reset();
    this.selectedResource = null;
  }

  // Close delete modal
  closeDeleteResourceModal() {
    this.hideModal('deleteResourceModal');
    this.selectedResource = null;
  }

  // Refresh resources list
  refreshResourcesList() {
    if (this.loginsessionDetails?.agencyId || this.agencyId) {
      this.agencyId = this.agencyId?this.agencyId:this.loginsessionDetails?.agencyId;
      
    } else {
        this.agencyId = -1;
    }
    this.reinitializeDataTableResources();
  }

  getResourcesByAgency(event: any) {
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
    this.reinitializeDataTableResources();
  }

  initializeDataTableResources() {
    console.log('initializeDataTableResources agencyId:', this.agencyId);
    const self = this;

    // Destroy existing table if it exists
    if (this.dataTableResources) {
      this.dataTableResources.destroy();
      this.dataTableResources = null;
    }

    this.dataTableResources = $('#view-table-resource').DataTable({
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
          apiurl = APIS.masterList.getresources;
        } else {
          apiurl = APIS.masterList.getResourceDetailsById + '/' + self.agencyId;
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
              self.toastrService.error(err.message || 'Error loading resources', "Resource Data Error!");
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
                { 
          data: null,
          title: 'Actions',
          render: (data: any, type: any, row: any, meta: any) => {
            // Check if user has permission and if a specific agency is selected (not "All Agencies")
            if ((this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || 
                this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR' || 
                this.loginsessionDetails?.userRole == 'ADMIN') && 
                self.agencyId !== -1) {
              return `   
                <button type="button" class="btn btn-default text-lime-green btn-sm edit-resource-btn" data-index="${meta.row}">
                  <span class="bi bi-pencil"></span>
                </button>
                <button type="button" class="btn btn-default text-danger btn-sm delete-resource-btn" data-index="${meta.row}">
                  <span class="bi bi-trash"></span>
                </button>
              `;
            } else if ((this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || 
                      this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR' || 
                      this.loginsessionDetails?.userRole == 'ADMIN') && 
                      self.agencyId === -1) {
              // Show disabled buttons when "All Agencies" is selected
              return `   
                <button type="button" class="btn btn-default text-muted btn-sm" disabled title="Select a specific agency to edit">
                  <span class="bi bi-pencil"></span>
                </button>
                <button type="button" class="btn btn-default text-muted btn-sm" disabled title="Select a specific agency to delete">
                  <span class="bi bi-trash"></span>
                </button>
              `;
            } else {
              return '';
            }
          },
          className: 'text-center',
          orderable: false,
          width: '120px'
        },
        ...(this.loginsessionDetails?.userRole === 'ADMIN' ? [{
          data: 'agencyNames',
          title: 'Agency',
          render: function(data: any, type: any, row: any) {
            return data || 'N/A';
          }
        }] : []),
        {
          data: 'organizationName',
          title: 'Organization Name',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'name',
          title: 'Resource Name',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'designation',
          title: 'Designation',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'specialization',
          title: 'Specialization',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
        {
          data: 'mobileNo',
          title: 'Mobile Number',
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
          data: 'gender',
          title: 'Gender',
          render: function(data: any) {
            return data || 'N/A';
          }
        },
           
        {
          data: 'isVIP',
          title: 'VIP Status',
          render: function(data: any) {
            return data ? 'Yes' : 'No';
          }
        }
      ],
       headerCallback: function(thead: any, data: any, start: any, end: any, display: any) {
      $(thead).addClass('bg-lime-green');
    },
      initComplete: function() {
        // Add green background to table headers
        $('#view-table-resource thead th').addClass('bg-success text-white');
        
        // Add event listeners for edit/delete buttons
        $('#view-table-resource').off('click', '.edit-resource-btn').on('click', '.edit-resource-btn', function(this: any) {
          const rowData = self.dataTableResources.row($(this).parents('tr')).data();
          self.editResource(rowData);
        });
        
        $('#view-table-resource').off('click', '.delete-resource-btn').on('click', '.delete-resource-btn', function(this: any) {
          const rowData = self.dataTableResources.row($(this).parents('tr')).data();
          self.deleteResource(rowData);
        });
      }
    });
  }

  reinitializeDataTableResources() {
    if (this.dataTableResources) {
      this.dataTableResources.destroy();
      this.dataTableResources = null;
    }
    setTimeout(() => {
      this.initializeDataTableResources();
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
    if (type === 'resource') {
      let downloadUrl = '';
      if (this.agencyId == -1) {
        downloadUrl = APIS.masterList.resourceDownload;
      } else {
        downloadUrl = APIS.masterList.resourceDownload + this.agencyId;
      }
      
      this._commonService.downloadFile(downloadUrl).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `resources_${new Date().toISOString().split('T')[0]}.xlsx`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          this.toastrService.error('Failed to download resources data', 'Error');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dataTableResources) {
      this.dataTableResources.destroy();
      this.dataTableResources = null;
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