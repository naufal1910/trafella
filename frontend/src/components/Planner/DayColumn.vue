<template>
  <div class="rounded border p-3 bg-white/50">
    <h3 class="font-medium text-gray-800 mb-2">{{ title }}</h3>
    <draggable
      class="space-y-2"
      :list="localItems"
      item-key="id"
      handle=".drag-handle"
      :animation="150"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="flex items-center justify-between gap-2 py-2 px-2 rounded border bg-white">
          <div class="flex items-center gap-2 min-w-0">
            <button class="drag-handle cursor-grab px-1" aria-label="Drag to reorder" title="Drag to reorder">⋮⋮</button>
            <span class="truncate text-sm">{{ element.label }}</span>
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <button class="text-xs px-2 py-1 border rounded" @click="moveUp(index)" aria-label="Move up">↑</button>
            <button class="text-xs px-2 py-1 border rounded" @click="moveDown(index)" aria-label="Move down">↓</button>
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, watch, computed } from 'vue'
import { useItineraryStore, type DayItem } from '@/stores/itinerary'

const props = defineProps<{ dayNumber: number; title: string }>()
const store = useItineraryStore()

const items = computed<DayItem[]>(() => store.getDayItems(props.dayNumber))
const localItems = ref<DayItem[]>([...items.value])

watch(
  () => store.itinerary,
  () => {
    localItems.value = [...items.value]
  },
  { deep: true }
)

function onDragEnd(evt: any) {
  const from = Number(evt?.oldIndex)
  const to = Number(evt?.newIndex)
  if (Number.isFinite(from) && Number.isFinite(to)) {
    store.reorderActivity(props.dayNumber, from, to)
  }
}

function moveUp(index: number) {
  store.moveItemUp(props.dayNumber, index)
}

function moveDown(index: number) {
  store.moveItemDown(props.dayNumber, index)
}
</script>

<style scoped>
</style>
