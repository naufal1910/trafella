<template>
  <div class="rounded border bg-white/50 p-2">
    <h3 class="font-medium text-gray-800 mb-2">Live Map</h3>
    <div ref="mapEl" class="w-full h-64 rounded border" aria-label="Itinerary map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import { useItineraryStore, type DaySlot } from '@/stores/itinerary'
import { useGeocoding } from '@/composables/useGeocoding'

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

async function getCoordinates(dayNumber: number, id: DaySlot, label: string): Promise<[number, number]> {
  try {
    // Try geocoding first
    const result = await geocode(label, 100) // Short debounce for map updates
    
    if (result && typeof result.lat === 'number' && typeof result.lng === 'number') {
      return [result.lat, result.lng]
    }
  } catch (error) {
    console.warn('Geocoding failed for', label, error)
  }
  
  // Always fallback to pseudo coords if geocoding fails or returns invalid data
  const idIndex = id === 'morning' ? 0 : id === 'afternoon' ? 1 : 2
  let hash = 0
  for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) >>> 0
  const lat = ((dayNumber * 7 + idIndex * 17 + (hash % 120)) % 120) - 60 // [-60, 60]
  const lng = ((dayNumber * 13 + idIndex * 29 + (hash % 360)) % 360) - 180 // [-180, 180]
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
}

async function rebuildMarkers() {
  if (!L || !map) return
  clearMarkers()
  const days = store.itinerary?.itinerary?.days ?? []
  
  // Process all markers concurrently
  const markerPromises = days.flatMap((d) => {
    const items = store.getDayItems(d.day_number)
    return items.map(async (it) => {
      const latlng = await getCoordinates(d.day_number, it.id, it.label)
      const marker = L.circleMarker(latlng, {
        radius: 8,
        color: '#2563eb',
        weight: 2,
        opacity: 0.9,
        fillColor: '#3b82f6',
        fillOpacity: 0.5,
      })
      marker.addTo(markersLayer)
      marker.on('click', () => store.selectActivity(d.day_number, it.id))
      markerIndex.set(keyFor(d.day_number, it.id), { layer: marker, latlng })
    })
  })
  
  await Promise.all(markerPromises)
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
  }
}

onMounted(async () => {
  // Lazy-load Leaflet only on client
  const mod = await import('leaflet')
  L = (mod as any).default || mod
  // Basic map init
  if (mapEl.value) {
    const tilesUrl = (import.meta as any).env?.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    map = L.map(mapEl.value, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
    })
    L.tileLayer(tilesUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
    markersLayer = L.layerGroup().addTo(map)
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
  store.selected as any,
  () => applySelection(),
  { deep: true }
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
