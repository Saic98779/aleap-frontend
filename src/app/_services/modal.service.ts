
import { Injectable } from '@angular/core';

import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  dismissModal() {
    throw new Error("Method not implemented.");
  }

  constructor(private modalService: NgbModal) { }

  openModal(content: any, options: any = {}) {
    return this.modalService.open(content, { ...options, modalDialogClass: options['modalDialogClass'] || 'modal-lg' });
  }

  openSubModal(content: any, options: any = {}) {
    return this.modalService.open(content, { ...options, modalDialogClass: options['modalDialogClass'] || 'modal-lg' });
  }

  dismiss() {
    return this.modalService.hasOpenModals()
  }
  openModalSuperLarge(content: any, options: any = {}) {
    return this.modalService.open(content, { ...options, modalDialogClass: options['modalDialogClass'] || 'modal-xxl', backdrop: 'static' });
  }
  closeModal(content: any, options: any = {}) {
    return this.modalService.dismissAll(content);
  }
  openModalMD(content: any, options: any = {}) {
    return this.modalService.open(content, { ...options, modalDialogClass: options['modalDialogClass'] || 'modal-md', backdrop: 'static' });
  }
}


