import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html'
})
export class ViewEmployeeComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedEmployee: any = null;

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

    this.dataTable = $('#view-table-employee').DataTable({
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
        this._commonService.getDataByUrl(APIS.employee.getAll).subscribe({
          next: (res: any) => {
            const rows = this.normalizeList(res);
            callback({
              draw: data.draw,
              recordsTotal: rows.length,
              recordsFiltered: rows.length,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load employees', 'Error');
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
            <div class="employee-action-buttons d-inline-flex align-items-center gap-2">
              <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn" title="Edit">
                <span class="bi bi-pencil"></span>
              </button>
              <button type="button" class="btn btn-default text-danger btn-sm delete-btn" title="Delete">
                <span class="bi bi-trash"></span>
              </button>
            </div>
          `,
          className: 'text-center',
          orderable: false
        },
       
        { data: 'name', title: 'Name' },
        { data: 'designation', title: 'Designation' },
        { data: 'gender', title: 'Gender' },
        { data: 'category', title: 'Category' },
        { data: 'educationalQualification', title: 'Educational Qualification' },
        { data: 'phone', title: 'Phone' },
        { data: 'email', title: 'Email' },
        {
          data: 'dateOfJoining',
          title: 'Date of Joining',
          render: (value: any) => this.formatDate(value)
        },
        {
          data: 'dateOfRelieving',
          title: 'Date of Relieving',
          render: (value: any) => this.formatDate(value)
        },
         {
          data: 'photo',
          title: 'Photo',
          className: 'text-center',
          orderable: false,
          render: (value: any) => {
            if (!value) {
              return '-';
            }

            return `
              <a class="btn btn-default text-primary btn-sm file-viewer-btn" data-filepath="${value}" title="View Photo">
                <span class="bi bi-eye"></span>
              </a>
            `;
          }
        },
      ],
      initComplete: function () {
        $('#view-table-employee').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
        $('#view-table-employee').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
        $('#view-table-employee').on('click', '.file-viewer-btn', function () {
          const filePath = $(this).data('filepath');
          self.showFileViewer(filePath);
        });
      }
    });
  }

  editRow(item: any) {
    const employeeId = this.getEmployeeId(item);
    if (!employeeId) {
      this.toastrService.error('Invalid employee id', 'Error');
      return;
    }
    this.router.navigate(['/add-employee-edit', employeeId]);
  }

  deleteRow(item: any) {
    const employeeId = this.getEmployeeId(item);
    if (!employeeId) {
      this.toastrService.error('Invalid employee id', 'Error');
      return;
    }
    this.selectedEmployee = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const employeeId = this.getEmployeeId(this.selectedEmployee);
    if (!employeeId) {
      this.toastrService.error('Invalid employee id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.employee.delete, employeeId).subscribe({
      next: () => {
        this.toastrService.success('Employee deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedEmployee = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete employee', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedEmployee = null;
  }

  showFileViewer(filePath: string) {
    this._commonService.openFile(filePath);
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

  private getEmployeeId(item: any): any {
    return item?.id || item?.employeeId;
  }

  private normalizeList(res: any): any[] {
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
