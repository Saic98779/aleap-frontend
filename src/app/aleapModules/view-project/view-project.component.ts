import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

// declare var $: any;

@Component({
  selector: 'app-view-project',
  templateUrl: './view-project.component.html',
  styleUrls: ['./view-project.component.css']
})
export class ViewProjectComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  selectedProject: any = null;

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

    this.dataTable = $('#view-table-project').DataTable({
      scrollY: '415px',
      scrollX: true,
      scrollCollapse: true,
      paging: true,
      serverSide: true,
      processing: true,
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50],
      autoWidth: true,
      info: true,
      searching: false,
      ajax: (data: any, callback: any) => {
        const page = data.start / data.length;
        const size = data.length;
        const sortColumn = data.order?.[0]?.column;
        const sortDirection = data.order?.[0]?.dir;
        const sortField = data.columns?.[sortColumn]?.data;

        let params = `?page=${page}&size=${size}`;
        if (sortField && sortDirection && sortField !== 'id') {
          params += `&sort=${sortField},${sortDirection}`;
        }

        this._commonService.getDataByUrl(`${APIS.projects.getAll}${params}`).subscribe({
          next: (res: any) => {
            const rows = Array.isArray(res?.data) ? res.data : [];
            const total = typeof res?.totalElements === 'number' ? res.totalElements : rows.length;
            callback({
              draw: data.draw,
              recordsTotal: total,
              recordsFiltered: total,
              data: rows
            });
          },
          error: (err: any) => {
            this.toastrService.error(err?.error?.message || err?.message || 'Failed to load projects', 'Error');
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
          data: 'id',
          render: (data: any, type: any, row: any, meta: any) => meta.settings?._iDisplayStart + meta.row + 1,
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
            <button type="button" class="btn btn-default text-danger btn-sm delete-btn">
              <span class="bi bi-trash"></span>
            </button>
          `,
          className: 'text-center',
          orderable: false
        },
        { data: 'titleOfProject', title: 'Title of the Project' },
        { data: 'fundingAgency', title: 'Funding Agency' },
        { data: 'ministryOrConcernedDepartment', title: 'Ministry/Concerned Department' },
        { data: 'spocDetails', title: 'SPOC from Funding Agency' },
        { data: 'projectCostInLakhs', title: 'Project Cost in Lakhs' },
        {
          data: 'startDate',
          title: 'Start Date',
          render: (data: any) => {
            if (!data) return '-';
            const date = new Date(data);
            return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '-';
          }
        },
        {
          data: 'endDate',
          title: 'End Date',
          render: (data: any) => {
            if (!data) return '-';
            const date = new Date(data);
            return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : '-';
          }
        },
        { data: 'projectHeadAndTeam', title: 'Project Head and Team' },
        { data: 'briefDescription', title: 'Brief Description of the Project' },
        { data: 'projectLocation', title: 'Project Location' },
        { data: 'totalNoOfBeneficiaries', title: 'Total No. of Beneficiaries' },
        { data: 'expectedImpactOrOutcome', title: 'Expected Impact/Outcome' },
{
  data: 'sanctionOrderFilePath',
  title: 'Sanction Orders(Upload List)',
  render: (data: any, type: any, row: any) => {
    if (data) {
      return `
        <a class="btn btn-default text-primary btn-sm file-viewer-btn" data-filepath="${data}" title="View File">
          <span class="bi bi-eye"></span>
        </a>
      `;
    }
    return '-';
  }
},
{
  data: 'beneficiariesUploadFilePath',
  title: 'Beneficiaries List (Upload List)',
  render: (data: any, type: any, row: any) => {
    if (data) {
      return `
        <a class="btn btn-default text-primary btn-sm file-viewer-btn" data-filepath="${data}" title="View File">
          <span class="bi bi-eye"></span>
        </a>
      `;
    }
    return '-';
  }
},

        // {
        //   data: 'sanctionOrderFilePath',
        //   title: 'Sanction Orders(Upload List)',
        //   render: (data: any) => data || '-'
        // },
        // {
        //   data: 'beneficiariesUploadFilePath',
        //   title: 'Beneficiaries List (Upload List)',
        //   render: (data: any) => data || '-'
        // }
      ],
      initComplete: function () {
         $('#view-table-project').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });
           $('#view-table-project').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
         $('#view-table-project').on('click', '.file-viewer-btn', function () {
          const filePath = $(this).data('filepath');
         self.showFileViewer(filePath);
  });
      }
    });
  }

  editRow(item: any) {
    if (!item?.id) {
      this.toastrService.error('Invalid project id', 'Error');
      return;
    }
    this.router.navigate(['/add-project-data-edit', item.id]);
  }

  deleteRow(item: any) {
    console.log('Delete clicked for item:', item);
    if (!item?.id) {
      this.toastrService.error('Invalid project id', 'Error');
      return;
    }

    this.selectedProject = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const item = this.selectedProject;
    if (!item?.id) {
      this.toastrService.error('Invalid project id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.projects.delete, item.id).subscribe({
      next: () => {
        this.toastrService.success('Project Deleted Successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedProject = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastrService.error(err?.error?.message || err?.message || 'Failed to delete project', 'Error');
      }
    });
  }
 // addd by Ramakrishna for common file preview
  showFileViewer(filePath: string) {
    console.log('File path to open:', filePath);

    this._commonService.openFile(filePath);

  }
  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedProject = null;
  }

  ngOnDestroy(): void {
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

}
