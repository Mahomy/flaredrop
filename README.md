# FlareDrop ☁️🔥

> High-performance Image Vault, Hosting & Instant CDN URL Generator.

Upload single or batch images, generate instant direct HTTPS CDN URLs (e.g. `https://files.catbox.moe/...`), filter and search through your cards, and copy URLs with one click.

## Features
- **Real Public HTTPS URLs:** Never returns 500kb `data:image/base64` URLs. Always generates real, shareable links.
- **Serverless Cloudflare Pages Function:** Dedicated `/api/upload` edge endpoint running on Cloudflare.
- **Batch Upload:** Drag & drop PNG, JPG, WEBP, GIF, SVG.
- **Card-Based UI:** Shows preview, file size, dimensions, format, and instant clickable URL.
- **1-Click Copy:** Click any URL pill to copy directly to clipboard.
- **Search & Filter:** Real-time search by filename, format pill filters, and sorting.
- **Optional Cloudflare Images:** Connect your own Cloudflare Images / CDN keys if you have an active Cloudflare plan.
