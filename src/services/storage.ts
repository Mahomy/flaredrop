import { UploadedImage, CloudflareConfig } from '../types';

const IMAGES_KEY = 'flaredrop_images';
const CF_CONFIG_KEY = 'flaredrop_cf_config';

export function getStoredImages(): UploadedImage[] {
  try {
    const raw = localStorage.getItem(IMAGES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to load stored images:', e);
    return [];
  }
}

export function saveStoredImages(images: UploadedImage[]): void {
  try {
    localStorage.setItem(IMAGES_KEY, JSON.stringify(images));
  } catch (e) {
    console.error('Failed to save images to localStorage:', e);
  }
}

export function getStoredCloudflareConfig(): CloudflareConfig {
  try {
    const raw = localStorage.getItem(CF_CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  return {
    accountId: '',
    apiToken: '',
    accountHash: '',
    enabled: false
  };
}

export function saveStoredCloudflareConfig(config: CloudflareConfig): void {
  try {
    localStorage.setItem(CF_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save CF config:', e);
  }
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
