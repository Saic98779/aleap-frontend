import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';

@Component({
  selector: 'app-view-registration-new',
  templateUrl: './view-registration-new.component.html',
  styleUrls: ['./view-registration-new.component.css']
})
export class ViewRegistrationNewComponent implements OnInit, OnDestroy {
  @ViewChild('deleteConfirmModal') deleteConfirmModal!: ElementRef;
  @ViewChild('previewModal') previewModal!: ElementRef;

  dataTable: any;
  deleteModalRef: any;
  previewModalRef: any;
  selectedRegistration: any = null;
  previewData: any = null;

  readonly previewSections = [
    {
      title: 'Personal Details',
      fields: [
        { label: 'Name', key: 'name' },
        { label: 'Father / Husband Name', key: 'fatherOrHusbandName' },
        { label: 'Date of Birth', key: 'dateOfBirth' },
        { label: 'Age', key: 'age' },
        { label: 'Qualification', key: 'qualification' },
        { label: 'Email', key: 'emailId' },
        { label: 'Phone No.', key: 'phoneNo' },
        { label: 'Alternate Phone No.', key: 'alternatePhoneNo' }
      ]
    },
    {
      title: 'Demographics',
      fields: [
        { label: 'Gender', key: 'gender' },
        { label: 'Caste', key: 'caste' },
        { label: 'Disability', key: 'disability' }
      ]
    },
    {
      title: 'Address',
      fields: [
        { label: 'Door No.', key: 'doorNo' },
        { label: 'Street Name', key: 'streetName' },
        { label: 'Village', key: 'village' },
        { label: 'Panchayat Name', key: 'panchayatName' },
        { label: 'Mandal', key: 'mandal' },
        { label: 'District', key: 'district' },
        { label: 'State', key: 'state' },
        { label: 'Pincode', key: 'pincode' }
      ]
    },
    {
      title: 'Identification',
      fields: [
        { label: 'Aadhaar No.', key: 'aadharNo' },
        { label: 'PAN Card', key: 'panCard' }
      ]
    },
    {
      title: 'SHG Details',
      fields: [
        { label: 'SHG / Society Name', key: 'shgName' },
        { label: 'Years in SHG', key: 'yearsSpentInShg' },
        { label: 'SHG Leader Name', key: 'shgLeaderName' },
        { label: 'Position in SHG', key: 'positionInShg' },
        { label: 'Mandal Federation Name', key: 'mandalFederationName' },
        { label: 'Name of V.O', key: 'voName' }
      ]
    },
    {
      title: 'Income & Aspirations',
      fields: [
        { label: 'Source of Income', key: 'sourceOfIncome' },
        { label: 'Primary Skill', key: 'skills' },
        { label: 'Willing to Start/Expand Business', key: 'willingToStartBusiness' },
        { label: 'Business Type', key: 'businessType' },
        { label: 'Available for Training', key: 'availableForTraining' },
        { label: 'Work with MSME Counselors', key: 'willingToWorkWithMsme' }
      ]
    }
  ];

  constructor(
    private _commonService: CommonServiceService,
    private toastr: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeDataTable();
  }

  initializeDataTable() {
    const self = this;

    this.dataTable = $('#view-registration-new-table').DataTable({
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

        this._commonService.getDataByUrl(`${APIS.questionnaire.list}${params}`).subscribe({
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
            this.toastr.error(err?.error?.message || err?.message || 'Failed to load registrations', 'Error');
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
          title: 'Actions',
          render: () => `
            <button type="button" class="btn btn-default text-primary btn-sm preview-btn me-2" title="Preview">
              <span class="bi bi-eye"></span>
            </button>
            <button type="button" class="btn btn-default text-lime-green btn-sm edit-btn me-2">
              <span class="bi bi-pencil"></span>
            </button>
            <button type="button" class="btn btn-default text-danger btn-sm delete-btn">
              <span class="bi bi-trash"></span>
            </button>
          `,
          className: 'text-center',
          orderable: false
        },
        { data: 'name', title: 'Name' },
        { data: 'fatherOrHusbandName', title: 'Father / Husband Name' },
        {
          data: 'phoneNo',
          title: 'Phone No.',
          render: (data: any) => data ?? ''
        },
        { data: 'emailId', title: 'Email' },
        { data: 'gender', title: 'Gender' },
        { data: 'caste', title: 'Caste' },
        {
          data: 'disability',
          title: 'Disability',
          render: (data: any) => (data === true ? 'Yes' : data === false ? 'No' : '')
        },
        { data: 'district', title: 'District' },
        { data: 'state', title: 'State' }
      ],
      initComplete: function () {
        $('#view-registration-new-table').on('click', '.preview-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.openPreview(rowData);
        });

        $('#view-registration-new-table').on('click', '.edit-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.editRow(rowData);
        });

        $('#view-registration-new-table').on('click', '.delete-btn', function () {
          const rowData = self.dataTable.row($(this).parents('tr')).data();
          self.deleteRow(rowData);
        });
      }
    });
  }

  openPreview(item: any) {
    if (!item) {
      this.toastr.error('No data available for preview', 'Error');
      return;
    }
    this.previewData = item;
    this.previewModalRef = new (window as any).bootstrap.Modal(this.previewModal.nativeElement);
    this.previewModalRef.show();
  }

  closePreviewModal() {
    this.previewModalRef?.hide();
    this.previewData = null;
  }

  editRow(item: any) {
    if (!item?.id) {
      this.toastr.error('Invalid registration id', 'Error');
      return;
    }
    this.router.navigateByUrl('/Registration/' + item.id);
  }

  deleteRow(item: any) {
    if (!item?.id) {
      this.toastr.error('Invalid registration id', 'Error');
      return;
    }

    this.selectedRegistration = item;
    this.deleteModalRef = new (window as any).bootstrap.Modal(this.deleteConfirmModal.nativeElement);
    this.deleteModalRef.show();
  }

  confirmDelete() {
    const item = this.selectedRegistration;
    if (!item?.id) {
      this.toastr.error('Invalid registration id', 'Error');
      return;
    }

    this._commonService.deleteId(APIS.questionnaire.delete, item.id).subscribe({
      next: () => {
        this.toastr.success('Registration deleted successfully', 'Success');
        this.deleteModalRef?.hide();
        this.selectedRegistration = null;
        this.dataTable?.ajax?.reload(null, false);
      },
      error: (err: any) => {
        this.toastr.error(err?.error?.message || err?.message || 'Failed to delete registration', 'Error');
      }
    });
  }

  closeDeleteModal() {
    this.deleteModalRef?.hide();
    this.selectedRegistration = null;
  }

  getFieldPairs(fields: Array<{ label: string; key: string }>): Array<[any, any?]> {
    const pairs: Array<[any, any?]> = [];
    for (let i = 0; i < fields.length; i += 2) {
      pairs.push([fields[i], fields[i + 1]]);
    }
    return pairs;
  }

  formatFieldValue(key: string) {
    const value = this.previewData?.[key as keyof typeof this.previewData];
    if (value === true) return 'Yes';
    if (value === false) return 'No';
    if (key === 'dateOfBirth' && value) {
      const date = new Date(value as string);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    }
    if (value === null || value === undefined || value === '') return '-';
    return value;
  }

  formatList(list?: string[]) {
    return list && list.length ? list.join(', ') : '-';
  }

  ngOnDestroy(): void {
    $('#view-registration-new-table').off('click', '.preview-btn');
    $('#view-registration-new-table').off('click', '.edit-btn');
    $('#view-registration-new-table').off('click', '.delete-btn');
    if (this.dataTable) {
      this.dataTable.destroy();
    }
  }

}
