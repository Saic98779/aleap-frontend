import { AfterViewInit, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { ToastrService } from 'ngx-toastr';
import DataTable from 'datatables.net-dt';
import 'datatables.net-buttons-dt';
import 'datatables.net-responsive-dt';
declare var $: any;


@Component({
  selector: 'app-user-registration',
  templateUrl: './user-registration.component.html',
  styleUrls: ['./user-registration.component.css']
})
export class UserRegistrationComponent implements OnInit,AfterViewInit {

  constructor( private fb: FormBuilder,
    private toastrService: ToastrService,
    private _commonService: CommonServiceService,
    private router: Router,) { }

    RegisterForm!: FormGroup;
    agencyList: any = [];
    userList:any;
    ngOnInit(): void {
      this.formDetails();
      this.getAgenciesList()
      this.getAllUsersList()
    }
    ngAfterViewInit() {
      // setTimeout(() => {
      //   new DataTable('#view-table', {              
      //   // scrollX: true,
      //   // scrollCollapse: true,    
      //   // responsive: true,    
      //   // paging: true,
      //   // searching: true,
      //   // ordering: true,
      //   scrollY: "415px",     
      //   scrollX:        true,
      //   scrollCollapse: true,
      //   autoWidth:         true,  
      //   paging:         false,  
      //   info: false,   
      //   searching: false,  
      //   destroy: true, // Ensure reinitialization doesn't cause issues
      //   });
      // }, 500);
    }
    get f2() {
      return this.RegisterForm.controls;
    }
    formDetails() {
      this.RegisterForm  = new FormGroup({
        // date: new FormControl("", [Validators.required]),
        firstName: new FormControl("", [Validators.required]),
        lastName: new FormControl("",[Validators.required,]),
        email: new FormControl("", [Validators.required, Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)]),
        // noOfDays: new FormControl("", [Validators.required,]),        
        mobile: new FormControl("", [
          Validators.required,
          Validators.pattern(/^[0-9]{10}$/)
        ]),
        userRole: new FormControl("",[Validators.required,]),
        department: new FormControl(""),
        gender: new FormControl("",[Validators.required,]),
      });

      this.RegisterForm.get('userRole')?.valueChanges.subscribe(value => {
        this.onUserRoleChange(value);
      });
    }

    onUserRoleChange(value: string) {
      const departmentControl = this.RegisterForm.get('department');
      if (value === 'ADMIN' || value === 'CALL_CENTER' || value === 'DEPARTMENT') {
        departmentControl?.setValue('Commissionarate of Industries');
        departmentControl?.disable();
      } else if (value === 'AGENCY_MANAGER' || value === 'AGENCY_EXECUTOR' || value === 'DATA_ENTRY') {
        departmentControl?.setValue('');
        departmentControl?.enable();
      } else if (value === 'SPIU') {
        departmentControl?.setValue('GT');
        departmentControl?.disable();
      }else {
        departmentControl?.setValue('');
        departmentControl?.disable();
      }
    }

    onModalSubmitRegister(){
      if(this.RegisterForm.invalid){
        return;
      }
      
      let url = '';
      let payload = {};
      if(this.RegisterForm.value.userRole === 'ADMIN' 
        || this.RegisterForm.value.userRole === 'CALL_CENTER'
        || this.RegisterForm.value.userRole === 'DEPARTMENT'
        || this.RegisterForm.value.userRole === 'FINANCE'
        || this.RegisterForm.value.userRole === 'DIC'
        || this.RegisterForm.value.userRole === 'SPIU') {
        url = APIS.userRegistration.add;
        payload = {
          "mobileNo": this.RegisterForm.value.mobile,
          "email": this.RegisterForm.value.email,
          "firstName": this.RegisterForm.value.firstName,
          "lastName": this.RegisterForm.value.lastName,
          "userRole": this.RegisterForm.value.userRole,
          "password": "Password@123",
          "gender": this.RegisterForm.value.gender
        }
      }else {
        url = APIS.userRegistration.addAgent;
        payload = {
          "mobileNo": this.RegisterForm.value.mobile,
          "email": this.RegisterForm.value.email,
          "firstName": this.RegisterForm.value.firstName,
          "lastName": this.RegisterForm.value.lastName,
          "userRole": this.RegisterForm.value.userRole,
          "gender": this.RegisterForm.value.gender,
          "password": "Password@123",
          "agencyId": this.RegisterForm.value.department
        }
      }
      console.log(payload,url);
      this._commonService.add(url, payload).subscribe((res: any) => {
        this.RegisterForm.reset();
        this.toastrService.success('User Registered Successfully', 'Success');
        this.getAllUsersList()
        // this.router.navigate(['/user-registration']);
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }

    getAgenciesList() {
      this.agencyList = [];
      this._commonService.getDataByUrl(APIS.masterList.agencyList).subscribe((res: any) => {
        this.agencyList = res.data;
      }, (error) => {
        this.toastrService.error(error.error.message);
      });
    }

    getAllUsersList() {
      this.userList = '';
      this._commonService.getDataByUrl(APIS.masterList.getUserList).subscribe({
        next: (dataList: any) => {
          this.userList = dataList.data
          console.log(this.userList);
          
        },error: (error: any) => {
          console.log(error);

        }
      });
    }

}
