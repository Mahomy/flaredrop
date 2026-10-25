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

    // Check if user provided Cloudflare credentials in request
    const cfAccountId = request.headers.get('X-CF-Account-Id') || formData.get('cf_account_id');
    const cfApiToken = request.headers.get('X-CF-Api-Token') || formData.get('cf_api_token');
    const cfAccountHash = request.headers.get('X-CF-Account-Hash') || formData.get('cf_account_hash');

    // 1. If Cloudflare credentials configured, try Cloudflare Images first
    if (cfAccountId && cfApiToken) {
      try {
        const cfForm = new FormData();
        cfForm.append('file', file);

        const cfRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${cfAccountId}/images/v1`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${cfApiToken}`
          },
          body: cfForm
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
        // Fall through to ad-free CDN
      }
    }

    // 2. Primary 100% Ad-Free CDN: Imgur Direct Image CDN (returns direct i.imgur.com raw image URL)
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
          return new Response(JSON.stringify({
            success: true,
            url: imgurJson.data.link,
            provider: 'cdn',
            id: imgurJson.data.id
          }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }
    } catch (imgurErr) {
      // Fall through to Catbox
    }

    // 3. Secondary 100% Ad-Free CDN: Catbox (returns direct files.catbox.moe raw image URL)
    try {
      const catboxForm = new FormData();
      catboxForm.append('reqtype', 'fileupload');
      catboxForm.append('fileToUpload', file);

      const catboxRes = await fetch('https://catbox.moe/user/api.php', {
        method: 'POST',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        body: catboxForm
      });

      if (catboxRes.ok) {
        const url = (await catboxRes.text()).trim();
        if (url.startsWith('http://') || url.startsWith('https://')) {
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
      // Fall through
    }

    return new Response(JSON.stringify({
      success: false,
      error: 'Upload failed. Please check network connection.'
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
