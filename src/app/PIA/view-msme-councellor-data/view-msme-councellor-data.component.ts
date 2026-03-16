import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import DataTable from 'datatables.net-dt';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-view-msme-councellor-data',
  templateUrl: './view-msme-councellor-data.component.html',
  styleUrls: ['./view-msme-councellor-data.component.css']
})
export class ViewMsmeCouncellorDataComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  agencyId: any;
  dataTable: any;
  submitedData: any[] = [];
  deleteModalRef: any;
  selectedCounsellor: any = null;

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) {
      this.agencyId = JSON.parse(sessionStorage.getItem('user') || '{}').agencyId;
    }

  ngOnInit(): void {
    this.getData();
  }

  getData() {
    this.submitedData = [];

    this._commonService.getDataByUrl(APIS.counsellerData.getData).subscribe({
      next: (res: any) => {
        this.submitedData = Array.isArray(res?.data) ? res.data : [];
        this.reinitializeDataTable();
      },
      error: (err) => {
        this.toastrService.error(err?.message || 'Failed to load Counseller data', 'Counseller Data Error!');
        new Error(err);
      },
    });
  }

  reinitializeDataTable() {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
    setTimeout(() => {
      this.initializeDataTable();
    }, 0);
  }

  initializeDataTable() {
    this.dataTable = new DataTable('#view-table-Counseller', {
      scrollY: '415px',
      scrollX: true,
      scrollCollapse: true,
      autoWidth: true,
      paging: true,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      info: true,
      searching: false,
      destroy: true,
    });
  }

  editRow(item: any) {
    const id = this.getCounsellorId(item);
    if (!id) {
      this.toastrService.error('Invalid counsellor id', 'Error');
      return;
    }

    this.router.navigate(['/MSME-councellor-registeration', id], {
      state: { counsellorData: item }
    });
  }

  deleteRow(item: any) {
    const id = this.getCounsellorId(item);
    if (!id) {
      this.toastrService.error('Invalid counsellor id', 'Error');
      return;
    }

    this.selectedCounsellor = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const id = this.getCounsellorId(this.selectedCounsellor);
    if (!id) {
      this.toastrService.error('Invalid counsellor id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.counsellerData.delete, id).subscribe({
      next: () => {
        this.toastrService.success('Counseller Data Deleted Successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedCounsellor = null;
        this.getData();
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete Counseller data', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedCounsellor = null;
  }

  getCounsellorId(item: any): number | null {
    const id = item?.counsellorRegistrationId ?? item?.id;
    return id ? Number(id) : null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

}
