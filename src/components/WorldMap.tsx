import { useEffect, useRef, useState } from 'react'
import { Country, ScoreCategory } from '../types'
import { getScoreColor } from './ScoreBar'

interface City {
  name: string;
  country: string;
  lat: number;
  lon: number;
  pop: number;
  capital: boolean;
}

interface WorldMapProps {
  countries: Country[];
  filteredCountries: Country[];
  scoreCategory: ScoreCategory;
  selectedCountry: Country | null;
  onSelectCountry: (c: Country | null) => void;
}

type GeoFeature = {
  type: string;
  properties: Record<string, string>;
  geometry: object;
}

type GeoJSON = {
  type: string;
  features: GeoFeature[];
}

export default function WorldMap({ countries, filteredCountries, scoreCategory, selectedCountry, onSelectCountry }: WorldMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const leafletRef = useRef<ReturnType<typeof import('leaflet')['map']> | null>(null)
  const geojsonLayerRef = useRef<ReturnType<typeof import('leaflet')['geoJSON']> | null>(null)
  const [L, setL] = useState<typeof import('leaflet') | null>(null)
  const [geoData, setGeoData] = useState<GeoJSON | null>(null)
  const [cities, setCities] = useState<City[]>([])
  const capitalLayerRef = useRef<ReturnType<typeof import('leaflet')['layerGroup']> | null>(null)
  const majorLayerRef = useRef<ReturnType<typeof import('leaflet')['layerGroup']> | null>(null)

  // Build lookup map
  const countryLookup = useRef<Map<string, Country>>(new Map())

  useEffect(() => {
    const lookup = new Map<string, Country>()
    countries.forEach(c => lookup.set(c.code, c))
    countryLookup.current = lookup
  }, [countries])

  // Load Leaflet dynamically
  useEffect(() => {
    import('leaflet').then(leaflet => setL(leaflet))
  }, [])

  // Load GeoJSON
  useEffect(() => {
    fetch('/countries.geojson')
      .then(r => r.json())
      .then((data: GeoJSON) => setGeoData(data))
      .catch(err => console.error('Failed to load GeoJSON:', err))
  }, [])

  // Load cities
  useEffect(() => {
    fetch('/cities.json')
      .then(r => r.json())
      .then((data: City[]) => setCities(data))
      .catch(err => console.error('Failed to load cities:', err))
  }, [])

  // Init map
  useEffect(() => {
    if (!L || !mapRef.current || leafletRef.current) return

    const map = L.map(mapRef.current, {
      center: [20, 10],
      zoom: 2,
      minZoom: 2,
      maxZoom: 10,
      zoomControl: true,
      attributionControl: false,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
      subdomains: 'abcd',
      maxZoom: 10,
    }).addTo(map)

    L.control.attribution({ position: 'bottomright', prefix: '' }).addTo(map)

    leafletRef.current = map

    return () => {
      if (leafletRef.current) {
        leafletRef.current.remove()
        leafletRef.current = null
      }
    }
  }, [L])

  // City markers
  useEffect(() => {
    if (!L || !leafletRef.current || cities.length === 0) return

    const map = leafletRef.current

    // Remove old layers
    if (capitalLayerRef.current) { capitalLayerRef.current.remove(); capitalLayerRef.current = null }
    if (majorLayerRef.current) { majorLayerRef.current.remove(); majorLayerRef.current = null }

    const capitalGroup = L.layerGroup()
    const majorGroup = L.layerGroup()

    cities.forEach(city => {
      const isCapital = city.capital
      const radius = isCapital ? 4 : 3
      const color = isCapital ? '#FBBF24' : '#93C5FD'  // amber for capitals, blue for major
      const fillColor = isCapital ? '#FEF3C7' : '#DBEAFE'

      const marker = L.circleMarker([city.lat, city.lon], {
        radius,
        color,
        fillColor,
        fillOpacity: 0.95,
        weight: 1.5,
        // Raise above country polygons
        pane: 'markerPane',
      })

      // Tooltip shows on hover
      marker.bindTooltip(
        `<div class="country-tooltip"><strong>${city.name}</strong>${isCapital ? ' ★' : ''}<br/><span style="color:#9CA3AF">${isCapital ? 'Capital' : 'Major city'}${city.pop ? ' · ' + (city.pop >= 1_000_000 ? (city.pop / 1_000_000).toFixed(1) + 'M' : (city.pop / 1_000).toFixed(0) + 'K') : ''}</span></div>`,
        { sticky: true, opacity: 1, offset: [18, 0] }
      )

      if (isCapital) {
        capitalGroup.addLayer(marker)
      } else {
        majorGroup.addLayer(marker)
      }
    })

    capitalLayerRef.current = capitalGroup
    majorLayerRef.current = majorGroup

    const updateVisibility = () => {
      const zoom = map.getZoom()
      if (zoom >= 3) {
        if (!map.hasLayer(capitalGroup)) capitalGroup.addTo(map)
      } else {
        if (map.hasLayer(capitalGroup)) capitalGroup.remove()
      }
      if (zoom >= 5) {
        if (!map.hasLayer(majorGroup)) majorGroup.addTo(map)
      } else {
        if (map.hasLayer(majorGroup)) majorGroup.remove()
      }
    }

    map.on('zoomend', updateVisibility)
    updateVisibility()

    return () => {
      map.off('zoomend', updateVisibility)
      capitalGroup.remove()
      majorGroup.remove()
    }
  }, [L, cities])

  // Render GeoJSON layer
  useEffect(() => {
    if (!L || !leafletRef.current || !geoData) return

    const filteredSet = new Set(filteredCountries.map(c => c.code))

    function getScore(country: Country): number | null {
      if (scoreCategory === 'overall') return country.overall_score
      return country.scores[scoreCategory as keyof typeof country.scores] as number | null
    }

    if (geojsonLayerRef.current) {
      geojsonLayerRef.current.remove()
    }

    const layer = L.geoJSON(geoData as Parameters<typeof L.geoJSON>[0], {
      style: (feature) => {
        if (!feature) return { fillColor: '#1f2937', weight: 0.5, fillOpacity: 0.3, color: '#374151' }
        const iso = feature.properties['ISO3166-1-Alpha-3']
        const country = countryLookup.current.get(iso)
        const inFilter = filteredSet.has(iso)

        if (!country) {
          // Territory / no data in our dataset at all
          return {
            fillColor: '#111827',
            weight: 0.5,
            fillOpacity: 0.6,
            color: '#374151',
          }
        }

        if (!inFilter) {
          return {
            fillColor: '#1f2937',
            weight: 0.5,
            fillOpacity: 0.15,
            color: '#374151',
          }
        }

        const score = getScore(country)
        return {
          fillColor: getScoreColor(score),
          weight: 0.8,
          fillOpacity: 0.75,
          color: '#111827',
        }
      },
      onEachFeature: (feature, layer) => {
        const iso = feature.properties['ISO3166-1-Alpha-3']
        const geoName = feature.properties['name'] || iso || 'Unknown territory'
        const country = countryLookup.current.get(iso)

        if (!country) {
          // Territory or region with no data — still show a tooltip
          layer.bindTooltip(
            `<div class="country-tooltip"><strong>${geoName}</strong><br/><span style="color:#9CA3AF">No data available</span></div>`,
            { sticky: true, opacity: 1, offset: [18, 0] }
          )
          return
        }

        const score = getScore(country)
        const scoreStr = score !== null ? score.toFixed(1) : 'No data'
        const label = scoreCategory === 'overall' ? 'Overall' :
          scoreCategory.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

        layer.bindTooltip(
          `<div class="country-tooltip"><strong>${country.name}</strong><br/>${label}: ${scoreStr}</div>`,
          { sticky: true, opacity: 1, offset: [18, 0] }
        )

        layer.on({
          mouseover: (e) => {
            const l = e.target
            l.setStyle({ weight: 2, color: '#60A5FA', fillOpacity: 0.9 })
            l.bringToFront()
          },
          mouseout: (e) => {
            if (geojsonLayerRef.current) {
              geojsonLayerRef.current.resetStyle(e.target)
            }
            if (selectedCountry?.code === iso) {
              e.target.setStyle({ weight: 2, color: '#3B82F6', fillOpacity: 0.95 })
            }
          },
          click: () => {
            onSelectCountry(selectedCountry?.code === iso ? null : country)
          },
        })
      },
    }).addTo(leafletRef.current)

    geojsonLayerRef.current = layer

  }, [L, geoData, filteredCountries, scoreCategory, selectedCountry, onSelectCountry])

  // Highlight selected country
  useEffect(() => {
    if (!geojsonLayerRef.current) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    geojsonLayerRef.current.eachLayer((layer: any) => {
      if (!layer.feature) return
      const iso = layer.feature.properties['ISO3166-1-Alpha-3']
      if (selectedCountry && iso === selectedCountry.code) {
        layer.setStyle({ weight: 2.5, color: '#3B82F6', fillOpacity: 0.95 })
      }
    })
  }, [selectedCountry])

  return (
    <div className="relative flex-1 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {/* Map hint */}
      <div className="absolute bottom-4 left-4 bg-gray-900 bg-opacity-80 text-gray-500 text-xs px-3 py-1.5 rounded-lg border border-gray-800">
        Click a country to view details
      </div>
    </div>
  )
}
