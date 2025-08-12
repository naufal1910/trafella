<template>
  <div class="rounded border bg-white/50 p-2">
    <h3 class="font-medium text-gray-800 mb-2">Live Map (M2 skeleton)</h3>
    <div ref="mapEl" class="w-full h-64 rounded border" aria-label="Itinerary map"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

const mapEl = ref<HTMLDivElement | null>(null)

onMounted(async () => {
  // Lazy-load Leaflet only on client
  const [{ default: L }] = await Promise.all([
    import('leaflet') as any,
  ])
  // Basic map init
  if (mapEl.value) {
    const tilesUrl = (import.meta as any).env?.VITE_MAP_TILES_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
    const map = L.map(mapEl.value, {
      center: [0, 0],
      zoom: 2,
      zoomControl: true,
    })
    L.tileLayer(tilesUrl, {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)
  }
})
</script>

<style scoped>
/* Leaflet default styles (minimal) — consumers should include CSS globally if desired */
</style>
