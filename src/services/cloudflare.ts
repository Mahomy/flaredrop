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

export async function uploadToCloudflareImages(file: File, config: CloudflareConfig): Promise<{ url: string; id: string }> {
  if (!config.accountId || !config.apiToken) {
    throw new Error('Cloudflare Account ID and API Token are required.');
  }

  const formData = new FormData();
  formData.append('file', file);

  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${config.accountId.trim()}/images/v1`;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.apiToken.trim()}`
    },
    body: formData
  });

  const text = await response.text();
  let data: any;
  try {
    data = JSON.parse(text);
  } catch (err) {
    throw new Error(`Cloudflare returned non-JSON response (HTTP ${response.status}): ${text.slice(0, 150)}`);
  }

  if (!response.ok || !data.success) {
    const msg = data.errors?.[0]?.message || `Upload failed with HTTP ${response.status}`;
    throw new Error(msg);
  }

  const result = data.result;
  let finalUrl = '';
  if (result.variants && result.variants.length > 0) {
    finalUrl = result.variants[0];
  } else if (config.accountHash) {
    finalUrl = `https://imagedelivery.net/${config.accountHash.trim()}/${result.id}/public`;
  } else {
    finalUrl = `https://imagedelivery.net/${config.accountId.trim()}/${result.id}/public`;
  }

  return {
    url: finalUrl,
    id: result.id
  };
}
