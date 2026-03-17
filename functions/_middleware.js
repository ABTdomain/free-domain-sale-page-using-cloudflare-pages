// ============================================
// CLOUDFLARE PAGES FUNCTION — SEO SSR MIDDLEWARE
// Intercepts bot/crawler requests and returns pre-rendered HTML
// with all meta tags, JSON-LD, and OG tags baked into the response.
// Normal users get the original static files (no change).
// ============================================

const BOT_USER_AGENTS = [
    'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
    'yandexbot', 'sogou', 'exabot', 'facebot', 'facebookexternalhit',
    'ia_archiver', 'twitterbot', 'linkedinbot', 'embedly', 'quora link preview',
    'showyoubot', 'outbrain', 'pinterest', 'applebot', 'semrushbot',
    'ahrefsbot', 'mj12bot', 'telegrambot', 'whatsapp', 'discordbot',
    'slackbot', 'rogerbot', 'dotbot', 'petalbot', 'bytespider',
    'gptbot', 'chatgpt-user', 'claudebot', 'anthropic-ai'
];

function isBot(userAgent) {
    if (!userAgent) return false;
    const ua = userAgent.toLowerCase();
    return BOT_USER_AGENTS.some(bot => ua.includes(bot));
}

export async function onRequest(context) {
    const { request, next, env } = context;
    const ua = request.headers.get('user-agent') || '';
    const url = new URL(request.url);

    // Only intercept HTML page requests from bots
    if (!isBot(ua)) return next();
    // Let static assets through
    if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|webp|avif|json|xml|txt)$/i)) {
        return next();
    }
    // Only intercept root path (single-domain = one page)
    if (url.pathname !== '/' && url.pathname !== '/index.html') {
        return next();
    }

    try {
        // Fetch config.js and templates.js from origin
        const [configResp, templatesResp, cssResp] = await Promise.all([
            context.env.ASSETS.fetch(new URL('/config.js', url.origin)),
            context.env.ASSETS.fetch(new URL('/assets/js/templates.js', url.origin)),
            context.env.ASSETS.fetch(new URL('/assets/css/styles.css', url.origin))
        ]);

        const configText = await configResp.text();
        const templatesText = await templatesResp.text();

        // Extract DOMAIN_CONFIG and CREATOR from config.js
        const config = extractConfig(configText);
        const templates = extractTemplates(templatesText);

        if (!config || !config.domain) {
            return next(); // fallback to client-side
        }

        const template = templates[config.template] || templates[1] || {};
        const html = renderFullHTML(config, template, url);

        return new Response(html, {
            status: 200,
            headers: {
                'content-type': 'text/html; charset=utf-8',
                'cache-control': 'public, max-age=3600, s-maxage=86400',
                'x-robots-tag': 'index, follow',
                'x-rendered-by': 'ssr-bot-middleware'
            }
        });
    } catch (e) {
        console.error('SSR middleware error:', e);
        return next(); // fallback to client-side on error
    }
}

// ============================================
// CONFIG EXTRACTION
// ============================================

function extractConfig(configText) {
    try {
        // Remove comments, extract DOMAIN_CONFIG object
        let cleaned = configText
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');

        // Extract DOMAIN_CONFIG
        const configMatch = cleaned.match(/(?:let|const|var)\s+DOMAIN_CONFIG\s*=\s*(\{[\s\S]*?\});/);
        if (!configMatch) return null;

        // Convert to valid JSON-ish and eval safely
        const configStr = configMatch[1]
            .replace(/'/g, '"')
            .replace(/,\s*([}\]])/g, '$1') // trailing commas
            .replace(/(\w+)\s*:/g, '"$1":'); // unquoted keys

        const config = JSON.parse(configStr);

        // Extract CREATOR
        const creatorMatch = cleaned.match(/(?:let|const|var)\s+CREATOR\s*=\s*(\{[\s\S]*?\});/);
        let creator = { name: 'ABTDomain', github: 'https://github.com/ABTdomain', version: '1.0.0' };
        if (creatorMatch) {
            try {
                const creatorStr = creatorMatch[1]
                    .replace(/'/g, '"')
                    .replace(/,\s*([}\]])/g, '$1')
                    .replace(/(\w+)\s*:/g, '"$1":');
                creator = JSON.parse(creatorStr);
            } catch (e) { /* use defaults */ }
        }
        config._creator = creator;
        return config;
    } catch (e) {
        console.error('Config extraction error:', e);
        return null;
    }
}

function extractTemplates(templatesText) {
    try {
        let cleaned = templatesText
            .replace(/\/\/.*$/gm, '')
            .replace(/\/\*[\s\S]*?\*\//g, '');

        const match = cleaned.match(/(?:let|const|var)\s+TEMPLATES\s*=\s*(\{[\s\S]*\});/);
        if (!match) return {};

        // Simple extraction of template keys — we only need basic color info for SSR
        const templates = {};
        const templateRegex = /(\d+)\s*:\s*\{([^}]+(?:\{[^}]*\}[^}]*)*)\}/g;
        let m;
        while ((m = templateRegex.exec(match[1])) !== null) {
            const id = parseInt(m[1]);
            const body = m[2];
            const t = {};
            // Extract string properties
            const strProps = ['name', 'background', 'primaryColor', 'secondaryColor', 'textColor',
                'buttonColor', 'buttonTextColor', 'font', 'fontHeading', 'cardStyle',
                'borderRadius', 'cardBackground', 'cardBorder'];
            strProps.forEach(prop => {
                const re = new RegExp(`${prop}\\s*:\\s*["']([^"']+)["']`);
                const pm = body.match(re);
                if (pm) t[prop] = pm[1];
            });
            templates[id] = t;
        }
        return templates;
    } catch (e) {
        console.error('Templates extraction error:', e);
        return {};
    }
}

// ============================================
// HTML RENDERING
// ============================================

function renderFullHTML(config, template, url) {
    const domain = config.domain || 'Domain';
    const price = formatPrice(config);
    const firstFeature = config.features?.[0] || '';
    const negotiable = config.priceNegotiable ? 'Price Negotiable' : 'Fixed Price';

    // SEO strings
    const pageTitle = firstFeature
        ? `${domain} is for sale - ${firstFeature} - ${price}`
        : `${domain} is for sale - ${price}`;

    const description = firstFeature
        ? `${domain} - ${firstFeature}. Available for purchase at ${price}. ${config.priceNegotiable ? 'Price negotiable.' : 'Fixed price.'}`
        : `${domain} is available for purchase at ${price}. Premium domain name for sale. ${config.priceNegotiable ? 'Price negotiable.' : 'Fixed price.'}`;

    const keywords = [domain, 'domain for sale', 'buy domain', 'premium domain', ...(config.features || [])];
    const canonicalUrl = `https://${domain}/`;
    const ogTitle = firstFeature ? `${domain} - ${firstFeature}` : `${domain} is for sale`;

    // JSON-LD schema
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": domain,
        "description": `Premium domain name ${domain} for sale`,
        "url": canonicalUrl,
        "offers": {
            "@type": "Offer",
            "price": config.price?.replace(/,/g, '') || '0',
            "priceCurrency": config.currency || 'USD',
            "availability": "https://schema.org/InStock",
            "seller": {
                "@type": "Organization",
                "name": `${domain} Owner`,
                ...(config.contact?.email && { "email": config.contact.email }),
                ...(config.contact?.whatsapp && { "telephone": config.contact.whatsapp })
            }
        }
    };

    // Google Fonts link
    const fontsLink = buildFontsLink(template);

    // Build body content
    const bodyContent = renderBodyContent(config, template, price, negotiable);

    const creator = config._creator || {};

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escHtml(pageTitle)}</title>
    <meta name="description" content="${escHtml(description)}">
    <meta name="keywords" content="${escHtml([...new Set(keywords)].join(', '))}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <link rel="canonical" href="${canonicalUrl}">
    <link rel="sitemap" type="application/xml" href="/sitemap.xml">

    <!-- Open Graph -->
    <meta property="og:type" content="product">
    <meta property="og:title" content="${escHtml(ogTitle)}">
    <meta property="og:description" content="${escHtml(description)}">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:site_name" content="${escHtml(domain)}">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escHtml(ogTitle)}">
    <meta name="twitter:description" content="${escHtml(description)}">

    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(schema)}</script>

    <link rel="stylesheet" href="assets/css/styles.css">
    ${fontsLink}
    <link rel="preload" href="config.js" as="script">
</head>
<body${template.cardStyle ? ` class="theme-${template.cardStyle}"` : ''}>
    <div id="app">
${bodyContent}
    </div>

    <footer class="creator-badge">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <span>Powered by</span>
            <a href="https://abtdomain.com" target="_blank" rel="noopener">ABTDomain.com</a>
            <span>|</span>
            <a href="${escHtml(creator.github || 'https://github.com/ABTdomain')}" target="_blank" rel="noopener">GitHub</a>
            <span style="opacity: 0.7;">v${escHtml(creator.version || '1.0.0')}</span>
        </div>
    </footer>

    <script src="config.js"></script>
    <script src="assets/js/templates.js" defer></script>
    <script src="assets/js/app.js" defer></script>
</body>
</html>`;
}

function renderBodyContent(config, template, price, negotiable) {
    const domain = config.domain;
    let html = '';

    // Hero
    html += `        <main>
            <section class="hero">
                <div class="domain-badge">For Sale</div>
                <h1 class="domain-name">${escHtml(domain)}</h1>
                <div class="domain-price">${escHtml(price)}</div>
                <div class="price-badge">${escHtml(negotiable)}</div>
                <div class="cta-buttons">
                    <a href="#contact" class="cta-button">Get This Domain</a>
                    <a href="https://domainkits.com/ai/analysis?domain=${encodeURIComponent(domain)}" target="_blank" rel="noopener" class="cta-button-secondary">Analyze Domain</a>
                </div>
            </section>\n`;

    // Features
    if (config.features?.length) {
        html += `            <section class="section">
                <div class="container">
                    <h2 class="section-title">Why This Domain</h2>
                    <div class="grid">\n`;
        config.features.forEach(f => {
            html += `                        <div class="card">${escHtml(f)}</div>\n`;
        });
        html += `                    </div>
                </div>
            </section>\n`;
    }

    // Contact
    if (config.contact && Object.values(config.contact).some(v => v)) {
        html += `            <section class="section" id="contact">
                <div class="container">
                    <h2 class="section-title">Get In Touch</h2>
                    <div class="grid">\n`;
        const platforms = {
            email: { name: 'Email', prefix: 'mailto:' },
            telegram: { name: 'Telegram', prefix: 'https://t.me/' },
            whatsapp: { name: 'WhatsApp', prefix: 'https://wa.me/' },
            x: { name: 'X (Twitter)', prefix: 'https://x.com/' },
            wechat: { name: 'WeChat', prefix: '#', display: true },
            facebook: { name: 'Facebook', prefix: 'https://facebook.com/' },
            discord: { name: 'Discord', prefix: 'https://discord.gg/' },
            linkedin: { name: 'LinkedIn', prefix: 'https://linkedin.com/in/' },
            instagram: { name: 'Instagram', prefix: 'https://instagram.com/' },
            youtube: { name: 'YouTube', prefix: 'https://youtube.com/@' },
            github: { name: 'GitHub', prefix: 'https://github.com/' },
            reddit: { name: 'Reddit', prefix: 'https://reddit.com/u/' }
        };
        Object.entries(config.contact).forEach(([key, value]) => {
            if (!value || !platforms[key]) return;
            const p = platforms[key];
            const clean = value.replace(/^@/, '');
            if (p.display) {
                html += `                        <div class="card"><div class="label">${p.name}</div><div class="value">${escHtml(value)}</div></div>\n`;
            } else {
                const href = key === 'email' ? `${p.prefix}${value}` : `${p.prefix}${clean}`;
                html += `                        <a href="${escHtml(href)}" target="_blank" rel="noopener" class="card"><div class="label">${p.name}</div><div class="value">${escHtml(value)}</div></a>\n`;
            }
        });
        html += `                    </div>
                </div>
            </section>\n`;
    }

    // Marketplaces
    if (config.marketplaces?.length) {
        html += `            <section class="section">
                <div class="container">
                    <h2 class="section-title">Buy Through Trusted Marketplaces</h2>
                    <div class="grid">\n`;
        config.marketplaces.forEach(name => {
            const mpUrl = getMarketplaceUrl(name, domain);
            html += `                        <a href="${escHtml(mpUrl)}" target="_blank" rel="noopener" class="card"><div class="value">${escHtml(name)}.com</div></a>\n`;
        });
        html += `                    </div>
                </div>
            </section>\n`;
    }

    // Payments
    if (config.payments?.length) {
        html += `            <section class="section">
                <div class="container">
                    <h2 class="section-title">Secure Payment Methods</h2>
                    <div class="payment-methods">\n`;
        config.payments.forEach(p => {
            html += `                        <div class="payment-badge">${escHtml(p)}</div>\n`;
        });
        html += `                    </div>
                </div>
            </section>\n`;
    }

    html += `        </main>\n`;
    return html;
}

// ============================================
// HELPERS
// ============================================

function formatPrice(config) {
    const symbols = { USD: '$', EUR: '€', GBP: '£', JPY: '¥', CAD: '$', AUD: '$', CNY: '¥', INR: '₹' };
    if (config.price === 'N/A' || config.price === 'Subscription' || config.price === 'Free Tool') {
        return config.price;
    }
    return `${symbols[config.currency] || '$'}${config.price}`;
}

function getMarketplaceUrl(name, domain) {
    switch (name.toLowerCase()) {
        case 'sedo': return `https://sedo.com/search/details/?domain=${domain}`;
        case 'afternic': return `https://www.afternic.com/domain/${domain}`;
        case 'atom': return `https://www.atom.com/domains/${domain}`;
        case 'nameclub': return `https://www.nameclub.com/domain/${domain}`;
        case 'saw': return `https://www.sawsells.com/domain/${domain}`;
        default: return '#';
    }
}

function buildFontsLink(template) {
    const GOOGLE_FONTS_MAP = {
        'IBM Plex Mono': 'IBM+Plex+Mono:wght@400;600;700',
        'Space Mono': 'Space+Mono:wght@400;700',
        'Outfit': 'Outfit:wght@300;400;600;700',
        'Source Serif 4': 'Source+Serif+4:wght@400;600;700',
        'Playfair Display': 'Playfair+Display:wght@400;700;900',
        'Fira Code': 'Fira+Code:wght@400;600;700',
        'Noto Serif JP': 'Noto+Serif+JP:wght@400;700',
        'Cormorant Garamond': 'Cormorant+Garamond:wght@400;600;700',
        'DM Sans': 'DM+Sans:wght@400;500;700',
        'Press Start 2P': 'Press+Start+2P',
        'Libre Baskerville': 'Libre+Baskerville:wght@400;700'
    };
    const fonts = new Set();
    [template.font, template.fontHeading].forEach(fontStr => {
        if (!fontStr) return;
        const family = fontStr.split(',')[0].replace(/'/g, '').trim();
        if (GOOGLE_FONTS_MAP[family]) fonts.add(GOOGLE_FONTS_MAP[family]);
    });
    if (fonts.size === 0) return '';
    return `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${[...fonts].map(f => `family=${f}`).join('&')}&display=swap">`;
}

function escHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
