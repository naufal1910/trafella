<script setup lang="ts">
import ItineraryForm from '@/components/ItineraryForm.vue'
import ItineraryResults from '@/components/ItineraryResults.vue'
</script>

<template>
  <div class="min-h-screen py-8">
    <div class="mx-auto max-w-5xl px-4">
      <header class="mb-8">
        <h1 class="text-3xl font-bold">Trafella — AI Itinerary Generator</h1>
        <p class="text-gray-600">Plan a trip in seconds. Enter details below.</p>
      </header>

      <div class="grid gap-6 md:grid-cols-2">
        <ItineraryForm />
        <ItineraryResults />
      </div>
    </div>
  </div>
  
</template>

<style scoped>
</style>
