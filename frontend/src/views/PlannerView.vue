<template>
  <div class="max-w-6xl mx-auto p-4">
    <h1 class="text-xl font-semibold mb-4">Planner (M1)</h1>

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
import { useItineraryStore } from '@/stores/itinerary'
import DayColumn from '@/components/Planner/DayColumn.vue'

const store = useItineraryStore()

onMounted(() => {
  // Try restoring prior edits
  store.loadFromStorage()
})

const hasPlan = computed(() => !!store.itinerary?.itinerary?.days?.length)

const days = computed(() => store.itinerary?.itinerary?.days ?? [])
</script>

<style scoped>
</style>
