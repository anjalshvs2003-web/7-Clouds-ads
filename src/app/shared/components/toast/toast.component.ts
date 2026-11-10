import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <div
        *ngFor="let t of toasts"
        class="pointer-events-auto flex items-start gap-3 p-3.5 rounded-2xl border shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5"
        [ngClass]="getToastClasses(t.type)"
      >
        <app-icon
          [name]="getToastIcon(t.type)"
          [size]="18"
          [extraClass]="getIconClass(t.type)"
        ></app-icon>

        <div class="flex-1 min-w-0 text-xs">
          <div *ngIf="t.title" class="font-bold text-white mb-0.5">{{ t.title }}</div>
          <div class="text-text-primary">{{ t.message }}</div>
        </div>

        <button
          type="button"
          (click)="removeToast(t.id)"
          class="text-text-muted hover:text-white transition-colors cursor-pointer"
        >
          <app-icon name="x" [size]="14"></app-icon>
        </button>
      </div>
    </div>
  `
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: ToastMessage[] = [];
  private sub?: Subscription;

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.sub = this.toastService.toasts$.subscribe(list => {
      this.toasts = list;
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  removeToast(id: string): void {
    this.toastService.remove(id);
  }

  getToastClasses(type: string): string {
    switch (type) {
      case 'success':
        return 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.2)]';
      case 'error':
        return 'bg-rose-950/80 border-rose-500/40 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.2)]';
      case 'warning':
        return 'bg-amber-950/80 border-amber-500/40 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.2)]';
      default:
        return 'bg-surface/90 border-electric/40 text-electric-light shadow-glow-sm';
    }
  }

  getToastIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'check';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-circle';
      default:
        return 'sparkles';
    }
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'text-emerald-400';
      case 'error':
        return 'text-rose-400';
      case 'warning':
        return 'text-amber-400';
      default:
        return 'text-electric';
    }
  }
}
