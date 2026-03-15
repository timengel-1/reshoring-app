export const config = { runtime: 'edge' }

// Edge runtime provides process.env
declare const process: { env: Record<string, string | undefined> }

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'Report generation is not configured (missing API key).' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }

  let body: { country: Record<string, unknown>; businessLinks: Record<string, unknown> | null; industry?: string | null }
  try {
    body = await req.json()
  } catch {
    return new Response('Invalid request body', { status: 400 })
  }

  const { country, businessLinks, industry } = body
  if (!country) return new Response('Missing country data', { status: 400 })

  const prompt = buildPrompt(country, businessLinks, industry ?? null)

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1800,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const errText = await anthropicRes.text()
    // Return 200 with error prefix so the frontend displays it
    return new Response(`ERROR:${anthropicRes.status}:${errText}`, {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    })
  }

  // Transform Anthropic SSE stream → plain text stream
  const { readable, writable } = new TransformStream()
  const writer = writable.getWriter()
  const encoder = new TextEncoder()

  ;(async () => {
    const reader = anthropicRes.body!.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (!data) continue
          try {
            const parsed = JSON.parse(data)
            if (
              parsed.type === 'content_block_delta' &&
              parsed.delta?.type === 'text_delta' &&
              parsed.delta.text
            ) {
              await writer.write(encoder.encode(parsed.delta.text))
            }
          } catch {}
        }
      }
    } finally {
      await writer.close()
    }
  })()

  return new Response(readable, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache',
      'X-Accel-Buffering': 'no',
    },
  })
}

const INDUSTRY_LABELS: Record<string, string> = {
  automotive: 'Automotive',
  aerospace_defense: 'Aerospace & Defense',
  electronics: 'Electronics',
  textiles_apparel: 'Textiles & Apparel',
  food_beverage: 'Food & Beverage',
  chemicals: 'Chemicals & Plastics',
  metals_materials: 'Metals & Materials',
  medical_devices: 'Medical Devices',
  consumer_goods: 'Consumer Goods',
  energy: 'Energy',
  general_manufacturing: 'General Manufacturing',
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildPrompt(country: any, businessLinks: any, industry: string | null): string {
  const scores = country.scores ?? {}
  const bready = country.bready ?? {}
  const econ = country.economic ?? {}
  const trade = country.trade ?? {}

  const fmt = (v: number | null | undefined, suffix = '') =>
    v != null ? `${v}${suffix}` : 'N/A'

  const links: string[] = []
  if (businessLinks?.us_embassy?.url) links.push(`US Embassy: ${businessLinks.us_embassy.url}`)
  if (businessLinks?.invest_agency?.name) links.push(`Investment Agency: ${businessLinks.invest_agency.name}`)
  if (businessLinks?.us_guide?.url) links.push(`Trade.gov Guide: ${businessLinks.us_guide.url}`)

  const itarStatus: Record<string, string> = {
    five_eyes: 'Five Eyes (highest trust — US, UK, Canada, Australia, NZ)',
    nato: 'NATO Ally',
    ally: 'US Treaty Ally / Major Non-NATO Ally (MNNA)',
    neutral: 'Neutral — no special US defense designation',
    caution: 'CAUTION — strategic competitor, significant export control restrictions (EAR/ITAR review required)',
    restricted: 'RESTRICTED — ITAR Part 126.1 embargoed or comprehensive sanctions. Defense-related operations generally prohibited.',
  }
  const itarLabel = itarStatus[country.itar_status ?? 'neutral'] ?? itarStatus['neutral']

  const sectors = trade.tariff_sectors ?? {}
  const fmtSector = (key: string) => {
    const s = sectors[key]
    if (!s) return 'N/A'
    if (s.weighted_mean != null) return `${s.weighted_mean.toFixed(1)}%`
    return 'N/A'
  }

  const industryLabel = industry ? (INDUSTRY_LABELS[industry] ?? industry) : 'General Manufacturing'

  const sectorBlock = `
Industry Context: ${industryLabel}

Sector Import Tariffs (tariffs this country charges on imports):
  Agriculture & Food: ${fmtSector('agriculture_food')}
  Base Metals (Steel/Aluminum): ${fmtSector('base_metals')}
  Chemicals & Plastics: ${fmtSector('chemicals')}
  Machinery & Electronics: ${fmtSector('machinery_electrical')}
  Transportation Equipment: ${fmtSector('transportation')}
  Textiles & Apparel: ${fmtSector('textiles_apparel')}
  Wood & Paper: ${fmtSector('wood_paper')}
  Stone, Cement & Glass: ${fmtSector('stone_glass')}

Export Tariff Rate (tariff this country charges on exports): ${trade.export_tariff_weighted_mean != null ? `${trade.export_tariff_weighted_mean.toFixed(1)}%` : 'N/A'}`

  const industryInstruction = industry
    ? `\nINDUSTRY FRAMING: The user is evaluating this country for ${industryLabel} operations. Frame your tariff analysis around this industry — e.g., what the machinery tariff means for an ${industryLabel} manufacturer importing equipment, or what the base metals tariff means for input costs.`
    : ''

  return `You are a senior international business intelligence analyst. Generate a practical, specific, data-driven business setup guide for ${country.name} (${country.region ?? ''}, ${country.income_level ?? ''} income country).

DATA SNAPSHOT:
Overall Viability Score: ${fmt(country.overall_score)}/100
Business Environment: ${fmt(scores.business_environment)}/100
Political Stability: ${fmt(scores.political_stability)}/100
Rule of Law: ${fmt(scores.rule_of_law)}/100
Corruption Control: ${fmt(scores.corruption_control)}/100
Govt Effectiveness: ${fmt(scores.govt_effectiveness)}/100
B-READY Composite (business enablement): ${fmt(bready.composite)}/100
  Business Entry: ${fmt(bready.business_entry)}/100
  Taxation: ${fmt(bready.taxation)}/100
  Labor Market: ${fmt(bready.labor)}/100
  Dispute Resolution: ${fmt(bready.dispute_resolution)}/100
  International Trade: ${fmt(bready.international_trade)}/100
GDP per Capita: $${econ.gdp_per_capita != null ? Math.round(econ.gdp_per_capita).toLocaleString() : 'N/A'}
GDP Growth: ${fmt(econ.gdp_growth_pct, '%')}
Corporate Tax Rate: ${fmt(econ.corporate_tax_rate, '%')}
FDI (% of GDP): ${fmt(econ.fdi_pct_gdp, '%')}
Logistics Performance Index: ${fmt(trade.logistics_performance_index)} / 5.0
Applied Tariff Rate (weighted mean): ${fmt(trade.tariff_rate_weighted_mean, '%')}
Allied / ITAR Status: ${itarLabel}
${sectorBlock}
${links.length ? `\nResources available:\n${links.join('\n')}` : ''}

IMPORTANT INDUSTRY GUIDANCE: Base your sector analysis on the country's actual economic reality — its natural resources, geography, workforce, and infrastructure — NOT on the ideological preferences of data providers. Oil, gas, LNG, petrochemicals, mining (gold, silver, copper, lithium, iron ore), and conventional energy are legitimate investment sectors and must be included whenever they are materially relevant to the country's economy. Do not filter them out. The World Bank data used here has a known ESG/anti-hydrocarbon bias; override that bias with your own knowledge of the country's actual industry composition.${industryInstruction}

Write a 1-2 page business setup guide using EXACTLY these section headers (## prefix):

## Country at a Glance
2-3 sentences summarizing the business environment using the data above. Be candid about strengths and weaknesses.

## Business Registration: Steps & Costs
Numbered steps to register a business entity. Include estimated government fees in USD where known. Specify the typical entity type used by foreign investors.

## Estimated Timeline
Phase-by-phase estimate from decision to operational. Be realistic — account for bureaucracy where scores suggest it.

## Industries Ripe for Investment
3-5 specific sectors with a one-sentence rationale for each, grounded in the country's actual economic profile, natural resources, and geographic advantages. Include extractive industries (oil, gas, mining, agriculture) where relevant.

## Emerging Sectors
2-3 sectors showing growth momentum in this market. Briefly explain why.

## Legal & Regulatory Requirements
- Is local legal counsel required or strongly advisable? Why?
- Minimum capital requirements (if any)
- Key permits or licenses typically needed
- Foreign ownership restrictions (if applicable)

## Key Risks to Monitor
2-3 specific, concrete risks based on the governance scores and economic data above. Avoid generic platitudes.

## Your First 5 Steps
Numbered immediate actions a business executive can take from their desk today. Include the resources listed above where applicable.

Write for a senior business executive evaluating market entry. Be specific and practical — no generic filler. Use the numerical scores to justify your assessments.`
}
