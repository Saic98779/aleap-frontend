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
          title: 'Actions',
          render: (r: any, t: any, item: any) => {
            const isDraft = item?.formStage === 'PENDING';
            const editTitle = isDraft ? 'Continue Editing' : 'Edit';
            const editIcon = isDraft ? 'bi-pencil-square' : 'bi-pencil';
            return `
              <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn me-2" title="${editTitle}">
                <span class="bi ${editIcon}"></span>
              </button>
              <button type="button" class="btn btn-default text-danger btn-sm delete-btn" title="Delete">
                <span class="bi bi-trash"></span>
              </button>
            `;
          },
          className: 'text-center',
          orderable: false
        },
        {
          data: null,
          title: 'Status',
          render: (r: any, t: any, item: any) => {
            const stage = item?.formStage;
            if (stage === 'COMPLETED') return '<span class="badge bg-success">COMPLETED</span>';
            if (stage === 'PENDING') return '<span class="badge bg-warning text-dark">DRAFT</span>';
            return '-';
          },
          className: 'text-center'
        },
        { data: null, title: 'Startup', render: (r: any, t: any, item: any) => item?.startupName || '-' },
        { data: null, title: 'Founder', render: (r: any, t: any, item: any) => item?.founderName || '-' },
        { data: null, title: 'Email', render: (r: any, t: any, item: any) => item?.email || '-' },
        { data: null, title: 'Phone', render: (r: any, t: any, item: any) => item?.phone || '-' },
        { data: null, title: 'Sector', render: (r: any, t: any, item: any) => item?.sectorIndustry || '-' },
        { data: null, title: 'Stage', render: (r: any, t: any, item: any) => item?.startupStage || '-' },
        { data: null, title: 'Business Model', render: (r: any, t: any, item: any) => item?.businessModelType || '-' },
        { data: null, title: 'City', render: (r: any, t: any, item: any) => item?.city || '-' },
        { data: null, title: 'State', render: (r: any, t: any, item: any) => item?.state || '-' },
        { data: null, title: 'Established', render: (r: any, t: any, item: any) => this.formatDate(item?.dateOfEstablishment) }
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
