import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '../../../_services/common-service.service';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { APIS } from '../../../constants/constants';
declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-view-location',
  templateUrl: './view-location.component.html',
  styleUrls: ['./view-location.component.css']
})
export class ViewLocationComponent implements OnInit {

  locationsList: any = '';
  agencyList: any = [];
  loginsessionDetails: any;
  dataTableLocations: any;
  
  // Location edit/delete properties
  editLocationForm!: FormGroup;
  selectedLocation: any = null;
  updateLoading = false;
  deleteLoading = false;
  allDistricts: any = [];
  MandalList: any = [];
  agencyId: any = '';

  constructor(
    private http: HttpClient,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private fb: FormBuilder,
  ) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    this.initializeEditLocationForm();
    this.getAllDistricts();
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

    // Initialize locations data table
    setTimeout(() => {
      this.initializeDataTableLocations();
    }, 100);
  }

  // Initialize Edit Location Form
  initializeEditLocationForm() {
    this.editLocationForm = new FormGroup({
      locationId: new FormControl(""),
      locationName: new FormControl("", [Validators.required, Validators.pattern(/^[A-Za-z ]+$/)]),
      ownershipType: new FormControl(""),
      typeOfVenue: new FormControl("", [Validators.required]),
      latitude: new FormControl(""),
      longitude: new FormControl(""),
      googleMapUrl: new FormControl("", [Validators.pattern(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)]),
      OthersType: new FormControl(""),
      capacity: new FormControl("", [Validators.required, Validators.pattern(/^[1-9]\d*$/)]),
      agencyId: new FormControl(""),
      filePath: new FormControl(""),
      district: new FormControl(""),
      mandal: new FormControl(""),
    });
  }

  get fEditLocation() {
    return this.editLocationForm.controls;
  }

  // Get all districts
  getAllDistricts() {
    this.allDistricts = [];
    this._commonService.getDataByUrl(APIS.masterList.getDistricts).subscribe({
      next: (data: any) => {
        this.allDistricts = data?.data;
      },
      error: (err: any) => {
        console.error('Error fetching districts:', err);
      }
    });
  }

  // Get mandals by district
  GetMandalByDistrict(event: any) {
    this.MandalList = [];
    this._commonService.getDataByUrl(APIS.masterList.getMandalName + event).subscribe({
      next: (data: any) => {
        this.MandalList = data.data;
      },
      error: (err: any) => {
        console.error('Error fetching mandals:', err);
      }
    });
  }

  // Edit location
  editLocation(location: any) {
    this.selectedLocation = location;
    
    // Populate the edit form with current location data
    this.editLocationForm.patchValue({
      locationId: location.locationId,
      locationName: location.locationName,
      ownershipType: location.ownershipType,
      typeOfVenue: location.typeOfVenue,
      latitude: location.latitude,
      longitude: location.longitude,
      googleMapUrl: location.googleMapUrl,
      capacity: location.capacity,
      agencyId: location.agencyId,
      district: location.district,
      mandal: location.mandal,
    });

    // Load mandals if district is selected
    if (location.district) {
      this.GetMandalByDistrict(location.district);
    }

    // Show edit modal
    this.showModal('editLocationModal');
  }

  // Update location
onUpdateLocation() {
  if (this.editLocationForm.valid) {
    this.updateLoading = true;
    let formData = { ...this.editLocationForm.value };
    
    // Handle "Others" type like in program creation
    if (formData['typeOfVenue'] == 'Others') {
      formData['typeOfVenue'] = formData['OthersType'];
    }
    delete formData['OthersType'];
    
    this._commonService.updatedata(APIS.masterList.updateLocationStatus + formData.locationId, formData).subscribe({
      next: (response: any) => {
        this.updateLoading = false;
        this.toastrService.success('Location updated successfully!', 'Success');
        this.closeEditModal();
        this.refreshLocationsList();
      },
      error: (error: any) => {
        this.updateLoading = false;
        this.toastrService.error('Failed to update location', 'Error');
        console.error('Error updating location:', error);
      }
    });
  }
}

  // Delete location
  deleteLocation(location: any) {
    this.selectedLocation = location;
    this.showModal('deleteLocationModal');
  }

  // Confirm delete location
  confirmDeleteLocation() {
    if (this.selectedLocation && this.selectedLocation.locationId) {
      this.deleteLoading = true;
      
      this._commonService.deleteId(APIS.masterList.deleteLocation ,this.selectedLocation.locationId).subscribe({
        next: (response: any) => {
          if(response.status === 200) {
              this.deleteLoading = false;
          this.toastrService.success('Location deleted successfully!', 'Success');
          this.closeDeleteModal();
          this.refreshLocationsList();
          }
          else{
            this.deleteLoading = false;
            this.toastrService.error(response.message, 'Error');
            console.error('Error deleting location:', response);
            this.closeDeleteModal();
            this.refreshLocationsList();
          }
        
        },
        error: (error: any) => {
          this.deleteLoading = false;
          this.toastrService.error(error, 'Error');
          console.error('Error deleting location:', error);
            this.closeDeleteModal();
          this.refreshLocationsList();
        }
      });
    }
  }

  // Close edit modal
  closeEditModal() {
    this.hideModal('editLocationModal');
    this.editLocationForm.reset();
    this.selectedLocation = null;
  }

  // Close delete modal
  closeDeleteModal() {
    this.hideModal('deleteLocationModal');
    this.selectedLocation = null;
  }

  // Refresh locations list
  refreshLocationsList() {
    if (this.loginsessionDetails?.userRole == 'ADMIN') {
      this.agencyId = -1;
    } else {
      this.agencyId = this.loginsessionDetails?.agencyId;
    }
    this.reinitializeDataTableLocations();
  }

  getLocationsByAgency(event: any) {
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
    this.reinitializeDataTableLocations();
  }

  initializeDataTableLocations() {
  console.log('initializeDataTableLocations agencyId:', this.agencyId);
  const self = this;

  // Destroy existing table if it exists
  if (this.dataTableLocations) {
    this.dataTableLocations.destroy();
    this.dataTableLocations = null;
  }

  this.dataTableLocations = $('#view-table-location').DataTable({
    scrollY: "415px",
    scrollX: true,
    scrollCollapse: true,
    paging: true,
    serverSide: true,
    processing: true,
    pageLength: 10,
    lengthMenu: [5, 10, 25, 50],
    autoWidth: true,
    info: false,
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
      if(self.agencyId == -1){
        apiurl=APIS.masterList.locationList
      }
      else{
        apiurl=APIS.masterList.locationDetailsById+self.agencyId
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
            self.toastrService.error(err.message || 'Error loading locations', "Location Data Error!");
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
    // Update the columns section in initializeDataTableLocations method
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
      if (this.loginsessionDetails?.userRole == 'AGENCY_MANAGER' || 
          this.loginsessionDetails?.userRole == 'AGENCY_EXECUTOR' || 
          this.loginsessionDetails?.userRole == 'ADMIN') {
        return `   
          <button type="button" class="btn btn-default text-lime-green btn-sm edit-location-btn" data-index="${meta.row}">
            <span class="bi bi-pencil"></span>
          </button>
          <button type="button" class="btn btn-default text-danger btn-sm delete-location-btn" data-index="${meta.row}">
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
    data: 'agencyName',
    title: 'Agency',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  }] : []),
  { 
    data: 'locationName',
    title: 'Program Location',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
    data: 'ownershipType',
    title: 'Type Of Ownership',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
    data: 'typeOfVenue',
    title: 'Type Of Venue',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
    data: 'capacity',
    title: 'Max Capacity',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
    data: 'latitude',
    title: 'Latitude',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
    data: 'longitude',
    title: 'Longitude',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  { 
          data: 'district',
          title: 'District',
          render: function(data: any, type: any, row: any) {
            return data || 'N/A';
          }
        },
        { 
          data: 'mandal',
          title: 'Mandal',
          render: function(data: any, type: any, row: any) {
            return data || 'N/A';
          }
        },
  { 
    data: 'googleMapUrl',
    title: 'Google Map Url',
    render: function(data: any, type: any, row: any) {
      return data || 'N/A';
    }
  },
  
],
    headerCallback: function(thead: any, data: any, start: any, end: any, display: any) {
      $(thead).addClass('bg-lime-green');
    },
    initComplete: function() {
      // const self = this;
        $('#view-table-resource thead th').addClass('bg-success text-white');
      // Add event listeners for edit/delete buttons
      $('#view-table-location').off('click', '.edit-location-btn').on('click', '.edit-location-btn', function(this: any) {
        const rowData = self.dataTableLocations.row($(this).parents('tr')).data();
        self.editLocation(rowData);
      });
      
      $('#view-table-location').off('click', '.delete-location-btn').on('click', '.delete-location-btn', function(this: any) {
        const rowData = self.dataTableLocations.row($(this).parents('tr')).data();
        self.deleteLocation(rowData);
      });
    }
  });
}

  reinitializeDataTableLocations() {
    if (this.dataTableLocations) {
      this.dataTableLocations.destroy();
      this.dataTableLocations = null;
    }
    setTimeout(() => {
      this.initializeDataTableLocations();
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
    if (type === 'location') {
      let downloadUrl = '';
      if (this.agencyId == -1) {
        downloadUrl = APIS.masterList.locationDownload;
      } else {
        downloadUrl = APIS.masterList.locationDownload + this.agencyId;
      }
      
      this._commonService.downloadFile(downloadUrl).subscribe({
        next: (response: any) => {
          const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'locations.xlsx';
          link.click();
          window.URL.revokeObjectURL(url);
        },
        error: (error: any) => {
          console.error('Error downloading file:', error);
          this.toastrService.error('Failed to download locations', 'Error');
        }
      });
    }
  }

  ngOnDestroy() {
    if (this.dataTableLocations) {
      this.dataTableLocations.destroy();
      this.dataTableLocations = null;
    }
  }

  // Utility method to safely show Bootstrap modal
  private showModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
      }
    } catch (error) {
      console.error('Error showing modal:', error);
      // Fallback to jQuery if Bootstrap fails
      $(`#${modalId}`).modal('show');
    }
  }

  // Utility method to safely hide Bootstrap modal
  private hideModal(modalId: string): void {
    try {
      const modalElement = document.getElementById(modalId);
      if (modalElement) {
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
        }
      }
    } catch (error) {
      console.error('Error hiding modal:', error);
      // Fallback to jQuery if Bootstrap fails
      $(`#${modalId}`).modal('hide');
    }
  }
}