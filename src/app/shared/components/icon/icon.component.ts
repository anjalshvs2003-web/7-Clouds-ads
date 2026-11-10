import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [attr.width]="size"
      [attr.height]="size"
      viewBox="0 0 24 24"
      fill="none"
      [attr.stroke]="color || 'currentColor'"
      [attr.stroke-width]="strokeWidth"
      stroke-linecap="round"
      stroke-linejoin="round"
      [class]="extraClass"
      [ngSwitch]="name"
    >
      <!-- Layout / Dashboard -->
      <g *ngSwitchCase="'layout-dashboard'">
        <rect width="7" height="9" x="3" y="3" rx="1"/>
        <rect width="7" height="5" x="14" y="3" rx="1"/>
        <rect width="7" height="9" x="14" y="12" rx="1"/>
        <rect width="7" height="5" x="3" y="16" rx="1"/>
      </g>

      <!-- Clock / Attendance -->
      <g *ngSwitchCase="'clock'">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </g>

      <!-- Calendar -->
      <g *ngSwitchCase="'calendar'">
        <rect width="18" height="18" x="3" y="4" rx="2"/>
        <line x1="16" x2="16" y1="2" y2="6"/>
        <line x1="8" x2="8" y1="2" y2="6"/>
        <line x1="3" x2="21" y1="10" y2="10"/>
      </g>

      <!-- Check Square / Tasks -->
      <g *ngSwitchCase="'check-square'">
        <path d="m9 11 3 3L22 4"/>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
      </g>

      <!-- File Text / Reports -->
      <g *ngSwitchCase="'file-text'">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/>
        <path d="M14 2v4a2 2 0 0 0 2 2h4"/>
        <path d="M10 9H8"/>
        <path d="M16 13H8"/>
        <path d="M16 17H8"/>
      </g>

      <!-- Users / Employees -->
      <g *ngSwitchCase="'users'">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </g>

      <!-- User / Profile -->
      <g *ngSwitchCase="'user'">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </g>

      <!-- Bell / Notifications -->
      <g *ngSwitchCase="'bell'">
        <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
        <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
      </g>

      <!-- Megaphone / Announcements -->
      <g *ngSwitchCase="'megaphone'">
        <path d="m3 11 18-5v12L3 14v-3z"/>
        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>
      </g>

      <!-- Bar Chart / Analytics -->
      <g *ngSwitchCase="'bar-chart-2'">
        <line x1="18" x2="18" y1="20" y2="10"/>
        <line x1="12" x2="12" y1="20" y2="4"/>
        <line x1="6" x2="6" y1="20" y2="14"/>
      </g>

      <!-- Settings -->
      <g *ngSwitchCase="'settings'">
        <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
        <circle cx="12" cy="12" r="3"/>
      </g>

      <!-- Briefcase / Leave -->
      <g *ngSwitchCase="'briefcase'">
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/>
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
      </g>

      <!-- Log Out -->
      <g *ngSwitchCase="'log-out'">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" x2="9" y1="12" y2="12"/>
      </g>

      <!-- Check / Success -->
      <g *ngSwitchCase="'check'">
        <polyline points="20 6 9 17 4 12"/>
      </g>

      <!-- Plus -->
      <g *ngSwitchCase="'plus'">
        <line x1="12" x2="12" y1="5" y2="19"/>
        <line x1="5" x2="19" y1="12" y2="12"/>
      </g>

      <!-- Search -->
      <g *ngSwitchCase="'search'">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" x2="16.65" y1="21" y2="16.65"/>
      </g>

      <!-- Filter -->
      <g *ngSwitchCase="'filter'">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
      </g>

      <!-- Download -->
      <g *ngSwitchCase="'download'">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="7 10 12 15 17 10"/>
        <line x1="12" x2="12" y1="15" y2="3"/>
      </g>

      <!-- Play -->
      <g *ngSwitchCase="'play'">
        <polygon points="6 3 20 12 6 21 6 3"/>
      </g>

      <!-- Pause -->
      <g *ngSwitchCase="'pause'">
        <rect width="4" height="16" x="6" y="4"/>
        <rect width="4" height="16" x="14" y="4"/>
      </g>

      <!-- Stop -->
      <g *ngSwitchCase="'square'">
        <rect width="18" height="18" x="3" y="3" rx="2"/>
      </g>

      <!-- Shield / Security -->
      <g *ngSwitchCase="'shield'">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </g>

      <!-- Alert Circle -->
      <g *ngSwitchCase="'alert-circle'">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" x2="12" y1="8" y2="12"/>
        <line x1="12" x2="12.01" y1="16" y2="16"/>
      </g>

      <!-- Edit / Pen -->
      <g *ngSwitchCase="'edit'">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
      </g>

      <!-- Trash -->
      <g *ngSwitchCase="'trash-2'">
        <path d="M3 6h18"/>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
        <line x1="10" x2="10" y1="11" y2="17"/>
        <line x1="14" x2="14" y1="11" y2="17"/>
      </g>

      <!-- Arrow Right -->
      <g *ngSwitchCase="'arrow-right'">
        <line x1="5" x2="19" y1="12" y2="12"/>
        <polyline points="12 5 19 12 12 19"/>
      </g>

      <!-- Arrow Left -->
      <g *ngSwitchCase="'arrow-left'">
        <line x1="19" x2="5" y1="12" y2="12"/>
        <polyline points="12 19 5 12 12 5"/>
      </g>

      <!-- X / Close -->
      <g *ngSwitchCase="'x'">
        <line x1="18" x2="6" y1="6" y2="18"/>
        <line x1="6" x2="18" y1="6" y2="18"/>
      </g>

      <!-- Chevron Down -->
      <g *ngSwitchCase="'chevron-down'">
        <polyline points="6 9 12 15 18 9"/>
      </g>

      <!-- Chevron Up -->
      <g *ngSwitchCase="'chevron-up'">
        <polyline points="18 15 12 9 6 15"/>
      </g>

      <!-- Chevron Right -->
      <g *ngSwitchCase="'chevron-right'">
        <polyline points="9 18 15 12 9 6"/>
      </g>

      <!-- Sparkles / Futuristic AI -->
      <g *ngSwitchCase="'sparkles'">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>
      </g>

      <!-- Cloud -->
      <g *ngSwitchCase="'cloud'">
        <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
      </g>

      <!-- Zap / Electric -->
      <g *ngSwitchCase="'zap'">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </g>

      <!-- Activity -->
      <g *ngSwitchCase="'activity'">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
      </g>

      <!-- Pin -->
      <g *ngSwitchCase="'pin'">
        <line x1="12" x2="12" y1="17" y2="22"/>
        <path d="M5 17h14v-1.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V6h1a1 1 0 0 0 0-2H8a1 1 0 0 0 0 2h1v4.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24Z"/>
      </g>

      <!-- Default circle -->
      <g *ngSwitchDefault>
        <circle cx="12" cy="12" r="10"/>
      </g>
    </svg>
  `
})
export class IconComponent {
  @Input() name: string = 'circle';
  @Input() size: number | string = 20;
  @Input() color?: string;
  @Input() strokeWidth: number | string = 2;
  @Input() extraClass: string = '';
}
