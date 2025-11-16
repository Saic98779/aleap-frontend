import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonServiceService } from '../../_services/common-service.service';
import { Ticket } from '../../_models/ticket.model';
import { APIS, API_BASE_URL } from '../../constants/constants';
import { ToastrService } from 'ngx-toastr';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { tick } from '@angular/core/testing';

declare var bootstrap: any;
declare var $: any;

@Component({
  selector: 'app-help-support',
  templateUrl: './help-support.component.html',
  styleUrls: ['./help-support.component.css']
})
export class HelpSupportComponent implements OnInit {
  activeTab:any;
 
  
  constructor(
  ) {
  
     
  }

  ngOnInit(): void {
    this.activeTab = 'nav-twos';
   
  }
  onTabChange(activeTab:any){
    this.activeTab = activeTab;
  }
}