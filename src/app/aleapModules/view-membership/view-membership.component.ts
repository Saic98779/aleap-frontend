import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-membership',
  templateUrl: './view-membership.component.html'
})
export class ViewMembershipComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedMembership: any = null;

  constructor(
    private router: Router,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService
  ) { }

  ngOnInit(): void {
    this.initializeDataTable();
  }

  initializeDataTable() {
    const self = this;

    this.dataTable = $('#view-table-membership').DataTable({
      scrollY: '415px',
      scrollX: true,
      scrollCollapse: true,
      paging: true,
      processing: true,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      autoWidth: true,
      info: true,
      searching: false,
      ajax: (data: any, callback: any) => {
        this._commonService.getDataByUrl(APIS.membership.getAll).subscribe({
          next: (res: any) => {
            const rows = this.normalizeMembershipList(res);
            callback({
              draw: data.draw,
              recordsTotal: rows.length,
              recordsFiltered: rows.length,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load memberships', 'Error');
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
          render: (row: any, type: any, item: any, meta: any) => meta.row + 1,
          className: 'text-start',
          orderable: false
        },
        {
          data: null,
          title: 'Edit / Delete',
          render: () => `
            <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn me-2" title="Edit">
              <span class="bi bi-pencil"></span>
            </button>
            <button type="button" class="btn btn-default text-danger btn-sm delete-btn" title="Delete">
              <span class="bi bi-trash"></span>
            </button>
          `,
          className: 'text-center',
          orderable: false
        },
        { data: 'name', title: 'Name' },
        { data: 'membershipType', title: 'Type' },
        { data: 'organizationName', title: 'Organization', render: (v: any) => v || '-' },
        { data: 'email', title: 'Email' },
        { data: 'officePhone', title: 'Phone (Off)' },
        { data: 'residencePhone', title: 'Phone (Res)' },
        {
          data: 'amount',
          title: 'Amount (Rs.)',
          render: (value: any) => value != null ? value : '-'
        },
        { data: 'paymentType', title: 'Payment Type' },
        { data: 'billNo', title: 'Bill No.' },
        {
          data: 'applicationDate',
          title: 'Application Date',
          render: (value: any) => this.formatDate(value)
        }
      ],
      initComplete: function () {
        $('#view-table-membership').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
        $('#view-table-membership').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
      }
    });
  }

  editRow(item: any) {
    const membershipId = this.getMembershipId(item);
    if (!membershipId) {
      this.toastrService.error('Invalid membership id', 'Error');
      return;
    }

    this.router.navigate(['/add-membership-data-edit', membershipId]);
  }

  deleteRow(item: any) {
    const membershipId = this.getMembershipId(item);
    if (!membershipId) {
      this.toastrService.error('Invalid membership id', 'Error');
      return;
    }

    this.selectedMembership = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const membershipId = this.getMembershipId(this.selectedMembership);
    if (!membershipId) {
      this.toastrService.error('Invalid membership id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.membership.delete, membershipId).subscribe({
      next: () => {
        this.toastrService.success('Membership deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedMembership = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete membership', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedMembership = null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  private getMembershipId(item: any): any {
    return item?.membershipId || item?.id;
  }

  private normalizeMembershipList(res: any): any[] {
    const data = res?.data ?? res;
    return Array.isArray(data) ? data : data ? [data] : [];
  }

  private formatDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
  }
}
