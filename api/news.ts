/**
 * Vercel Edge Function — Live trade news per country
 * Source: GDELT 2.0 DOC API (free, no API key required)
 * Cached 1 hour at the edge.
 */

export const config = { runtime: 'edge' }

export default async function handler(req: Request): Promise<Response> {
  const { searchParams } = new URL(req.url)
  const country = (searchParams.get('country') || '').trim()

  if (!country) {
    return json({ error: 'country required' }, 400)
  }

  const query = encodeURIComponent(`"${country}" trade OR tariff OR manufacturing OR reshoring OR investment`)
  const gdeltUrl =
    `https://api.gdeltproject.org/api/v2/doc/doc` +
    `?query=${query}` +
    `&mode=artlist` +
    `&maxrecords=8` +
    `&format=json` +
    `&sourcelang=english` +
    `&timespan=1m`

  try {
    const res = await fetch(gdeltUrl, {
      headers: { 'User-Agent': 'ReshoringIntelligence/1.0' },
      signal: AbortSignal.timeout(8000),
    })

    if (!res.ok) return json([], 200)

    const data = await res.json() as { articles?: GdeltArticle[] }
    const articles = (data.articles ?? []).slice(0, 6).map(a => ({
      title: a.title,
      url: a.url,
      domain: a.domain,
      date: parseGdeltDate(a.seendate),
    }))

    return json(articles, 200, {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    })
  } catch {
    return json([], 200)
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

interface GdeltArticle {
  title: string
  url: string
  domain: string
  seendate: string   // "20240315T120000Z"
}

function parseGdeltDate(s: string): string | null {
  if (!s || s.length < 8) return null
  return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6, 8)}`
}

function json(body: unknown, status: number, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  })
}
