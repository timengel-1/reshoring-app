"""
Download Natural Earth populated places and extract:
- All capital cities
- Major cities (pop > 1M, or top 3 per country for larger economies)
Output: public/cities.json
"""
import json, urllib.request, os

OUTPUT = os.path.join(os.path.dirname(__file__), '..', 'public', 'cities.json')
URL = 'https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_10m_populated_places.geojson'

print('Downloading Natural Earth populated places...')
with urllib.request.urlopen(URL, timeout=30) as r:
    raw = json.load(r)

print(f'Total features: {len(raw["features"])}')

# Sample the properties to understand the schema
sample = raw['features'][0]['properties']
print('Sample properties:', list(sample.keys()))

cities = []
by_country = {}  # iso3 -> list of non-capital cities by pop

for feat in raw['features']:
    p = feat['properties']
    coords = feat['geometry']['coordinates']  # [lon, lat]
    if not coords or len(coords) < 2:
        continue

    lon, lat = coords[0], coords[1]
    name = p.get('NAME') or p.get('name') or ''
    pop = p.get('POP_MAX') or p.get('pop_max') or 0
    iso3 = p.get('ADM0_A3') or p.get('adm0_a3') or ''
    is_capital = (p.get('FEATURECLA') or '').lower().startswith('admin-0 capital') or \
                 (p.get('featurecla') or '').lower().startswith('admin-0 capital')
    # Also check SCALERANK — capitals are typically rank 1-3
    scalerank = p.get('SCALERANK') or p.get('scalerank') or 10

    if not name or not iso3:
        continue

    entry = {
        'name': name,
        'country': iso3,
        'lat': round(lat, 4),
        'lon': round(lon, 4),
        'pop': int(pop) if pop else 0,
        'capital': is_capital,
    }

    if is_capital:
        cities.append(entry)
    else:
        if iso3 not in by_country:
            by_country[iso3] = []
        by_country[iso3].append(entry)

print(f'Capitals found: {len(cities)}')

# For each country, add major cities by population
# Threshold: pop > 1M globally, or top 2 for any country
added_major = 0
for iso3, city_list in by_country.items():
    city_list.sort(key=lambda x: x['pop'], reverse=True)
    # Add cities with pop > 1M
    count = 0
    for c in city_list:
        if c['pop'] >= 1_000_000 and count < 5:
            cities.append(c)
            count += 1
            added_major += 1
        elif count == 0 and c['pop'] >= 500_000:
            # For countries where biggest city has 500K-1M, add the top 1
            cities.append(c)
            count += 1
            added_major += 1
        if count >= 5:
            break

print(f'Major cities added: {added_major}')
print(f'Total city entries: {len(cities)}')

# Remove duplicate names in same country (capitals can appear twice)
seen = set()
deduped = []
for c in cities:
    key = (c['name'].lower(), c['country'])
    if key not in seen:
        seen.add(key)
        deduped.append(c)

print(f'After dedup: {len(deduped)}')

# Sort: capitals first, then by population descending
deduped.sort(key=lambda x: (not x['capital'], -(x['pop'] or 0)))

with open(OUTPUT, 'w') as f:
    json.dump(deduped, f, separators=(',', ':'))

size_kb = os.path.getsize(OUTPUT) / 1024
print(f'Saved to {OUTPUT} ({size_kb:.1f} KB)')

# Show sample
print('\nSample entries:')
for c in deduped[:5]:
    print(f"  {c['name']} ({c['country']}) cap={c['capital']} pop={c['pop']:,}")
