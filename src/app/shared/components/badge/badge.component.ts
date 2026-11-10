import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide transition-all"
      [ngClass]="getClasses()"
    >
      <span *ngIf="showDot" class="w-1.5 h-1.5 rounded-full" [ngClass]="getDotClasses()"></span>
      <ng-content></ng-content>
      <span>{{ label }}</span>
    </span>
  `
})
export class BadgeComponent {
  @Input() label: string = '';
  @Input() variant: string = 'default';
  @Input() showDot: boolean = true;

  getClasses(): string {
    const v = (this.variant || this.label || '').toLowerCase();

    if (v.includes('present') || v.includes('approved') || v.includes('completed') || v.includes('active') || v.includes('success')) {
      return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]';
    }
    if (v.includes('in progress') || v.includes('medium') || v.includes('wfh') || v.includes('work from home')) {
      return 'bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.15)]';
    }
    if (v.includes('half day') || v.includes('warning') || v.includes('high')) {
      return 'bg-amber-500/10 text-amber-400 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.15)]';
    }
    if (v.includes('urgent') || v.includes('rejected') || v.includes('absent') || v.includes('inactive') || v.includes('danger')) {
      return 'bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.15)]';
    }
    if (v.includes('pending') || v.includes('on hold')) {
      return 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/20';
    }
    if (v.includes('admin') || v.includes('violet') || v.includes('purple')) {
      return 'bg-violet-500/10 text-violet-300 border border-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.15)]';
    }
    if (v.includes('leave') || v.includes('holiday')) {
      return 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20';
    }
    // Default
    return 'bg-slate-800/80 text-slate-300 border border-slate-700/50';
  }

  getDotClasses(): string {
    const v = (this.variant || this.label || '').toLowerCase();
    if (v.includes('present') || v.includes('approved') || v.includes('completed') || v.includes('active') || v.includes('success')) {
      return 'bg-emerald-400 animate-pulse';
    }
    if (v.includes('in progress') || v.includes('medium') || v.includes('wfh') || v.includes('work from home')) {
      return 'bg-blue-400';
    }
    if (v.includes('half day') || v.includes('warning') || v.includes('high')) {
      return 'bg-amber-400';
    }
    if (v.includes('urgent') || v.includes('rejected') || v.includes('absent') || v.includes('inactive')) {
      return 'bg-rose-400 animate-ping';
    }
    if (v.includes('pending') || v.includes('on hold')) {
      return 'bg-yellow-400';
    }
    if (v.includes('admin') || v.includes('violet')) {
      return 'bg-violet-400';
    }
    return 'bg-slate-400';
  }
}
