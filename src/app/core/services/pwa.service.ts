import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PwaService {
  private isOnlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
  isOnline$: Observable<boolean> = this.isOnlineSubject.asObservable();

  private deferredPrompt: any = null;
  private canInstallSubject = new BehaviorSubject<boolean>(false);
  canInstall$: Observable<boolean> = this.canInstallSubject.asObservable();

  constructor() {
    window.addEventListener('online', () => this.isOnlineSubject.next(true));
    window.addEventListener('offline', () => this.isOnlineSubject.next(false));

    window.addEventListener('beforeinstallprompt', (e: Event) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.canInstallSubject.next(true);
    });

    window.addEventListener('appinstalled', () => {
      this.deferredPrompt = null;
      this.canInstallSubject.next(false);
      console.log('7 Clouds PWA installed successfully.');
    });

    this.registerServiceWorker();
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    this.deferredPrompt = null;
    this.canInstallSubject.next(false);
    return outcome === 'accepted';
  }

  private registerServiceWorker(): void {
    if (typeof window === 'undefined') return;

    // In local development or on localhost, proactively unregister all service workers and clean cache
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    if (isLocalhost || !environment.production) {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(regs => {
          for (const reg of regs) {
            reg.unregister();
            console.log('Unregistered development ServiceWorker:', reg.scope);
          }
        });
      }
      if ('caches' in window) {
        caches.keys().then(keys => {
          for (const k of keys) {
            if (k.startsWith('7clouds')) {
              caches.delete(k);
            }
          }
        });
      }
      return;
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/service-worker.js')
          .then(reg => {
            console.log('PWA ServiceWorker registered with scope:', reg.scope);
          })
          .catch(err => {
            console.log('PWA ServiceWorker registration skipped/failed:', err);
          });
      });
    }
  }
}
