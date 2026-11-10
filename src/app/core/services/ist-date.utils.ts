/**
 * Indian Standard Time (IST) Date & Time Utilities (UTC+05:30)
 * Ensures all timestamps and displays are consistently rendered in IST.
 */

export function getTodayDateStringIST(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(now);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '11';
  const day = parts.find(p => p.type === 'day')?.value || '10';
  return `${year}-${month}-${day}`;
}

export function getDateOffsetIST(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  const options: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(d);
  const year = parts.find(p => p.type === 'year')?.value || '2026';
  const month = parts.find(p => p.type === 'month')?.value || '11';
  const day = parts.find(p => p.type === 'day')?.value || '10';
  return `${year}-${month}-${day}`;
}

export function getCurrentISTTimeString(): string {
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  }).format(new Date());
}

export function formatTimeIST(isoStr?: string): string {
  if (!isoStr) return '--:--';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '--:--';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

export function formatDateTimeIST(isoStr?: string): string {
  if (!isoStr) return '--';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '--';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(d);
}

export function formatDateIST(isoStr?: string): string {
  if (!isoStr) return '--';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '--';
  return new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(d);
}
