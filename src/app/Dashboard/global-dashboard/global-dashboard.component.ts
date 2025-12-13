import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  selector: 'app-global-dashboard',
  templateUrl: './global-dashboard.component.html',
  styleUrls: ['./global-dashboard.component.css']
})
export class GlobalDashboardComponent implements OnInit {

  url:any
  cacheBuster = new Date().getTime();
  loginsessionDetails: any;
  constructor(
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.loginsessionDetails = JSON.parse(sessionStorage.getItem('user') || '{}');  
    //console.log('https://lookerstudio.google.com/embed/reporting/fcab1a0e-f906-4487-85fa-8097553cbc4b/page/p_iqwy179urd')
    // this.url = this.sanitizer
    // .bypassSecurityTrustResourceUrl('https://lookerstudio.google.com/embed/reporting/fcab1a0e-f906-4487-85fa-8097553cbc4b/page/p_iqwy179urd?cache=' + this.cacheBuster);
    this.setDashboardUrl();
  }


  setDashboardUrl(): void {
    console.log('Agency Name:', this.loginsessionDetails.agencyName, 'User Role:', this.loginsessionDetails.userRole,this.loginsessionDetails);
    if(this.loginsessionDetails.userRole!=='AGENCY_MANAGER' && this.loginsessionDetails.userRole!=='AGENCY_EXECUTOR' && this.loginsessionDetails.userRole!=='CALL_CENTER'){
      if(this.loginsessionDetails.userRole === 'ADMIN' || this.loginsessionDetails.userRole === 'FINANCE' || this.loginsessionDetails.userRole === 'SPIU'){
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/609011ae-c72d-4c66-805f-2468db0fd392/page/8ewJF?cache=' + this.cacheBuster
        );
      }
      else if(this.loginsessionDetails.userRole === 'DIC'){
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/5cf1dd6a-18ad-454c-a9cf-bfd20c88c853/page/68eiF?cache=' + this.cacheBuster
        );
      }
      else{
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/609011ae-c72d-4c66-805f-2468db0fd392/page/8ewJF?cache=' + this.cacheBuster
        );
      }
      //  https://lookerstudio.google.com/embed/reporting/5cf1dd6a-18ad-454c-a9cf-bfd20c88c853/page/68eiF

    }
    else{
        switch (this.loginsessionDetails.agencyName) {      
      case 'ALEAP':
        //https://lookerstudio.google.com/embed/reporting/e52e2113-3d3a-4941-a7f3-57d9971064c4/page/rwZEF
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/b6183e79-9898-4ee4-8e0d-093acdd31eb1/page/IN1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TiHCL_05':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/9c242826-10db-47ad-bed2-e7c26cef061f/page/BC1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CoDe_IITH':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/28bb939f-6515-4c3f-9d32-373e776abf5f/page/5I1JF?cache=' + this.cacheBuster
        );
        break;
      case 'RICH_6A':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/9ee47492-c81f-4a8c-8399-b7a5e7a3cb07/page/9I1JF?cache=' + this.cacheBuster
        );
        break;
      case 'RICH_6B':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/0fc26c50-8a20-4f58-b682-232402448cc0/page/CJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CITD_11':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/d7b3269a-10ae-4c3b-a4f7-b7c92b7edfd9/page/EJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CIPET_!!':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/43d20efb-3e99-411a-af32-908742076b8f/page/OJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'NIMSME':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/d5c421d2-d85a-4b3f-b2e7-744a318ba0b2/page/TJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TGTPC-4':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/91ce7d1d-fe3a-4670-8454-004cc1af1b78/page/JN1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TGTPC-10':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/2928b46e-b266-43c4-8d29-2f41e094517e/page/LN1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TiHCL_05':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/9c242826-10db-47ad-bed2-e7c26cef061f/page/BC1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CoDe_IITH':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/28bb939f-6515-4c3f-9d32-373e776abf5f/page/5I1JF?cache=' + this.cacheBuster
        );
        break;
      case 'RICH_6A':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/9ee47492-c81f-4a8c-8399-b7a5e7a3cb07/page/9I1JF?cache=' + this.cacheBuster
        );
        break;
      case 'RICH_6B':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/0fc26c50-8a20-4f58-b682-232402448cc0/page/CJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CITD_11':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/d7b3269a-10ae-4c3b-a4f7-b7c92b7edfd9/page/EJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'CIPET_!!':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/43d20efb-3e99-411a-af32-908742076b8f/page/OJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'NIMSME':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/d5c421d2-d85a-4b3f-b2e7-744a318ba0b2/page/TJ1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TGTPC-4':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/91ce7d1d-fe3a-4670-8454-004cc1af1b78/page/JN1JF?cache=' + this.cacheBuster
        );
        break;
      case 'TGTPC-10':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/2928b46e-b266-43c4-8d29-2f41e094517e/page/LN1JF?cache=' + this.cacheBuster
        );
        break;
      case 'WeHub':
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/98604721-c7de-42b5-9fb0-966ef782aa10/page/RJ1JF?cache=' + this.cacheBuster
        );
        break;
      default:
        this.url = this.sanitizer.bypassSecurityTrustResourceUrl(
          'https://lookerstudio.google.com/embed/reporting/609011ae-c72d-4c66-805f-2468db0fd392/page/8ewJF?cache=' + this.cacheBuster
        );
    }

     
    }

  
  }
  // this.url = this.sanitizer
  //   .bypassSecurityTrustResourceUrl('https://lookerstudio.google.com/embed/reporting/fcab1a0e-f906-4487-85fa-8097553cbc4b/pages/p_iqwy179urd?cache=' + this.cacheBuster);
  
  //https://lookerstudio.google.com/embed/reporting/e52e2113-3d3a-4941-a7f3-57d9971064c4/page/rwZEF
  //https://lookerstudio.google.com/reporting/fcab1a0e-f906-4487-85fa-8097553cbc4b

}
