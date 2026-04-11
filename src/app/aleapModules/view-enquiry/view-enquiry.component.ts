import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-enquiry',
  templateUrl: './view-enquiry.component.html'
})
export class ViewEnquiryComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedEnquiry: any = null;

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

    this.dataTable = $('#view-table-enquiry').DataTable({
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
        this._commonService.getDataByUrl(APIS.enquiry.getAll).subscribe({
          next: (res: any) => {
            const rows = this.normalizeEnquiryList(res);
            callback({
              draw: data.draw,
              recordsTotal: rows.length,
              recordsFiltered: rows.length,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load enquiries', 'Error');
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
        { data: 'walkInName', title: 'Walk-In Name' },
        { data: 'whatsappNumber', title: 'WhatsApp Number' },
        { data: 'email', title: 'Email' },
        { data: 'startupOrCompanyName', title: 'Startup / Company' },
        {
          data: 'sectors',
          title: 'Sectors',
          render: (value: any) => this.formatList(value)
        },
        { data: 'stage', title: 'Stage' },
        {
          data: 'incubationSupportRequired',
          title: 'Incubation Support Required',
          render: (value: any) => value ? 'Yes' : 'No'
        },
        {
          data: 'supportServicesRequired',
          title: 'Support Services Required',
          render: (value: any) => this.formatList(value)
        },
        {
          data: 'formReceivedDate',
          title: 'Form Received Date',
          render: (value: any) => this.formatDate(value)
        },
        { data: 'officialName', title: 'Official Name' }
      ],
      initComplete: function () {
        $('#view-table-enquiry').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
        $('#view-table-enquiry').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
      }
    });
  }

  editRow(item: any) {
    const enquiryId = this.getEnquiryId(item);
    if (!enquiryId) {
      this.toastrService.error('Invalid enquiry id', 'Error');
      return;
    }

    this.router.navigate(['/add-enquiry-data-edit', enquiryId]);
  }

  deleteRow(item: any) {
    const enquiryId = this.getEnquiryId(item);
    if (!enquiryId) {
      this.toastrService.error('Invalid enquiry id', 'Error');
      return;
    }

    this.selectedEnquiry = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const enquiryId = this.getEnquiryId(this.selectedEnquiry);
    if (!enquiryId) {
      this.toastrService.error('Invalid enquiry id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.enquiry.delete, enquiryId).subscribe({
      next: () => {
        this.toastrService.success('Enquiry deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedEnquiry = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete enquiry', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedEnquiry = null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  private getEnquiryId(item: any): any {
    return item?.enquiryId || item?.id;
  }

  private normalizeEnquiryList(res: any): any[] {
    const data = res?.data ?? res;
    return Array.isArray(data) ? data : data ? [data] : [];
  }

  private formatList(value: any): string {
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return value || '-';
  }

  private formatDate(value: any): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);
    return isNaN(date.getTime()) ? value : date.toISOString().split('T')[0];
  }
}
