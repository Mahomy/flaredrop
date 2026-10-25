export interface UploadedImage {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  thumbnailUrl: string;
  uploadedAt: string;
  width?: number;
  height?: number;
  source?: 'cloudflare' | 'local' | 'cdn';
  cloudflareId?: string;
}

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  accountHash?: string;
  enabled: boolean;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}
