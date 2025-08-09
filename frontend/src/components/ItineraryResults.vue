<script setup lang="ts">
import { computed } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'

const store = useItineraryStore()

const itinerary = computed(() => store.itinerary)
</script>

<template>
  <div v-if="itinerary" class="space-y-4">
    <div class="bg-white/60 rounded-lg p-4 shadow">
      <h2 class="text-xl font-semibold">Itinerary for {{ itinerary.destination }} ({{ itinerary.duration_days }} days)</h2>
    </div>

    <div class="grid gap-4">
      <div v-for="day in itinerary.itinerary.days" :key="day.day_number" class="rounded-lg p-4 border bg-white">
        <h3 class="text-lg font-semibold mb-1">Day {{ day.day_number }} — {{ day.title }}</h3>
        <p class="text-sm text-gray-600 mb-3">{{ day.date }} — {{ day.summary }}</p>
        <ul class="space-y-1 text-gray-800">
          <li><strong>Morning:</strong> {{ day.activities.morning }}</li>
          <li><strong>Afternoon:</strong> {{ day.activities.afternoon }}</li>
          <li><strong>Evening:</strong> {{ day.activities.evening }}</li>
        </ul>
        <p v-if="day.tips" class="text-sm text-gray-600 mt-2"><strong>Tips:</strong> {{ day.tips }}</p>
      </div>
    </div>
  </div>
  <div v-else class="text-gray-600 text-sm">Fill the form and generate your itinerary.</div>
</template>
