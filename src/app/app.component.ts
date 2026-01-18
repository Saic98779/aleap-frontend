import { Component, Directive, HostListener, Input, TemplateRef, ViewContainerRef } from '@angular/core';

import { AuthenticationService } from './_services';
import { User, Role } from './_models';
import { IdleTimeoutService } from './_services/idle-timeout.service';
import { CommonServiceService } from './_services/common-service.service';

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent {
    user?: User | null;
    Role = Role
    agencyData:any
    constructor(private authenticationService: AuthenticationService,
        private idleService: IdleTimeoutService,private _commonService: CommonServiceService,
    ) {
        this.authenticationService.user.subscribe(x => this.user = x);
        this.agencyData = JSON.parse(sessionStorage.getItem('user') || '{}')
    console.log(this.agencyData,'agency',this.user,Role)
    }

    get isAdmin() {
        return this.user?.userRole === Role.Admin;
    }
     clearOutcomes(){
        this._commonService.setOption('mobileNumberForNonParticipant', null);
    }
    ClearNonTrainingTargetsSession(){
        this._commonService.setOption('subActivityId', null);
    }
    clearSession(){
        sessionStorage.removeItem('selectAgecytoOutpuAchievements');
    }
// This is to handle the submenu toggle functionality --added by upendranath reddy || 27th july 2025
    menuOpen = false;
openSubMenus: {[key: string]: boolean} = {};

    // Listen for clicks anywhere on the document
    @HostListener('document:click', ['$event'])
    onDocumentClick(event: MouseEvent) {
        const target = event.target as HTMLElement;
        const menuContainer = target.closest('.nav-item.dropdown');
        
        // If click is outside the menu container, close the menu
        if (!menuContainer && this.menuOpen) {
            this.menuOpen = false;
            // Also close all submenus
            Object.keys(this.openSubMenus).forEach(key => {
                this.openSubMenus[key] = false;
            });
        }
    }
 // Prevent menu from closing when clicking inside
    onMenuClick(event: Event) {
        event.stopPropagation();
    }
toggleSubMenu(menu: string, event: Event) {
  event.preventDefault();
  event.stopPropagation();
  // If the submenu is already open, close it. Otherwise, close all and open the clicked one.
  if (this.openSubMenus[menu]) {
    this.openSubMenus[menu] = false;
  } else {
    Object.keys(this.openSubMenus).forEach(key => {
      this.openSubMenus[key] = false;
    });
    this.openSubMenus[menu] = true;
  }
}

    logout() {
        this.authenticationService.logout();
        sessionStorage.removeItem('user');
    }
    isMainDropdownOpen = false;
private dropdownTimeout: any;

    openMainDropdown() {
  if (this.dropdownTimeout) {
    clearTimeout(this.dropdownTimeout);
  }
  this.isMainDropdownOpen = true;
}

closeMainDropdown() {
  this.dropdownTimeout = setTimeout(() => {
    this.isMainDropdownOpen = false;
    // Close all submenus when main dropdown closes
    // this.openSubMenus = {};
  }, 200); // Small delay to prevent flickering
}
}

@Directive({
    selector: '[appHasRole]'
})
export class HasRoleDirective {
    private roles: Role[] = [];
    

    constructor(
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef,
        private authenticationService: AuthenticationService
    ) {
        this.authenticationService.user.subscribe(user => {
            this.updateView(user);
        });
    }

    @Input()
    set appHasRole(roles: Role[]) {
        this.roles = roles;
        this.updateView(this.authenticationService.userValue);
    }

    private updateView(user: User | null) {
        if (user && this.roles.includes(user.userRole)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
    // 
    

   
}