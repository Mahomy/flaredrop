export async function onRequestGet(context: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  const cfAccountId = context.env?.CF_ACCOUNT_ID || 'dc9867f8a1cf9c3548137121a3c613c2';
  const cfApiToken = context.env?.CF_API_TOKEN;
  const bucketName = context.env?.CF_BUCKET_NAME || 'myfirstbucket';
  const publicBaseUrl = context.env?.CF_PUBLIC_BASE_URL || 'https://pub-e8bb4cc169594fc9a7cd29b4abf502cc.r2.dev';

  if (!cfApiToken) {
    return new Response(JSON.stringify({ success: false, error: 'Cloudflare API token not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const r2Url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${bucketName}/objects`;
    const res = await fetch(r2Url, {
      headers: {
        'Authorization': `Bearer ${cfApiToken}`
      }
    });

    if (!res.ok) {
      const err = await res.text();
      return new Response(JSON.stringify({ success: false, error: err }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data: any = await res.json();
    const rawObjects = Array.isArray(data.result) ? data.result : (data.result?.objects || []);
    
    // Filter only images (or media uploaded)
    const files = rawObjects
      .filter((obj: any) => {
        const key = (obj.key || '').toLowerCase();
        return /\.(png|jpe?g|webp|gif|svg|bmp|ico|mp4|webm)$/i.test(key);
      })
      .map((obj: any) => {
        const key = obj.key;
        const encoded = key.split('/').map((p: string) => encodeURIComponent(p)).join('/');
        const url = `${publicBaseUrl.replace(/\/+$/, '')}/${encoded}`;
        return {
          id: `r2_${key}`,
          name: key,
          size: obj.size || 0,
          type: obj.http_metadata?.contentType || 'image/png',
          url: url,
          thumbnailUrl: url,
          uploadedAt: obj.last_modified || new Date().toISOString(),
          source: 'cloudflare',
          cloudflareId: key
        };
      });

    return new Response(JSON.stringify({ success: true, files }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
