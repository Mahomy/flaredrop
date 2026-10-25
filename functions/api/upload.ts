export async function onRequestPost(context: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  try {
    const request = context.request;
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || typeof file === 'string') {
      return new Response(JSON.stringify({ success: false, error: 'No file uploaded' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

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

    const originalName = (file as File).name || 'image.png';
    const cleanName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const objectKey = `${Date.now()}_${cleanName}`;

    const r2Url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(objectKey)}`;
    const arrayBuffer = await (file as File).arrayBuffer();
    const fileType = (file as File).type || 'image/png';

    const r2Res = await fetch(r2Url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${cfApiToken}`,
        'Content-Type': fileType
      },
      body: arrayBuffer
    });

    if (!r2Res.ok) {
      const errText = await r2Res.text();
      return new Response(JSON.stringify({ success: false, error: `Cloudflare R2 error: ${errText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const publicUrl = `${publicBaseUrl.replace(/\/+$/, '')}/${encodeURIComponent(objectKey)}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      id: objectKey,
      name: originalName,
      size: (file as File).size,
      type: fileType,
      provider: 'cloudflare'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Server error'
    }), {
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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
