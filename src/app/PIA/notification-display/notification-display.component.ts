import { Component, OnInit, HostListener } from '@angular/core';
import { CommonServiceService } from '@app/_services/common-service.service';
import { APIS } from '@app/constants/constants';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notification-display',
  templateUrl: './notification-display.component.html',
  styleUrls: ['./notification-display.component.css']
})
export class NotificationDisplayComponent implements OnInit {
  userDetails: any;
  notificationsList: any[] = [];
  notificationCount: number = 0;
  panelOpen = false;

  constructor(private commonService: CommonServiceService,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.userDetails = JSON.parse(sessionStorage.getItem('user') || '{}');
    console.log(this.userDetails);
    if (this.userDetails && this.userDetails.userId) {
      this.getNotifications();
    }
  }

togglePanel() {
  this.getNotifications()
  if (!this.panelOpen) {
    this.panelOpen = true;
    this.markAllAsRead();
  } else {
    this.panelOpen = false;
  }
}
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-bell-container') && !target.closest('.notification-popup')) {
      this.panelOpen = false;
    }
  }

  getNotifications() {
    // CALL_CENTER
    let url:any= ''
    if(this.userDetails.userRole=='AGENCY_MANAGER' || this.userDetails.userRole=='AGENCY_EXECUTOR'){ 
        url=APIS.notificationDisplay.getNotificationDisplayByRole + 'AGENCY'
    }
    else{
        url=APIS.notificationDisplay.getNotificationDisplayByRole+this.userDetails.userRole;
    }
    
    this.commonService.getDataByUrl(url)
      .subscribe((res: any) => {
        if (res && res.data['messages'].length > 0) {
          this.notificationsList = res.data['messages'];
          this.notificationCount = this.notificationsList.length;
        } else {
          this.notificationsList = [];
          this.notificationCount = 0;
        }
      }, (err: any) => {
        console.log(err);
      });
  }

  markAllAsRead() {
    
    const recipientIds = this.notificationsList.map(n => n.id);
    const objArray = recipientIds.map(id => ({ id }));
    // this.notificationsList.forEach(n => n.readRecipients = true);
    this.notificationCount = 0;
    let url= APIS.notificationDisplay.markAsRead;
    this.commonService.patchData(url, objArray)
      .subscribe((res: any) => {
        this.notificationCount = 0;
        console.log('All notifications marked as read',res);
      }, (err: any) => {
        console.log(err);
      });
    
  }
  openNotificationDetail(notification: any) {
    // Add Router to constructor
    this.panelOpen = false;
  this.router.navigate(['/notification-viewer-update']).then(() => {
    this.commonService.triggerRefresh(); // trigger refresh after navigation
  });
}
}
