# WTO API Setup — Bound Tariff Data

## What it adds
- **Bound tariff rate** per country (WTO ceiling commitment)
- **Tariff overhang** = bound − applied (measures policy risk / headroom to raise tariffs)

High overhang (>20 pp) = country can legally raise tariffs significantly without violating WTO commitments.
This is a key reshoring risk signal.

## How to get a free API key (5 minutes)

1. Go to https://apiportal.wto.org/
2. Click **Sign Up** → register with email
3. After email verification, go to **My Apps** → **Create App**
4. Subscribe to the **Statistics API** (free tier: 600 req/day)
5. Copy your **Primary Key**

## How to use locally

```bash
export WTO_API_KEY=your_key_here
python scripts/process_data.py
```

## How to enable in GitHub Actions

1. Go to https://github.com/timengel-1/reshoring-app/settings/secrets/actions
2. Click **New repository secret**
3. Name: `WTO_API_KEY`
4. Value: your API key
5. Click **Add secret**

The next scheduled workflow run (Monday 6am UTC) will automatically fetch WTO bound tariff data
and include it in countries.json. You can also trigger manually via:
Actions → Refresh World Bank Data → Run workflow
