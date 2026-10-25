export async function onRequestDelete(context: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  const id = context.params.id;
  if (!id) {
    return new Response(JSON.stringify({ success: false, error: 'Missing object key' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const cfAccountId = context.env?.CF_ACCOUNT_ID || 'dc9867f8a1cf9c3548137121a3c613c2';
  const cfApiToken = context.env?.CF_API_TOKEN;
  const bucketName = context.env?.CF_BUCKET_NAME || 'myfirstbucket';

  if (!cfApiToken) {
    return new Response(JSON.stringify({ success: false, error: 'Cloudflare API token not configured' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  try {
    const r2Url = `https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/r2/buckets/${bucketName}/objects/${encodeURIComponent(id)}`;
    const res = await fetch(r2Url, {
      method: 'DELETE',
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

    return new Response(JSON.stringify({ success: true, message: 'Deleted successfully' }), {
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
      'Access-Control-Allow-Methods': 'DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
