import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatRupiah(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatTime(minutes) {
  if (minutes < 60) {
    return `${minutes} menit`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours} jam ${mins} menit` : `${hours} jam`;
}

export function formatDate(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateString));
}

export function formatDateTime(dateString) {
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateString));
}

export function getStatusColor(status) {
  const colors = {
    pending_payment: 'warning',
    waiting_verification: 'warning',
    paid: 'primary',
    preparing: 'primary',
    ready: 'success',
    completed: 'success',
    rejected: 'error',
    cancelled: 'error',
  };
  return colors[status] || 'secondary';
}

export function getStatusLabel(status) {
  const labels = {
    pending_payment: 'Menunggu Pembayaran',
    waiting_verification: 'Menunggu Verifikasi',
    paid: 'Dibayar',
    preparing: 'Sedang Disiapkan',
    ready: 'Siap Diantar',
    completed: 'Selesai',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
  };
  return labels[status] || status;
}
