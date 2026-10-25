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
 * Uploads an image to 100% Ad-Free Direct CDN.
 * Returns direct raw image link (https://i.imgur.com/xxx.png or Cloudflare).
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
    console.warn('Pages function /api/upload unavailable, trying direct Imgur CDN...');
  }

  // 2. Direct browser upload to Imgur (100% ad-free, direct i.imgur.com raw image URL)
  try {
    const imgurForm = new FormData();
    imgurForm.append('image', file);

    const imgurRes = await fetch('https://api.imgur.com/3/image', {
      method: 'POST',
      headers: {
        'Authorization': 'Client-ID 546c25a59c58ad7'
      },
      body: imgurForm
    });

    if (imgurRes.ok) {
      const imgurJson: any = await imgurRes.json();
      if (imgurJson.success && imgurJson.data?.link) {
        return {
          url: imgurJson.data.link,
          id: imgurJson.data.id,
          provider: 'cdn'
        };
      }
    }
  } catch (err) {
    console.error('Direct Imgur upload failed:', err);
  }

  throw new Error('Could not upload image. Please check your internet connection.');
}

/**
 * Downloads an image directly to the user's computer with zero ads or third-party pages.
 */
export async function downloadDirectImage(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'downloaded-image.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
  } catch (err) {
    // If CORS prevents direct blob fetch, open image directly in a clean tab
    window.open(url, '_blank');
  }
}
