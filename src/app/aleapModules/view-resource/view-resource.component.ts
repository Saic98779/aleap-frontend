import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
import { ToastrService } from 'ngx-toastr';

import { APIS } from '@app/constants/constants';
import { CommonServiceService } from '@app/_services/common-service.service';

@Component({
  selector: 'app-view-resource',
  templateUrl: './view-resource.component.html',
  styleUrls: ['./view-resource.component.css']
})
export class ViewResourceComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  resources: any = '';
  agencyList: any[] = [];
  loginsessionDetails: any;
  agencyId: any = '';
  dataTableResources: any;
  deleteModalRef: any;
  selectedResource: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private toastrService: ToastrService,
    private commonService: CommonServiceService
  ) {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
  }

  ngOnInit(): void {
    if (this.loginsessionDetails?.userRole === 'ADMIN') {
      this.getAgenciesList();
      this.getResourcesByAgency('All Agency');
      return;
    }

    this.agencyId = this.loginsessionDetails?.agencyId;
    this.getResourcesByAgency(this.agencyId);
  }

  ngOnDestroy(): void {
    this.deleteModalRef?.hide();
    if (this.dataTableResources) {
      this.dataTableResources.destroy();
    }
  }

  editRow(item: any): void {
    const resourceId = this.getResourceId(item);
    if (!resourceId) {
      this.toastrService.error('Invalid resource id', 'Error');
      return;
    }

    this.router.navigate(['/add-resource-person-edit', resourceId], { state: { resource: item } });
  }

  deleteRow(item: any): void {
    const resourceId = this.getResourceId(item);
    if (!resourceId) {
      this.toastrService.error('Invalid resource id', 'Error');
      return;
    }

    this.selectedResource = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete(): void {
    const resourceId = this.getResourceId(this.selectedResource);
    if (!resourceId) {
      this.toastrService.error('Invalid resource id', 'Error');
      return;
    }

    this.commonService.deleteId(APIS.resource.delete, resourceId).subscribe({
      next: () => {
        this.toastrService.success('Resource deleted successfully', 'Success');
        this.closeDeleteModal();
        if (this.agencyId === -1) {
          this.fetchResources();
          return;
        }
        this.getResourcesByAgency(this.agencyId);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete resource', 'Error');
      }
    });
  }

  closeDeleteModal(): void {
    this.deleteModalRef?.hide();
    this.selectedResource = null;
  }

  getResourcesByAgency(agency: any): void {
    if (agency === 'All Agency') {
      this.agencyId = -1;
      this.fetchResources();
      return;
    }

    this.agencyId = agency;
    this.resources = '';
    this.http.get<any[]>(APIS.programCreation.getResource + '/' + agency).subscribe({
      next: (data: any) => {
        this.resources = data?.data || [];
        this.reinitializeDataTableResources();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load resources', 'Error');
      }
    });
  }

  fetchResources(): void {
    this.resources = '';
    this.http.get<any[]>(APIS.masterList.getresources).subscribe({
      next: (data: any) => {
        this.resources = data?.data || [];
        this.reinitializeDataTableResources();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load resources', 'Error');
      }
    });
  }

  getAgenciesList(): void {
    this.agencyList = [];
    this.http.get<any[]>(APIS.masterList.agencyList).subscribe({
      next: (res: any) => {
        this.agencyList = res?.data || [];
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to load agencies', 'Error');
      }
    });
  }

  downloadResourceList(): void {
    const linkUrl = APIS.programCreation.downloadResourceData + this.agencyId;
    const link = document.createElement('a');
    link.setAttribute('download', linkUrl);
    link.setAttribute('target', '_blank');
    link.setAttribute('href', linkUrl);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  private initializeDataTableResources(): void {
    this.dataTableResources = new DataTable('#view-table-resource-details', {
      scrollY: '415px',
      scrollX: true,
      scrollCollapse: true,
      autoWidth: true,
      paging: true,
      info: false,
      searching: false,
      destroy: true
    });
  }

  private reinitializeDataTableResources(): void {
    if (this.dataTableResources) {
      this.dataTableResources.destroy();
    }

    setTimeout(() => {
      this.initializeDataTableResources();
    }, 0);
  }

  private getResourceId(item: any): any {
    return item?.resourceId || item?.id;
  }
}
