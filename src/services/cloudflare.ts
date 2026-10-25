import { CloudflareConfig, UploadedImage } from '../types';

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
  id: string;
  name: string;
  size: number;
  type: string;
  provider: 'cloudflare';
}

/**
 * Uploads an image straight to Cloudflare R2 bucket.
 * 100% Ad-Free, direct public link (https://pub-xxx.r2.dev/filename).
 */
export async function uploadImage(file: File, _config?: CloudflareConfig): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error || `Upload failed (Status ${response.status})`);
  }

  const data: any = await response.json();
  if (!data.success || !data.url) {
    throw new Error(data.error || 'Upload failed: no URL returned');
  }

  return {
    url: data.url,
    id: data.id,
    name: data.name || file.name,
    size: data.size || file.size,
    type: data.type || file.type,
    provider: 'cloudflare'
  };
}

/**
 * Fetches all images from Cloudflare R2 bucket.
 */
export async function fetchRemoteImages(): Promise<UploadedImage[]> {
  try {
    const res = await fetch('/api/files');
    if (res.ok) {
      const data: any = await res.json();
      if (data.success && Array.isArray(data.files)) {
        return data.files;
      }
    }
  } catch (err) {
    console.warn('Could not fetch R2 images:', err);
  }
  return [];
}

/**
 * Deletes an image from Cloudflare R2 bucket.
 */
export async function deleteRemoteImage(id: string): Promise<boolean> {
  try {
    const cleanId = id.startsWith('r2_') ? id.slice(3) : id;
    const res = await fetch(`/api/delete/${encodeURIComponent(cleanId)}`, {
      method: 'DELETE'
    });
    return res.ok;
  } catch (err) {
    console.error('Failed to delete image:', err);
    return false;
  }
}

/**
 * Downloads an image directly with ZERO ads and zero third-party pages.
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
    // Direct browser anchor fallback
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || 'downloaded-image.png';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
