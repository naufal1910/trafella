<template>
  <div class="rounded border bg-white/50 p-2 lg:p-3">
    <h3 class="font-medium text-gray-800 mb-2">Live Map</h3>
    <div ref="mapEl" class="w-full h-72 sm:h-80 lg:h-[calc(100vh-8rem)] rounded border" aria-label="Itinerary map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useItineraryStore, type DaySlot } from '@/stores/itinerary'
import { useGeocoding } from '@/composables/useGeocoding'
import * as Sentry from '@sentry/vue'

const mapEl = ref<HTMLDivElement | null>(null)
const store = useItineraryStore()
const { geocode } = useGeocoding()

let L: any = null
let map: any = null
let markersLayer: any = null
const markerIndex = new Map<string, { layer: any; latlng: [number, number] }>()

function keyFor(dayNumber: number, id: DaySlot) {
  return `${dayNumber}:${id}`
}

// Get fallback coordinates based on destination
function getFallbackCoordinates(destination?: string): { lat: number; lng: number } {
  // Default coordinates for major Southeast Asian cities
  const cityCoords: Record<string, { lat: number; lng: number }> = {
    'jakarta': { lat: -6.2088, lng: 106.8456 },
    'bali': { lat: -8.3405, lng: 115.0920 },
    'denpasar': { lat: -8.6705, lng: 115.2126 },
    'yogyakarta': { lat: -7.7956, lng: 110.3695 },
    'bandung': { lat: -6.9175, lng: 107.6191 },
    'surabaya': { lat: -7.2575, lng: 112.7521 },
    'kuala lumpur': { lat: 3.1390, lng: 101.6869 },
    'singapore': { lat: 1.3521, lng: 103.8198 },
    'bangkok': { lat: 13.7563, lng: 100.5018 },
    'manila': { lat: 14.5995, lng: 120.9842 },
    'ho chi minh': { lat: 10.8231, lng: 106.6297 },
    'hanoi': { lat: 21.0285, lng: 105.8542 }
  }
  
  if (destination) {
    const destLower = destination.toLowerCase()
    // Try to find matching city
    for (const [city, coords] of Object.entries(cityCoords)) {
      if (destLower.includes(city)) {
        return coords
      }
    }
  }
  
  // Default to Jakarta if no match found
  return cityCoords.jakarta
}

async function getCoordinates(dayNumber: number, id: DaySlot, label: string): Promise<[number, number]> {
  // Get destination context for both geocoding and fallback
  const destination = store.itinerary?.destination
  
  try {
    // Try geocoding first with destination context
    const result = await geocode(label, 100, destination) // Short debounce for map updates
    
    if (result && typeof result.lat === 'number' && typeof result.lng === 'number') {
      return [result.lat, result.lng]
    }
  } catch (error) {
    console.warn('Geocoding failed for', label, error)
  }
  
  // Always fallback to pseudo coords if geocoding fails or returns invalid data
  // Use destination-aware fallback coordinates
  const fallbackCoords = getFallbackCoordinates(destination)
  const idIndex = id === 'morning' ? 0 : id === 'afternoon' ? 1 : 2
  let hash = 0
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0
  
  const variation = 0.15 // ~15km radius for better spread
  
  // Spread markers more by day to avoid clustering
  const dayOffset = (dayNumber - 1) * 0.03 // Each day gets different area
  const lat = fallbackCoords.lat + dayOffset + ((idIndex * 37 + (hash % 100)) % 100 - 50) * variation / 50
  const lng = fallbackCoords.lng + dayOffset + (((idIndex * 41 + ((hash >> 8) % 100)) % 100 - 50) * variation / 50)
  
  console.log('Using fallback coordinates for', label, ':', [lat, lng])
  return [lat, lng]
}

function clearMarkers() {
  markerIndex.clear()
  if (markersLayer) {
    try {
      markersLayer.remove()
    } catch {}
  }
  markersLayer = L.layerGroup().addTo(map)
  try {
    Sentry.addBreadcrumb?.({ category: 'map', type: 'info', level: 'info', message: 'clear_markers' })
  } catch {}
}

async function rebuildMarkers() {
  if (!L || !map) return
  clearMarkers()
  const days = store.itinerary?.itinerary?.days ?? []
  try {
    const planned = days.reduce((acc, d) => acc + store.getDayItems(d.day_number).length, 0)
    Sentry.addBreadcrumb?.({
      category: 'map',
      type: 'info',
      level: 'info',
      message: 'rebuild_start',
      data: { days: days.map(d => d.day_number), planned }
    })
  } catch {}

  // Process all markers concurrently
  const markerPromises = days.flatMap((d) => {
    const items = store.getDayItems(d.day_number)
    return items.map(async (it) => {
      const latlng = await getCoordinates(d.day_number, it.id, it.label)
      // Different colors for each day
      const dayColors: Record<number, { color: string; fillColor: string }> = {
        1: { color: '#dc2626', fillColor: '#ef4444' }, // red
        2: { color: '#2563eb', fillColor: '#3b82f6' }, // blue  
        3: { color: '#16a34a', fillColor: '#22c55e' }, // green
        4: { color: '#ca8a04', fillColor: '#eab308' }, // yellow
        5: { color: '#9333ea', fillColor: '#a855f7' }, // purple
      }
      const colors = dayColors[d.day_number] ?? dayColors[1]
      
      const marker = L.circleMarker(latlng, {
        radius: 10,
        color: colors.color,
        weight: 3,
        opacity: 1,
        fillColor: colors.fillColor,
        fillOpacity: 0.7,
      })
      marker.addTo(markersLayer)
      marker.on('click', () => store.selectActivity(d.day_number, it.id))
      markerIndex.set(keyFor(d.day_number, it.id), { layer: marker, latlng })
    })
  })
  
  await Promise.all(markerPromises)
  console.log('Total markers created:', markerIndex.size)
  try {
    Sentry.addBreadcrumb?.({
      category: 'map',
      type: 'info',
      level: 'info',
      message: 'rebuild_done',
      data: { created: markerIndex.size }
    })
  } catch {}
  applySelection()
}

function applySelection() {
  if (!L || !map) return
  // Reset styles
  markerIndex.forEach(({ layer }) => {
    try { layer.setStyle && layer.setStyle({ color: '#374151', fillColor: '#3b82f6', radius: 6 }) } catch {}
  })
  const selRef: any = (store as any).selected
  const sel = selRef && 'value' in selRef ? selRef.value : selRef
  if (!sel) return
  const hit = markerIndex.get(keyFor(sel.dayNumber, sel.id))
  if (hit) {
    try { hit.layer.setStyle && hit.layer.setStyle({ color: '#1d4ed8', fillColor: '#1d4ed8', radius: 8 }) } catch {}
    try { hit.layer.bringToFront && hit.layer.bringToFront() } catch {}
    try { map.setView(hit.latlng, Math.max(10, map.getZoom?.() || 10), { animate: true }) } catch {}
    try {
      Sentry.addBreadcrumb?.({
        category: 'map:select',
        type: 'info',
        level: 'info',
        message: 'apply_selection',
        data: { dayNumber: sel.dayNumber, id: sel.id }
      })
    } catch {}
  }
}

onMounted(async () => {
  // Lazy-load Leaflet only on client
  const mod = await import('leaflet')
  L = (mod as any).default || mod
  // Basic map init
  if (mapEl.value) {
    const tilesUrl = import.meta.env.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    // Use destination-aware center coordinates
    const destination = store.itinerary?.destination
    const centerCoords = getFallbackCoordinates(destination)
    map = L.map(mapEl.value, {
      center: [centerCoords.lat, centerCoords.lng],
      zoom: 10, // Wider view to see all markers
      zoomControl: true,
    })
    L.tileLayer(tilesUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    markersLayer = L.layerGroup().addTo(map)
    try {
      Sentry.addBreadcrumb?.({
        category: 'map',
        type: 'info',
        level: 'info',
        message: 'init',
        data: { tilesUrl, destination }
      })
    } catch {}
    rebuildMarkers()
  }
})

watch(
  () => store.itinerary,
  () => {
    // Use setTimeout to avoid blocking UI during geocoding
    setTimeout(() => rebuildMarkers(), 0)
  },
  { deep: true }
)

watch(
  () => (store as any).selected?.value,
  () => applySelection()
)

onBeforeUnmount(() => {
  try { map && map.remove && map.remove() } catch {}
  markerIndex.clear()
  markersLayer = null
  map = null
})
</script>

<style scoped>
/* Leaflet default styles (minimal) — consumers should include CSS globally if desired */
</style>
