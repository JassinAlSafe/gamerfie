import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
  const baseUrl = 'https://gamersvaultapp.com';
  const currentDate = new Date().toISOString();
  
  try {
    // Get dynamic game pages from database
    const supabase = await createClient();
    const { data: games } = await supabase
      .from('games')
      .select('id, name, updated_at, created_at')
      .order('created_at', { ascending: false })
      .limit(10000); // Limit to avoid huge sitemaps

    // Static pages with their priorities and change frequencies
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/explore`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        url: `${baseUrl}/all-games`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        url: `${baseUrl}/popular-games`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/news`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.7'
      },
      {
        url: `${baseUrl}/reviews`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.8'
      },
      {
        url: `${baseUrl}/info/about`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.6'
      },
      {
        url: `${baseUrl}/info/faq`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.5'
      },
      {
        url: `${baseUrl}/info/contact`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.5'
      },
      {
        url: `${baseUrl}/info/privacy`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/info/terms`,
        lastmod: currentDate,
        changefreq: 'yearly',
        priority: '0.3'
      },
      {
        url: `${baseUrl}/signin`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.4'
      },
      {
        url: `${baseUrl}/signup`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: '0.4'
      }
    ];

    // Add dynamic game pages
    const gamePages = (games || []).map((game) => ({
      url: `${baseUrl}/game/${game.id}`,
      lastmod: game.updated_at || game.created_at || currentDate,
      changefreq: 'weekly',
      priority: '0.7'
    }));

    // Combine all pages
    const allPages = [...staticPages, ...gamePages];

    // Generate XML content
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${allPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Sitemap generation error:', error);
    
    // Fallback to static pages only if database fails
    const staticPages = [
      {
        url: `${baseUrl}/`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '1.0'
      },
      {
        url: `${baseUrl}/explore`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      },
      {
        url: `${baseUrl}/all-games`,
        lastmod: currentDate,
        changefreq: 'daily',
        priority: '0.9'
      }
    ];

    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(fallbackSitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=1800, s-maxage=1800', // Shorter cache on error
      },
    });
  }
} 