import { CloudflareConfig } from '../types';

export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export async function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      resolve({ width: 0, height: 0 });
    };
    img.src = dataUrl;
  });
}

export interface UploadResult {
  url: string;
  id?: string;
  provider: 'cloudflare' | 'cdn';
}

/**
 * Uploads an image and returns a real, public HTTPS URL.
 * Never returns raw base64 data URIs.
 */
export async function uploadImage(file: File, config: CloudflareConfig): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const headers: Record<string, string> = {};
  if (config.enabled && config.accountId && config.apiToken) {
    headers['X-CF-Account-Id'] = config.accountId.trim();
    headers['X-CF-Api-Token'] = config.apiToken.trim();
    if (config.accountHash) {
      headers['X-CF-Account-Hash'] = config.accountHash.trim();
    }
  }

  // 1. Try serverless Cloudflare Pages function (/api/upload)
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      headers,
      body: formData
    });

    if (response.ok) {
      const data: any = await response.json();
      if (data.success && data.url) {
        return {
          url: data.url,
          id: data.id,
          provider: data.provider || 'cdn'
        };
      }
    }
  } catch (err) {
    console.warn('Pages function /api/upload unavailable, trying direct CDN...');
  }

  // 2. Direct browser upload to Tmpfiles CDN (has Access-Control-Allow-Origin: *)
  try {
    const directForm = new FormData();
    directForm.append('file', file);

    const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
      method: 'POST',
      body: directForm
    });

    if (tmpRes.ok) {
      const json: any = await tmpRes.json();
      const raw = json.data?.url;
      if (raw) {
        const directUrl = raw.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
        return {
          url: directUrl,
          provider: 'cdn'
        };
      }
    }
  } catch (err) {
    console.error('Direct CDN upload failed:', err);
  }

  throw new Error('Could not upload image. Please check your internet connection or Cloudflare settings.');
}
