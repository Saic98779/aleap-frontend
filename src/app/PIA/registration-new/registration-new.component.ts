import { Component, OnDestroy, OnInit } from '@angular/core';

declare global {
  interface Window {
    googleTranslateElementInit: () => void;
    google: any;
  }
}

@Component({
  selector: 'app-registration-new',
  templateUrl: './registration-new.component.html',
  styleUrls: ['./registration-new.component.css']
})
export class RegistrationNewComponent implements OnInit, OnDestroy {
  selectedLanguage = 'en';
  private readonly scriptId = 'google-translate-script';

  ngOnInit(): void {
    // this.selectedLanguage = localStorage.getItem('registration_lang') || 'en';
    // this.loadGoogleTranslateScript();
  }

  ngOnDestroy(): void {
    // optional cleanup hook
  }

  // onLanguageChange(lang: string): void {
  //   this.selectedLanguage = lang || 'en';
  //   localStorage.setItem('registration_lang', this.selectedLanguage);
  //   this.applyLanguage(this.selectedLanguage);
  // }

  // private loadGoogleTranslateScript(): void {
  //   if ((window as any).google?.translate) {
  //     this.initTranslateElement();
  //     return;
  //   }

  //   window.googleTranslateElementInit = () => {
  //     this.initTranslateElement();
  //     this.applyLanguage(this.selectedLanguage);
  //   };

  //   if (!document.getElementById(this.scriptId)) {
  //     const script = document.createElement('script');
  //     script.id = this.scriptId;
  //     script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
  //     script.async = true;
  //     document.body.appendChild(script);
  //   }
  // }

  // private initTranslateElement(): void {
  //   if (!document.getElementById('google_translate_element')) return;

  //   new window.google.translate.TranslateElement(
  //     {
  //       pageLanguage: 'en',
  //       includedLanguages: 'en,te',
  //       autoDisplay: false
  //     },
  //     'google_translate_element'
  //   );
  // }

  // private applyLanguage(lang: string): void {
  //   const target = lang || 'en';
  //   const cookieValue = `/en/${target}`;

  //   document.cookie = `googtrans=${cookieValue};path=/`;
  //   document.cookie = `googtrans=${cookieValue};domain=${window.location.hostname};path=/`;

  //   setTimeout(() => {
  //     const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
  //     if (combo) {
  //       combo.value = target;
  //       combo.dispatchEvent(new Event('change'));
  //     }
  //   }, 500);
  // }
}