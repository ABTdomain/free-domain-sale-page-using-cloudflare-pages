// ============================================
// DOMAIN SALE PAGE CONFIGURATION
// Edit this file to customize your domain sale page
// ============================================

let DOMAIN_CONFIG = {
    // Your domain name that's for sale
    domain: "DomainPickup.com",
    
    // Asking price (use commas for thousands separator)
    price: "25,000",
    
    // Currency: "USD", "EUR", or "GBP"
    currency: "USD",
    
    // Google Analytics tracking ID (leave empty if not using)
    // Example: "G-XXXXXXXXXX" or "UA-XXXXXXXXX-X"
    googleAnalytics: "",
    
    // Template theme (1-24), see templates.js for all options
    // CLASSIC (1-12): 1=Tech, 2=Finance, 3=Creative, 4=Minimal, 5=Crypto, 6=Corporate
    //   7=Luxury, 8=Ocean, 9=Sunset, 10=Dark, 11=Nature, 12=Royal
    // EXTENDED (13-19): 13=Brutalist, 14=Glass, 15=Editorial, 16=Terminal, 17=Wabi-Sabi, 18=Neumorph, 19=Retro
    // MORE (20-24): 20=Newspaper, 21=Noir, 22=Candy, 23=Blueprint, 24=Zen Garden
    template: 5,
    
    // Whether the price is negotiable (true/false)
    priceNegotiable: true,
    
    // Contact information (leave empty string "" to hide any field)
    contact: {
        // Email address for inquiries
        email: "Support@abtdomain.com",
        
        // Telegram username (with or without @)
        telegram: "@example",
        
        // WhatsApp number with country code
        whatsapp: "+1234567890",
        
        // X/Twitter username (with or without @)
        x: "@abtdomain",  // 
        
        // WeChat ID
        wechat: "your_wechat_id",
        
        // Facebook page or username
        facebook: "yourfacebookpage",
        
        // Discord invite code or server
        discord: "your_discord_invite",
        
        // LinkedIn profile (username only)
        linkedin: "yourprofile",
        
        // Instagram username (with or without @)
        instagram: "@yourinstagram",
        
        // YouTube channel (with or without @)
        youtube: "@yourchannel",
        
        // GitHub username
        github: "yourgithub",
        
        // Reddit username
        reddit: "yourreddit"
    },
    
    // Key features/selling points of your domain (customize these!)
    // A stronger introduction could help boost sales.
    features: [
        "Free Domain Sale Landing Page",      // Feature 1 this would be the keywords for title and meta
        "Speedup By Cloudflare",              // Feature 2 
        "Perfect for Domainowners",           // Feature 3
        "SEO friendly name",                  // Feature 4
        "No Additional Cost",                  // Feature 5
        "Free Domain Tools by ABTdomain"         // Feature 6
        // Add more features as needed but better focus on some keywords
    ],
    
    // Domain marketplaces where your domain is listed.
    // Available options: "Sedo", "Afternic", "Atom"
    marketplaces: ['Sedo', 'Afternic', 'Atom', 'NameClub', 'Saw'],
    
    // Accepted payment methods
    // Available options: "Escrow.com", "Bank Transfer", "Crypto", "PayPal"
    payments: ["Escrow.com", "Bank Transfer", "Crypto", "PayPal"]
};

// ============================================
// CREATOR INFO - Please keep to support free tool
// ============================================
const CREATOR = {
   // Creator name
    name: "ABTDomain",
    
    // GitHub repository link
    github: "https://github.com/ABTdomain",
    
    // Official website
    website: "https://abtdomain.com",

   // Email
    Email: "ABTdomain@outlook.com",

   
   // Current version
    version: "1.0.0"
};
