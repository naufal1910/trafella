<script setup lang="ts">
import { ref, computed } from 'vue'
import { useItineraryStore } from '@/stores/itinerary'

const store = useItineraryStore()

const destination = ref('')
const startDate = ref('')
const endDate = ref('')
const interestsInput = ref('') // comma-separated
const budget = ref('')
const partySize = ref(1)

const isDisabled = computed(() => !destination.value || !startDate.value || !endDate.value)

function onSubmit() {
  const interests = interestsInput.value
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)

  store.generateItinerary({
    destination: destination.value,
    start_date: startDate.value,
    end_date: endDate.value,
    interests,
    budget: budget.value || undefined,
    party_size: partySize.value,
  })
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4 bg-white/50 rounded-lg p-4 shadow">
    <div>
      <label class="block text-sm font-medium mb-1">Destination</label>
      <input v-model="destination" type="text" class="w-full border rounded px-3 py-2" placeholder="e.g., Paris" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Start Date</label>
        <input v-model="startDate" type="date" class="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">End Date</label>
        <input v-model="endDate" type="date" class="w-full border rounded px-3 py-2" />
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium mb-1">Interests (comma-separated)</label>
      <input v-model="interestsInput" type="text" class="w-full border rounded px-3 py-2" placeholder="art, food, culture" />
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium mb-1">Budget</label>
        <select v-model="budget" class="w-full border rounded px-3 py-2">
          <option value="">No preference</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Party Size</label>
        <input v-model.number="partySize" min="1" type="number" class="w-full border rounded px-3 py-2" />
      </div>
    </div>

    <div class="flex items-center gap-3">
      <button :disabled="isDisabled || store.loading" type="submit" class="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded">
        {{ store.loading ? 'Generating...' : 'Generate Itinerary' }}
      </button>
      <span v-if="store.error" class="text-red-600 text-sm">{{ store.error }}</span>
    </div>
  </form>
</template>
