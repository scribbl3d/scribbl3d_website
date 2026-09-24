import { MetadataRoute } from 'next';

const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://www.scribbl3d.com').replace(/\/+$/, '');

// Public catalogue/content APIs used for page rendering
const allow = [
  '/',
  '/api/printers',
  '/api/resins',
  '/api/filaments',
  '/api/prebuilt-products',
  '/api/products',
  '/api/page-hero',
];

// Private, transactional, and account routes. All other APIs are blocked;
// the more specific catalogue Allow rules above take precedence.
const disallow = [
  '/api/',
  '/ops/',
  '/admin/',
  '/checkout',
  '/cart',
  '/profile',
  '/order',
  '/payment',
  '/auth/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/search',
  '/*?q=',
  '/*?search=',
  '/23',
  '/%24',
  '/ddsd',
];

// Search and AI crawlers get the same rules explicitly: a named group
// does not inherit the "*" group, so each needs the full disallow list.
const namedCrawlers = [
  'Googlebot',
  'Bingbot',
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot',
  'Applebot-Extended',
  'cohere-ai',
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow, disallow },
      { userAgent: namedCrawlers, allow, disallow },
      { userAgent: 'SemrushBot', allow, disallow, crawlDelay: 10 },
      { userAgent: 'AhrefsBot', disallow: '/' },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
