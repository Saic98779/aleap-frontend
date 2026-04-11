import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-event',
  templateUrl: './view-event.component.html',
  styleUrls: ['./view-event.component.css']
})
export class ViewEventComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedEvent: any = null;

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

    this.dataTable = $('#view-table-event').DataTable({
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
        this._commonService.getDataByUrl(APIS.events.getAll).subscribe({
          next: (res: any) => {
            const rows = this.normalizeEventList(res);
            callback({
              draw: data.draw,
              recordsTotal: rows.length,
              recordsFiltered: rows.length,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load events', 'Error');
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
        { data: 'eventType', title: 'Event Type' },
        { data: 'eventTitle', title: 'Event Title' },
        { data: 'projectName', title: 'Project Name' },
        { data: 'fundingAgency', title: 'Funding Agency' },
        { data: 'implementingAgency', title: 'Implementing Agency' },
        { data: 'programCoordinatorName', title: 'Program Coordinator' },
        { data: 'designation', title: 'Designation' },
        {
          data: 'startDate',
          title: 'Start Date',
          render: (value: any) => this.formatDate(value)
        },
        {
          data: 'endDate',
          title: 'End Date',
          render: (value: any) => this.formatDate(value)
        },
        { data: 'totalDays', title: 'Total Days' },
        { data: 'startTime', title: 'Start Time' },
        { data: 'endTime', title: 'End Time' },
        { data: 'district', title: 'District' },
        { data: 'mandal', title: 'Mandal' },
        { data: 'village', title: 'Village' },
        { data: 'pinCode', title: 'Pin Code' },
        { data: 'totalParticipants', title: 'Total Participants' }
      ],
      initComplete: function () {
        $('#view-table-event').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
        $('#view-table-event').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
      }
    });
  }

  editRow(item: any) {
    const eventId = this.getEventId(item);
    if (!eventId) {
      this.toastrService.error('Invalid event id', 'Error');
      return;
    }

    this.router.navigate(['/add-event-data-edit', eventId]);
  }

  deleteRow(item: any) {
    const eventId = this.getEventId(item);
    if (!eventId) {
      this.toastrService.error('Invalid event id', 'Error');
      return;
    }

    this.selectedEvent = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const eventId = this.getEventId(this.selectedEvent);
    if (!eventId) {
      this.toastrService.error('Invalid event id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.events.delete, eventId).subscribe({
      next: () => {
        this.toastrService.success('Event deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedEvent = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete event', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedEvent = null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  private getEventId(item: any): any {
    return item?.eventId || item?.id;
  }

  private normalizeEventList(res: any): any[] {
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