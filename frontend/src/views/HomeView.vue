<script setup lang="ts">
import { onMounted } from 'vue'
import ItineraryForm from '@/components/ItineraryForm.vue'
import ItineraryResults from '@/components/ItineraryResults.vue'
import { useItineraryStore } from '@/stores/itinerary'

const store = useItineraryStore()
const restored = { value: false }
const plannerEnabled = ((import.meta.env.VITE_PLANNER_ENABLED ?? '').toString().toLowerCase() === 'true')
onMounted(() => {
  restored.value = store.loadFromStorage()
  let flag: string | null = null
  try {
    flag = sessionStorage.getItem('planner_return')
    if (flag) sessionStorage.removeItem('planner_return')
  } catch {}

  const toast = (msg: string) => {
    const el = document.createElement('div')
    el.className = 'fixed top-3 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-3 py-1 rounded shadow z-50'
    el.textContent = msg
    document.body.appendChild(el)
    setTimeout(() => { el.remove() }, 2500)
  }

  if (flag === 'changed') {
    toast('Changes saved locally')
  } else if (restored.value) {
    toast('Restored from last session')
  }
})
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto max-w-5xl px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Trafella — AI Itinerary Generator</h1>
        <p class="text-gray-600">Plan a trip in seconds. Enter details below.</p>
        <div v-if="plannerEnabled" class="mt-2">
          <router-link class="text-blue-600 underline text-sm" to="/planner">Open Planner (experimental)</router-link>
        </div>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <ItineraryForm />
        <ItineraryResults />
      </div>
    </div>
  </div>
</template>
