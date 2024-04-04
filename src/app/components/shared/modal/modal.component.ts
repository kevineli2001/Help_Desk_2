import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  @Input() isVisible: boolean = false
  @Output() close = new EventEmitter<any>()

  onClose() {
    this.close.emit(false)
  }
}
