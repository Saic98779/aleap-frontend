import { Component, Directive, HostListener, Input, OnDestroy, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, Router } from '@angular/router';

import { AuthenticationService } from './_services';
import { User, Role } from './_models';
import { IdleTimeoutService } from './_services/idle-timeout.service';

declare global {
    interface Window {
        googleTranslateElementInit: () => void;
        google: any;
    }
}

@Component({ selector: 'app-root', templateUrl: 'app.component.html' })
export class AppComponent implements OnInit, OnDestroy {
    user?: User | null;
    Role = Role
    agencyData:any
        selectedLanguage = 'en';
        private readonly translateScriptId = 'google-translate-script';
    sidebarCollapsed = false;
    isMobileView = false;
    mobileSidebarOpen = false;
    isMenuLoading = false;
    private loaderTimeoutId?: ReturnType<typeof setTimeout>;
    constructor(private authenticationService: AuthenticationService,
        private idleService: IdleTimeoutService,
        private router: Router
    ) {
        this.authenticationService.user.subscribe(x => this.user = x);
        this.agencyData = JSON.parse(sessionStorage.getItem('user') || '{}')
        this.updateViewportState();
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.stopMenuLoader();
                this.closeMobileSidebar();
            }
        });
    console.log(this.agencyData,'agency',this.user,Role)
    }

    ngOnInit(): void {
        this.selectedLanguage = localStorage.getItem('app_lang') || 'en';
        this.loadGoogleTranslateScript();
    }

    ngOnDestroy(): void {
    }

    get isAdmin() {
        return this.user?.userRole === Role.Admin;
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

    @HostListener('window:resize')
    onWindowResize() {
        this.updateViewportState();
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

closeAllSubMenus() {
    Object.keys(this.openSubMenus).forEach(key => {
        this.openSubMenus[key] = false;
    });
}

toggleSidebar() {
    if (this.isMobileView) {
        this.mobileSidebarOpen = !this.mobileSidebarOpen;
        return;
    }
    this.sidebarCollapsed = !this.sidebarCollapsed;
}

onSidebarNavigation(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const clickedRouteLink = target.closest('a[routerLink]');
    if (clickedRouteLink) {
        this.startMenuLoader();
        this.closeMobileSidebar();
    }
}

closeMobileSidebar() {
    if (this.isMobileView) {
        this.mobileSidebarOpen = false;
    }
}

private updateViewportState() {
    this.isMobileView = window.innerWidth <= 991.98;
    if (this.isMobileView) {
        this.sidebarCollapsed = false;
    } else {
        this.mobileSidebarOpen = false;
    }
}

private startMenuLoader() {
    this.isMenuLoading = true;
    if (this.loaderTimeoutId) {
        clearTimeout(this.loaderTimeoutId);
    }
    this.loaderTimeoutId = setTimeout(() => {
        this.isMenuLoading = false;
    }, 1800);
}

private stopMenuLoader() {
    if (this.loaderTimeoutId) {
        clearTimeout(this.loaderTimeoutId);
    }
    setTimeout(() => {
        this.isMenuLoading = false;
    }, 250);
}

onLanguageChange(lang: string): void {
    this.selectedLanguage = lang || 'en';
    localStorage.setItem('app_lang', this.selectedLanguage);
    this.applyLanguage(this.selectedLanguage);
}

private loadGoogleTranslateScript(): void {
    if ((window as any).google?.translate) {
        this.initTranslateElement();
        this.applyLanguage(this.selectedLanguage);
        return;
    }

    window.googleTranslateElementInit = () => {
        this.initTranslateElement();
        this.applyLanguage(this.selectedLanguage);
    };

    if (!document.getElementById(this.translateScriptId)) {
        const script = document.createElement('script');
        script.id = this.translateScriptId;
        script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        script.async = true;
        document.body.appendChild(script);
    }
}

private initTranslateElement(): void {
    if (!document.getElementById('google_translate_element_app')) {
        return;
    }

    new window.google.translate.TranslateElement(
      {
        pageLanguage: 'en',
        includedLanguages: 'en,te',
        autoDisplay: false
      },
      'google_translate_element_app'
    );
}

private applyLanguage(lang: string): void {
    const target = lang || 'en';
    const cookieValue = `/en/${target}`;

    document.cookie = `googtrans=${cookieValue};path=/`;
    document.cookie = `googtrans=${cookieValue};domain=${window.location.hostname};path=/`;

    setTimeout(() => {
        const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
        if (combo) {
            combo.value = target;
            combo.dispatchEvent(new Event('change'));
        }
    }, 500);
}

    logout() {
        this.authenticationService.logout();
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
}