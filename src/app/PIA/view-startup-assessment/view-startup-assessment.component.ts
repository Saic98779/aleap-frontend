import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-startup-assessment',
  templateUrl: './view-startup-assessment.component.html'
})
export class ViewStartupAssessmentComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedAssessment: any = null;

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

    this.dataTable = $('#view-table-assessment').DataTable({
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
        this._commonService.getDataByUrl(APIS.startupAssessment.getAll).subscribe({
          next: (res: any) => {
            const rows = this.normalize(res);
            callback({
              draw: data.draw,
              recordsTotal: rows.length,
              recordsFiltered: rows.length,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load assessments', 'Error');
            callback({ draw: data.draw, recordsTotal: 0, recordsFiltered: 0, data: [] });
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
        { data: 'startupName', title: 'Startup' },
        { data: 'founderName', title: 'Founder' },
        { data: 'email', title: 'Email' },
        { data: 'phone', title: 'Phone' },
        { data: 'sectorIndustry', title: 'Sector' },
        { data: 'startupStage', title: 'Stage' },
        { data: 'businessModelType', title: 'Business Model' },
        { data: 'city', title: 'City' },
        { data: 'state', title: 'State' },
        {
          data: 'dateOfEstablishment',
          title: 'Established',
          render: (value: any) => this.formatDate(value)
        }
      ],
      initComplete: function () {
        $('#view-table-assessment').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
        $('#view-table-assessment').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
      }
    });
  }

  editRow(item: any) {
    const id = this.getId(item);
    if (!id) {
      this.toastrService.error('Invalid assessment id', 'Error');
      return;
    }
    this.router.navigate(['/assessment', id]);
  }

  deleteRow(item: any) {
    const id = this.getId(item);
    if (!id) {
      this.toastrService.error('Invalid assessment id', 'Error');
      return;
    }
    this.selectedAssessment = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const id = this.getId(this.selectedAssessment);
    if (!id) {
      this.toastrService.error('Invalid assessment id', 'Error');
      return;
    }
    this._commonService.deleteId(APIS.startupAssessment.delete, id).subscribe({
      next: () => {
        this.toastrService.success('Assessment deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedAssessment = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete assessment', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedAssessment = null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) this.dataTable.destroy();
  }

  private getId(item: any): any {
    return item?.id || item?.assessmentId;
  }

  private normalize(res: any): any[] {
    const data = res?.data ?? res;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.content)) return data.content;
    return data ? [data] : [];
  }

  private formatDate(value: any): string {
    if (!value) return '-';
    const d = new Date(value);
    return isNaN(d.getTime()) ? value : d.toISOString().split('T')[0];
  }
}
