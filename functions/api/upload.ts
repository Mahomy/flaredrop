export async function onRequestPost(context: any) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-CF-Account-Id, X-CF-Api-Token, X-CF-Account-Hash'
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

    // Check if Cloudflare credentials provided in headers
    const cfAccountId = request.headers.get('X-CF-Account-Id') || formData.get('cf_account_id');
    const cfApiToken = request.headers.get('X-CF-Api-Token') || formData.get('cf_api_token');
    const cfAccountHash = request.headers.get('X-CF-Account-Hash') || formData.get('cf_account_hash');

    // 1. Try Cloudflare Images if credentials provided
    if (cfAccountId && cfApiToken) {
      try {
        const cfFormData = new FormData();
        cfFormData.append('file', file);

        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`
          },
          body: cfFormData
        });

        if (cfRes.ok) {
          const cfJson: any = await cfRes.json();
          if (cfJson.success && cfJson.result) {
            const url = cfJson.result.variants?.[0] || 
              (cfAccountHash 
                ? `https://imagedelivery.net/${cfAccountHash}/${cfJson.result.id}/public`
                : `https://imagedelivery.net/${cfAccountId}/${cfJson.result.id}/public`);
            
            return new Response(JSON.stringify({
              success: true,
              url,
              provider: 'cloudflare',
              id: cfJson.result.id
            }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
          }
        }
      } catch (cfErr) {
        // Fall through to public CDN if CF Images failed or not subscribed
      }
    }

    // 2. Global Public Image CDN (Catbox - Permanent, short, direct https URLs)
    try {
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', file);

      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        body: catboxForm
      });

      if (catboxRes.ok) {
        const url = (await catboxRes.text()).trim();
        if (url.startsWith('http://') || url.startsWith('https://')) {
          // Ensure HTTPS
          const httpsUrl = url.replace('http://', 'https://');
          return new Response(JSON.stringify({
            success: true,
            url: httpsUrl,
            provider: 'cdn'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (catboxErr) {
      // Fall through to secondary CDN
    }

    // 3. Secondary CDN (Tmpfiles)
    try {
      const tmpForm = new FormData();
      tmpForm.append('file', file);

      const tmpRes = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: tmpForm
      });

      if (tmpRes.ok) {
        const tmpJson: any = await tmpRes.json();
        const rawUrl = tmpJson.data?.url;
        if (rawUrl) {
          const directUrl = rawUrl.replace('tmpfiles.org/', 'tmpfiles.org/dl/');
          return new Response(JSON.stringify({
            success: true,
            url: directUrl,
            provider: 'cdn'
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (tmpErr) {
      // Fall through
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Failed to upload image to CDN. Please check your network connection.'
    }), {
      status: 502,
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
      'Access-Control-Allow-Headers': 'Content-Type, X-CF-Account-Id, X-CF-Api-Token, X-CF-Account-Hash'
    }
  });
}
