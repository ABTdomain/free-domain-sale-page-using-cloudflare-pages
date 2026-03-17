// ============================================
// PAGE GENERATOR - DO NOT MODIFY
// ============================================

// Google Fonts loader — only loads fonts that are actually needed
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

function loadGoogleFonts(template) {
    const fontsToLoad = new Set();
    [template.font, template.fontHeading].forEach(fontStr => {
        if (!fontStr) return;
        const family = fontStr.split(',')[0].replace(/'/g, '').trim();
        if (GOOGLE_FONTS_MAP[family]) {
            fontsToLoad.add(GOOGLE_FONTS_MAP[family]);
        }
    });
    if (fontsToLoad.size === 0) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?${[...fontsToLoad].map(f => `family=${f}`).join('&')}&display=swap`;
    document.head.appendChild(link);
}

class DomainPage {
    constructor() {
        this.config = window.DOMAIN_CONFIG || DOMAIN_CONFIG;
        this.config.template = parseInt(this.config.template);
        this.template = TEMPLATES[this.config.template] || TEMPLATES[1];
        this.init();
    }

    init() {
        loadGoogleFonts(this.template);
        this.setPageTitle();
        this.setMetaTags();
        this.applyTheme();
        this.generateHTML();
        this.addEventListeners();
        this.generateFavicon();
        this.updateSEOFiles();
    }

    setPageTitle() {
        const price = this.formatPrice();
        const firstFeature = this.config.features && this.config.features.length > 0
            ? this.config.features[0]
            : '';

            if (firstFeature) {
                document.title = `${this.config.domain} is for sale - ${firstFeature} - ${price}`;
            } else {
                document.title = `${this.config.domain} is for sale - ${price}`;
            }
    }

    setMetaTags() {
        const price = this.formatPrice();
        const firstFeature = this.config.features && this.config.features.length > 0
            ? this.config.features[0]
            : '';

        const keywords = [
            this.config.domain,
            'domain for sale',
            'buy domain',
            'premium domain'
        ];

        let description;
        if (firstFeature) {
            description = `${this.config.domain} - ${firstFeature}. Available for purchase at ${price}. ${this.config.priceNegotiable ? 'Price negotiable.' : 'Fixed price.'}`;
        } else {
            description = `${this.config.domain} is available for purchase at ${price}. Premium domain name for sale. ${this.config.priceNegotiable ? 'Price negotiable.' : 'Fixed price.'}`;
        }
        const descMeta = document.querySelector('meta[name="description"]');
        if (descMeta) {
            descMeta.content = description;
        }

        let keywordsMeta = document.querySelector('meta[name="keywords"]');
        if (!keywordsMeta) {
            keywordsMeta = document.createElement('meta');
            keywordsMeta.name = 'keywords';
            document.head.appendChild(keywordsMeta);
        }
        if (this.config.features && this.config.features.length > 0) {
            keywords.push(...this.config.features);
        }

        keywordsMeta.content = keywords.join(', ');

        const ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) {
            ogTitle.content = firstFeature ? `${this.config.domain} - ${firstFeature}` : `${this.config.domain} is for sale`;
        }

        const ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) {
            ogDesc.content = description;
        }

        // OG URL
        const ogUrl = document.querySelector('meta[property="og:url"]');
        if (ogUrl) {
            ogUrl.content = `https://${this.config.domain}/`;
        }

        // Twitter card tags
        const twitterTitle = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitle) {
            twitterTitle.content = ogTitle ? ogTitle.content : `${this.config.domain} is for sale`;
        }
        const twitterDesc = document.querySelector('meta[name="twitter:description"]');
        if (twitterDesc) {
            twitterDesc.content = description;
        }
    }

    formatPrice() {
        const symbols = { USD: '$', EUR: '€', GBP: '£' };
        return `${symbols[this.config.currency] || '$'}${this.config.price}`;
    }

    applyTheme() {
        const t = this.template;
        const root = document.documentElement;
        const body = document.body;

        // --- Core CSS variables ---
        root.style.setProperty('--primary', t.primaryColor);
        root.style.setProperty('--secondary', t.secondaryColor);
        root.style.setProperty('--text', t.textColor);
        root.style.setProperty('--button', t.buttonColor);
        root.style.setProperty('--button-text', t.buttonTextColor);

        // --- Background ---
        body.style.background = t.background;
        body.style.backgroundAttachment = 'fixed';
        body.style.backgroundSize = '100vw 100vh';
        body.style.backgroundRepeat = 'no-repeat';
        body.style.color = t.textColor;

        // --- Extended: Typography ---
        if (t.font) {
            body.style.fontFamily = t.font;
        }
        if (t.fontHeading) {
            root.style.setProperty('--font-heading', t.fontHeading);
        }
        if (t.fontSizeScale) {
            root.style.setProperty('--font-scale', t.fontSizeScale);
        }
        if (t.letterSpacing) {
            root.style.setProperty('--letter-spacing', t.letterSpacing);
        }
        if (t.lineHeight) {
            root.style.setProperty('--line-height', t.lineHeight);
        }

        // --- Extended: Card styling ---
        if (t.borderRadius !== undefined) {
            root.style.setProperty('--border-radius', t.borderRadius);
        }
        if (t.cardBackground) {
            root.style.setProperty('--card-bg', t.cardBackground);
        }
        if (t.cardBorder) {
            root.style.setProperty('--card-border', t.cardBorder);
        }
        if (t.cardBorderTop) {
            root.style.setProperty('--card-border-top', t.cardBorderTop);
        }
        if (t.cardBorderBottom) {
            root.style.setProperty('--card-border-bottom', t.cardBorderBottom);
        }
        if (t.cardBlur) {
            root.style.setProperty('--card-blur', t.cardBlur);
        }
        if (t.cardShadow) {
            root.style.setProperty('--card-shadow', t.cardShadow);
        }

        // --- Extended: Text effects ---
        if (t.textShadow) {
            root.style.setProperty('--text-shadow', t.textShadow);
        }

        // --- Extended: Background pattern overlay ---
        if (t.backgroundPattern) {
            const overlay = document.createElement('div');
            overlay.className = 'bg-pattern-overlay';
            overlay.style.cssText = `position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background-image:${t.backgroundPattern};`;
            if (t.backgroundPatternSize) {
                overlay.style.backgroundSize = t.backgroundPatternSize;
            }
            body.prepend(overlay);
            document.getElementById('app').style.position = 'relative';
            document.getElementById('app').style.zIndex = '1';
        }

        // --- Apply card style class to body ---
        if (t.cardStyle) {
            body.classList.add(`theme-${t.cardStyle}`);
        }

        // --- Legacy theme classes (backward compatible) ---
        if (this.config.template === 4) body.classList.add('minimal-theme');
        if (this.config.template === 5) body.classList.add('crypto-theme');

        // --- Terminal scanline effect ---
        if (t.scanline) {
            const scanline = document.createElement('div');
            scanline.className = 'scanline-overlay';
            body.prepend(scanline);
        }
    }

    generateFavicon() {
        const firstLetter = this.config.domain.charAt(0).toUpperCase();
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createLinearGradient(0, 0, 64, 64);
        gradient.addColorStop(0, this.template.primaryColor);
        gradient.addColorStop(1, this.template.secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        ctx.fillStyle = this.template.textColor || '#ffffff';

        ctx.font = 'bold 36px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(firstLetter, 32, 32);

        const link = document.createElement('link');
        link.rel = 'icon';
        link.type = 'image/x-icon';
        link.href = canvas.toDataURL('image/x-icon');
        const oldIcon = document.querySelector('link[rel="icon"]');
        if (oldIcon) {
            oldIcon.remove();
        }
        document.head.appendChild(link);
    }

    generateHTML() {
        const price = this.formatPrice();
        const t = this.template;

        // --- CTA button inline styles ---
        let ctaStyle = `background: ${t.buttonColor}; color: ${t.buttonTextColor}`;
        let ctaSecStyle = `color: ${t.textColor}; border-color: ${t.buttonColor}`;
        let ctaExtraAttr = '';
        let ctaSecExtraAttr = '';

        if (t.ctaStyle === 'brutalist') {
            ctaStyle += '; border-radius: 0; box-shadow: 4px 4px 0 #000; border: 3px solid #000; text-transform: uppercase; letter-spacing: 0.05em';
            ctaSecStyle += '; border-radius: 0; border: 3px solid #000; box-shadow: 4px 4px 0 #000';
        } else if (t.ctaStyle === 'glass') {
            ctaStyle += '; backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.2)';
            ctaSecStyle += '; backdrop-filter: blur(12px)';
        } else if (t.ctaStyle === 'editorial') {
            ctaStyle += '; border-radius: 2px; box-shadow: none; text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.9rem';
            ctaSecStyle += '; border-radius: 2px; border-width: 1px';
        } else if (t.ctaStyle === 'terminal') {
            ctaStyle += '; border-radius: 0; box-shadow: 0 0 12px rgba(0, 255, 65, 0.4); border: 1px solid #00ff41; text-transform: uppercase';
            ctaSecStyle += '; border-radius: 0; box-shadow: 0 0 8px rgba(0, 255, 65, 0.2)';
        } else if (t.ctaStyle === 'wabi') {
            ctaStyle += '; border-radius: 0; box-shadow: none; letter-spacing: 0.2em; font-size: 0.85rem; padding: 1rem 2.5rem';
            ctaSecStyle += '; border-radius: 0; border-width: 1px';
        } else if (t.ctaStyle === 'neumorph') {
            ctaStyle += '; box-shadow: 6px 6px 12px #b8bec7, -6px -6px 12px #ffffff; border: none';
            ctaSecStyle += '; box-shadow: inset 4px 4px 8px #b8bec7, inset -4px -4px 8px #ffffff; border: none; background: #e0e5ec';
        } else if (t.ctaStyle === 'retro') {
            ctaStyle += '; border-radius: 0; box-shadow: 4px 4px 0 #48dbfb; border: 2px solid #ff6ac1; text-transform: uppercase';
            ctaSecStyle += '; border-radius: 0; box-shadow: 4px 4px 0 #ff6ac1';
        } else if (t.ctaStyle === 'newspaper') {
            ctaStyle += '; border-radius: 0; box-shadow: none; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700';
            ctaSecStyle += '; border-radius: 0; border-width: 2px';
        } else if (t.ctaStyle === 'noir') {
            ctaStyle += '; border-radius: 0; box-shadow: none; letter-spacing: 0.15em; text-transform: uppercase; font-size: 0.85rem';
            ctaSecStyle += '; border-radius: 0; border-color: rgba(212, 175, 55, 0.4)';
        } else if (t.ctaStyle === 'candy') {
            ctaStyle += '; border-radius: 50px; box-shadow: 0 6px 24px rgba(233, 30, 144, 0.3); font-weight: 700';
            ctaSecStyle += '; border-radius: 50px; border-color: rgba(233, 30, 144, 0.3); color: #e91e90';
        } else if (t.ctaStyle === 'blueprint') {
            ctaStyle += '; border-radius: 0; box-shadow: none; border: 2px solid #fff; text-transform: uppercase; letter-spacing: 0.08em';
            ctaSecStyle += '; border-radius: 0; border-color: rgba(255,255,255,0.3)';
        } else if (t.ctaStyle === 'zen') {
            ctaStyle += '; border-radius: 2px; box-shadow: none; letter-spacing: 0.2em; font-size: 0.85rem; text-transform: uppercase';
            ctaSecStyle += '; border-radius: 2px; border-width: 1px; border-color: rgba(143, 188, 143, 0.3)';
        }

        let html = `

            <main>
                <!-- Hero Section -->
                <section class="hero">
                    <div class="domain-badge">For Sale</div>
                    <h1 class="domain-name" id="domainText">${this.config.domain}</h1>
                    <div class="domain-price">${price}</div>
                    <div class="price-badge">${this.config.priceNegotiable ? 'Price Negotiable' : 'Fixed Price'}</div>
                    <div class="cta-buttons">
                        <a href="#contact" class="cta-button" style="${ctaStyle}">Get This Domain</a>
                        <a href="https://domainkits.com/ai/analysis?domain=${this.config.domain}" target="_blank" rel="noopener" class="cta-button-secondary" style="${ctaSecStyle}">Analyze Domain</a>
                    </div>
                </section>`;

        if (this.config.features && this.config.features.length > 0) {
            html += `
                <section class="section">
                    <div class="container">
                        <h2 class="section-title">Why This Domain</h2>
                        <div class="grid">`;

            this.config.features.forEach((feature) => {
                html += `
                            <div class="card">
                                ${feature}
                            </div>`;
            });

            html += `
                        </div>
                    </div>
                </section>`;
        }
        const socialPlatforms = {
            email: {
                name: 'Email',
                urlPrefix: 'mailto:',
                urlSuffix: ''
            },
            telegram: {
                name: 'Telegram',
                urlPrefix: 'https://t.me/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            whatsapp: {
                name: 'WhatsApp',
                urlPrefix: 'https://wa.me/',
                urlSuffix: '',
                cleanValue: (v) => v.replace(/[^0-9]/g, '')
            },
            x: {
                name: 'X (Twitter)',
                urlPrefix: 'https://x.com/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            wechat: {
                name: 'WeChat',
                urlPrefix: '#',
                urlSuffix: '',
                isDisplay: true
            },
            facebook: {
                name: 'Facebook',
                urlPrefix: 'https://facebook.com/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            discord: {
                name: 'Discord',
                urlPrefix: 'https://discord.gg/',
                urlSuffix: ''
            },
            linkedin: {
                name: 'LinkedIn',
                urlPrefix: 'https://linkedin.com/in/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('https://linkedin.com/in/', '').replace('/', '')
            },
            instagram: {
                name: 'Instagram',
                urlPrefix: 'https://instagram.com/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            youtube: {
                name: 'YouTube',
                urlPrefix: 'https://youtube.com/@',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            github: {
                name: 'GitHub',
                urlPrefix: 'https://github.com/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('@', '')
            },
            reddit: {
                name: 'Reddit',
                urlPrefix: 'https://reddit.com/u/',
                urlSuffix: '',
                cleanValue: (v) => v.replace('/u/', '').replace('u/', '')
            }
        };

        if (this.config.contact && Object.keys(this.config.contact).some(key => this.config.contact[key])) {
            html += `
                <section class="section" id="contact">
                    <div class="container">
                        <h2 class="section-title">Get In Touch</h2>
                        <div class="grid">`;
            Object.keys(this.config.contact).forEach(key => {
                const value = this.config.contact[key];
                if (value && socialPlatforms[key]) {
                    const platform = socialPlatforms[key];
                    const cleanedValue = platform.cleanValue ? platform.cleanValue(value) : value;
                    if (platform.isDisplay) {
                        html += `
                            <div class="card">
                                <div class="label">${platform.name}</div>
                                <div class="value">${value}</div>
                            </div>`;
                    } else {
                        const url = `${platform.urlPrefix}${cleanedValue}${platform.urlSuffix}`;
                        html += `
                            <a href="${url}" target="_blank" rel="noopener" class="card">
                                <div class="label">${platform.name}</div>
                                <div class="value">${value}</div>
                            </a>`;
                    }
                }
            });

            html += `
                        </div>
                    </div>
                </section>`;
        }

        if (this.config.marketplaces && this.config.marketplaces.length > 0) {
            html += `
                <section class="section">
                    <div class="container">
                        <h2 class="section-title">Buy Through Trusted Marketplaces</h2>
                        <div class="grid">`;

            this.config.marketplaces.forEach(marketplace => {
                let url = '';
                if (marketplace === 'Sedo') {
                    url = `https://sedo.com/search/details/?domain=${this.config.domain}`;
                } else if (marketplace === 'Afternic') {
                    url = `https://www.afternic.com/domain/${this.config.domain}`;
                } else if (marketplace === 'Atom') {
                    url = `https://www.atom.com/domains/${this.config.domain}`;
                } else if (marketplace === 'NameClub') {
                    url = `https://www.nameclub.com/domain/${this.config.domain}`;
                } else if (marketplace === 'Saw') {
                    url = `https://www.sawsells.com/domain/${this.config.domain}`;
                }

                html += `
                    <a href="${url}" target="_blank" rel="noopener" class="card">
                        <div class="value">${marketplace}.com</div>
                    </a>`;
            });

            html += `
                        </div>
                    </div>
                </section>`;
        }

        if (this.config.payments && this.config.payments.length > 0) {
            html += `
                <section class="section">
                    <div class="container">
                        <h2 class="section-title">Secure Payment Methods</h2>
                        <div class="payment-methods">`;

            this.config.payments.forEach(payment => {
                html += `<div class="payment-badge">${payment}</div>`;
            });

            html += `
                        </div>
                    </div>
                </section>`;
        }
        // Attribution: Please consider keeping this footer to support our free tool
        // It's not required, but it helps us continue providing free resources
        // Thank you for your support! - ABTdomain.com
        html += `
            </main>

            <footer class="creator-badge">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <span>Powered by</span>
                    <a href="https://abtdomain.com" target="_blank" rel="noopener">ABTDomain.com</a>
                    <span>|</span>
                    <a href="${CREATOR.github}" target="_blank" rel="noopener">GitHub</a>
                    <span style="opacity: 0.7;">v${CREATOR.version}</span>
                </div>
            </footer>`;

        document.getElementById('app').innerHTML = html;
        const schema = document.createElement('script');
        schema.type = 'application/ld+json';
        schema.textContent = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            "name": this.config.domain,
            "description": `Premium domain name ${this.config.domain} for sale`,
            "url": window.location.href,
            "offers": {
                "@type": "Offer",
                "price": this.config.price,
                "priceCurrency": this.config.currency,
                "availability": "https://schema.org/InStock",
                "seller": {
                    "@type": "Organization",
                    "name": this.config.domain + " Owner",
                    "email": this.config.contact.email || undefined,
                    "telephone": this.config.contact.whatsapp || undefined
                }
            }
        });
        document.head.appendChild(schema);
        if (this.config.googleAnalytics && this.config.googleAnalytics.trim() !== "") {
            const gaScript1 = document.createElement('script');
            gaScript1.async = true;
            gaScript1.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.googleAnalytics}`;
            document.head.appendChild(gaScript1);

            const gaScript2 = document.createElement('script');
            gaScript2.innerHTML = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${this.config.googleAnalytics}');
            `;
            document.head.appendChild(gaScript2);
        }


        }

    addEventListeners() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }
    updateSEOFiles() {
        if (!document.querySelector('link[rel="canonical"]')) {
            const link = document.createElement('link');
            link.rel = 'canonical';
            link.href = `https://${this.config.domain}/`;
            document.head.appendChild(link);
        }
        if (!document.querySelector('link[rel="sitemap"]')) {
            const sitemapLink = document.createElement('link');
            sitemapLink.rel = 'sitemap';
            sitemapLink.type = 'application/xml';
            sitemapLink.href = '/sitemap.xml';
            document.head.appendChild(sitemapLink);
        }
    }

}

document.addEventListener('DOMContentLoaded', () => {
   new DomainPage();
});
