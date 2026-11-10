import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-y-auto">
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-background/80 backdrop-blur-md transition-opacity"
        (click)="close.emit()"
      ></div>

      <!-- Modal Container -->
      <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          class="relative transform overflow-hidden rounded-2xl bg-surface border border-surface-border text-left shadow-2xl transition-all sm:my-8 w-full max-w-lg p-6 backdrop-blur-xl animate-in fade-in zoom-in-95"
          [style.max-width]="maxWidth"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between pb-4 border-b border-surface-border mb-4">
            <div>
              <h3 class="text-base font-bold text-text-primary tracking-tight">{{ title }}</h3>
              <p *ngIf="subtitle" class="text-xs text-text-muted mt-0.5">{{ subtitle }}</p>
            </div>
            <button
              type="button"
              (click)="close.emit()"
              class="p-1.5 rounded-lg text-text-muted hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <!-- Body -->
          <div class="max-h-[75vh] overflow-y-auto pr-1">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() subtitle = '';
  @Input() maxWidth = '32rem'; // default 512px
  @Output() close = new EventEmitter<void>();
}
