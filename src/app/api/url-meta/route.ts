import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { verifySession } from '@/lib/api-auth';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UrlMetaResponse {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  siteName: string | null;
  favicon: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractMeta(html: string, baseUrl: string): UrlMetaResponse {
  function getMetaContent(property: string): string | null {
    // og:property
    const ogMatch = new RegExp(
      `<meta[^>]+property=["']og:${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ).exec(html);
    if (ogMatch?.[1]) return ogMatch[1];

    // twitter:property
    const twMatch = new RegExp(
      `<meta[^>]+name=["']twitter:${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ).exec(html);
    if (twMatch?.[1]) return twMatch[1];

    // Standard meta name
    const stdMatch = new RegExp(
      `<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ).exec(html);
    if (stdMatch?.[1]) return stdMatch[1];

    return null;
  }

  // Title: og:title → <title>
  const title =
    getMetaContent('title') ??
    /<title[^>]*>([^<]+)<\/title>/i.exec(html)?.[1]?.trim() ??
    null;

  const description = getMetaContent('description');
  const image = getMetaContent('image');
  const siteName = getMetaContent('site_name');

  // Favicon: <link rel="icon"> or <link rel="shortcut icon">
  const faviconMatch =
    /<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]+href=["']([^"']+)["']/i.exec(html) ??
    /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*icon[^"']*["']/i.exec(html);

  let favicon: string | null = faviconMatch?.[1] ?? null;
  if (favicon && !favicon.startsWith('http')) {
    try {
      const base = new URL(baseUrl);
      favicon = new URL(favicon, base.origin).toString();
    } catch {
      favicon = null;
    }
  }

  return {
    url: baseUrl,
    title: title ? title.slice(0, 200) : null,
    description: description ? description.slice(0, 400) : null,
    image: image ? image.slice(0, 500) : null,
    siteName: siteName ? siteName.slice(0, 100) : null,
    favicon,
  };
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Auth check — cegah SSRF proxy abuse dari pihak tidak dikenal
  const claims = await verifySession(request);
  if (!claims) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const rawUrl = searchParams.get('url');

  if (!rawUrl) {
    return NextResponse.json({ error: 'URL parameter diperlukan' }, { status: 400 });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') throw new Error('Invalid protocol');
  } catch {
    return NextResponse.json({ error: 'URL tidak valid' }, { status: 400 });
  }

  // Block private/local addresses
  const hostname = url.hostname.toLowerCase();
  const isPrivate =
    hostname === 'localhost' ||
    hostname.startsWith('127.') ||
    hostname.startsWith('192.168.') ||
    hostname.startsWith('10.') ||
    hostname.endsWith('.local');

  if (isPrivate) {
    return NextResponse.json({ error: 'URL tidak diizinkan' }, { status: 403 });
  }

  try {
    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'NalaKoe/1.0 (link-preview)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'id,en;q=0.9',
      },
      signal: AbortSignal.timeout(8_000),
      redirect: 'follow',
    });

    if (!response.ok) {
      logger.warn('url-meta: upstream error', { url: url.toString(), status: response.status });
      return NextResponse.json({ error: `Server merespons ${response.status}` }, { status: 502 });
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html')) {
      // Non-HTML: return minimal meta with URL only
      const meta: UrlMetaResponse = {
        url: url.toString(),
        title: url.hostname,
        description: null,
        image: null,
        siteName: null,
        favicon: `${url.origin}/favicon.ico`,
      };
      return NextResponse.json(meta);
    }

    // Read only first 50KB to keep response fast
    const reader = response.body?.getReader();
    let html = '';
    if (reader) {
      const decoder = new TextDecoder();
      let bytes = 0;
      while (bytes < 50_000) {
        const { done, value } = await reader.read();
        if (done || !value) break;
        html += decoder.decode(value, { stream: !done });
        bytes += value.length;
      }
      reader.cancel();
    }

    const meta = extractMeta(html, url.toString());

    return NextResponse.json(meta, {
      headers: {
        'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    logger.error('url-meta: fetch failed', { url: url.toString(), error: msg });
    return NextResponse.json(
      { error: 'Gagal mengambil halaman. Pastikan URL dapat diakses.' },
      { status: 502 }
    );
  }
}
