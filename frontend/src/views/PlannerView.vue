<template>
  <div class="max-w-6xl mx-auto p-4">
    <div class="mb-4 flex items-center justify-between gap-3">
      <h1 class="text-xl font-semibold">Planner (M1)</h1>
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm"
          @click="onReset"
          aria-label="Reset changes and restore original itinerary"
        >
          Reset
        </button>
        <button
          type="button"
          class="px-3 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
          @click="onConfirm"
          aria-label="Back to Home (saves changes if any)"
        >
          Back to Home
        </button>
      </div>
    </div>

    <div v-if="!hasPlan" class="text-sm text-gray-600">
      No itinerary found. Generate one on the Home page first.
      <router-link class="text-blue-600 underline" to="/">Go to Home</router-link>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <DayColumn
        v-for="day in days"
        :key="day.day_number"
        :day-number="day.day_number"
        :title="day.title || `Day ${day.day_number}`"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useItineraryStore } from '@/stores/itinerary'
import DayColumn from '@/components/Planner/DayColumn.vue'

const store = useItineraryStore()
const router = useRouter()

onMounted(() => {
  // Try restoring prior edits
  store.loadFromStorage()
})

const hasPlan = computed(() => !!store.itinerary?.itinerary?.days?.length)

const days = computed(() => store.itinerary?.itinerary?.days ?? [])

function onConfirm() {
  // Explicitly persist, then navigate back to Home
  store.commitPlannerChanges()
  router.push({ path: '/' })
}

function onReset() {
  store.resetEdits()
}
</script>

<style scoped>
</style>
