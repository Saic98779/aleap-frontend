import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { first } from 'rxjs/operators';

import { AuthenticationService } from '@app/_services';
import { Role } from '@app/_models/role';

@Component({ templateUrl: 'login.component.html' })
export class LoginComponent implements OnInit {
    loginForm!: FormGroup;
    loading = false;
    submitted = false;
    error = '';
    passwordshowConfirm: Boolean=false;
    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private authenticationService: AuthenticationService,
        
    ) {
        // redirect to home if already logged in
        if (this.authenticationService.userValue) {
            this.router.navigate(['/program-creation']);
        }
    }

    ngOnInit() {
       
        this.loginForm = this.formBuilder.group({
            username: ['', [Validators.required, Validators.email]],
            password: ['', Validators.required]
        });
    }
  
    // convenience getter for easy access to form fields
    get f() { return this.loginForm.controls; }

    onSubmit() {
        this.submitted = true;
        
        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }

        this.loading = true;
        this.authenticationService.login(this.f.username.value, this.f.password.value)
            .pipe(first())
            .subscribe({
                next: (res) => {
                    //this.router.navigateByUrl('/program-creation');
                    this.loading = false;
                            sessionStorage.setItem('user', JSON.stringify(res.data));
                            if(res?.data.userRole === Role.Admin || res?.data.userRole === Role.SPIU){
                                if(res?.data?.userId=='districts@gmail.com'){
                                this.router.navigateByUrl('/ViewPrograms-district-wise'); 
                                }
                                else{
                                    this.router.navigateByUrl('/veiw-program');
                                }     
                        }
                         else if(res?.data.userRole === Role.DATA_ENTRY
                        ) {
                            this.router.navigateByUrl('/veiw-program-creation');
                        }
                        else if(res?.data.userRole === Role.AGENCY_MANAGER
                            || res?.data.userRole === Role.AGENCY_EXECUTOR
                        ){
                            this.router.navigateByUrl('/program-creation');
                        }
                        else if(res?.data.userRole === Role.CALL_CENTER
                        ) {
                            this.router.navigateByUrl('/participant-details');
                        }
                         else if(res?.data.userRole === Role.DEVELOPER) {
                            //   if(res.data.userId=='sample@gmail.com'){
                            //     this.router.navigateByUrl('/sample-screen-ui');
                            //     return;
                            // }
                            this.router.navigateByUrl('/help-support');
                        }
                          else if(res?.data.userRole === Role.DIC) {
                            this.router.navigateByUrl('/veiw-program-dic');
                        }
                        else if(res?.data.userRole === Role.FINANCE) {
                            this.router.navigateByUrl('/expenditure-verification');
                        }
                        else{
                            this.router.navigateByUrl('/global-dashboard');
                        }
                },
                error: error => {
                    console.log('error:', error);
                    this.error = error;
                    this.loading = false;
                }
            });
    }
}
