// ============================================
// DYNAMIC SITEMAP GENERATOR
// Returns a fresh sitemap.xml with current date
// ============================================

export async function onRequest(context) {
    const url = new URL(context.request.url);

    // Try to extract domain from config
    let domain = url.hostname;
    try {
        const configResp = await context.env.ASSETS.fetch(new URL('/config.js', url.origin));
        const configText = await configResp.text();
        const match = configText.match(/domain\s*:\s*["']([^"']+)["']/);
        if (match) domain = match[1];
    } catch (e) { /* use hostname */ }

    const today = new Date().toISOString().split('T')[0];
    const canonicalUrl = `https://${domain}/`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${canonicalUrl}</loc>
        <lastmod>${today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
</urlset>`;

    return new Response(xml, {
        status: 200,
        headers: {
            'content-type': 'application/xml; charset=utf-8',
            'cache-control': 'public, max-age=3600, s-maxage=86400'
        }
    });
}
