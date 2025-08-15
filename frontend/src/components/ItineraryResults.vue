<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'
import type { DayPlan } from '@/stores/itinerary'
import * as Sentry from '@sentry/vue'

const store = useItineraryStore()

const itinerary = computed(() => store.itinerary)
const canReset = computed(() => store.hasOriginal && store.itinerary)

// Local editing state per-day
const editing = ref<Record<number, boolean>>({})
const edits = ref<Record<number, Partial<DayPlan>>>({})

function startEdit(day: DayPlan) {
  editing.value[day.day_number] = true
  // Deep clone minimal fields for editing buffer
  edits.value[day.day_number] = {
    date: day.date,
    title: day.title,
    summary: day.summary,
    tips: day.tips,
    activities: {
      morning: day.activities.morning,
      afternoon: day.activities.afternoon,
      evening: day.activities.evening,
    },
  }
}

function cancelEdit(dayNumber: number) {
  editing.value[dayNumber] = false
  delete edits.value[dayNumber]
  try {
    Sentry.addBreadcrumb?.({ category: 'itinerary', type: 'user', level: 'info', message: 'cancelEdit', data: { dayNumber } })
  } catch {}
}

function saveEdit(dayNumber: number) {
  const patch = edits.value[dayNumber]
  if (!patch) return
  store.updateDay(dayNumber, patch)
  editing.value[dayNumber] = false
  try {
    Sentry.addBreadcrumb?.({ category: 'itinerary', type: 'user', level: 'info', message: 'saveEdit', data: { dayNumber } })
  } catch {}
}
</script>

<template>
  <div v-if="itinerary" class="space-y-4" data-testid="itinerary-results">
    <div class="bg-white/60 rounded-lg p-4 shadow">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 class="text-xl font-semibold">Itinerary for {{ itinerary.destination }} ({{ itinerary.duration_days }} days)</h2>
        <div class="flex gap-2">
          <button
            v-if="canReset"
            class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
            @click="store.resetEdits()"
          >Reset edits</button>
          <button
            class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
            @click="store.clearItinerary()"
          >Clear</button>
        </div>
      </div>
    </div>

    <div class="grid gap-4">
      <div v-for="day in itinerary.itinerary.days" :key="day.day_number" class="rounded-lg p-4 border bg-white">
        <div class="flex items-start justify-between gap-2">
          <div>
            <h3 class="text-lg font-semibold mb-1">Day {{ day.day_number }} — {{ day.title }}</h3>
            <p class="text-sm text-gray-600 mb-3">{{ day.date }} — {{ day.summary }}</p>
          </div>
          <button
            class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50"
            @click="editing[day.day_number] ? cancelEdit(day.day_number) : startEdit(day)"
          >
            {{ editing[day.day_number] ? 'Cancel' : 'Edit' }}
          </button>
        </div>

        <template v-if="editing[day.day_number]">
          <div class="grid sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs text-gray-600 mb-1">Date</label>
              <input type="date" v-model="edits[day.day_number].date" class="w-full rounded border px-2 py-1" />
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Title</label>
              <input type="text" v-model="edits[day.day_number].title" class="w-full rounded border px-2 py-1" />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Summary</label>
              <textarea v-model="edits[day.day_number].summary" rows="2" class="w-full rounded border px-2 py-1"></textarea>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Morning</label>
              <textarea v-model="edits[day.day_number].activities!.morning" rows="2" class="w-full rounded border px-2 py-1"></textarea>
            </div>
            <div>
              <label class="block text-xs text-gray-600 mb-1">Afternoon</label>
              <textarea v-model="edits[day.day_number].activities!.afternoon" rows="2" class="w-full rounded border px-2 py-1"></textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Evening</label>
              <textarea v-model="edits[day.day_number].activities!.evening" rows="2" class="w-full rounded border px-2 py-1"></textarea>
            </div>
            <div class="sm:col-span-2">
              <label class="block text-xs text-gray-600 mb-1">Tips</label>
              <input type="text" v-model="edits[day.day_number].tips" class="w-full rounded border px-2 py-1" />
            </div>
          </div>
          <div class="mt-3 flex gap-2">
            <button class="px-3 py-1 text-sm rounded bg-blue-600 text-white hover:bg-blue-700" @click="saveEdit(day.day_number)">Save</button>
            <button class="px-3 py-1 text-sm rounded border bg-white hover:bg-gray-50" @click="cancelEdit(day.day_number)">Discard</button>
          </div>
        </template>
        <template v-else>
          <ul class="space-y-1 text-gray-800">
            <li><strong>Morning:</strong> {{ day.activities.morning }}</li>
            <li><strong>Afternoon:</strong> {{ day.activities.afternoon }}</li>
            <li><strong>Evening:</strong> {{ day.activities.evening }}</li>
          </ul>
          <p v-if="day.tips" class="text-sm text-gray-600 mt-2"><strong>Tips:</strong> {{ day.tips }}</p>
        </template>
      </div>
    </div>
  </div>
  <div v-else class="text-gray-600 text-sm">Fill the form and generate your itinerary.</div>
</template>
