<template>
  <div class="rounded border p-3 bg-white/50">
    <h3 class="font-medium text-gray-800 mb-2">{{ title }}</h3>
    <div
      v-if="timeEditEnabled && errors.length"
      class="mb-2 text-xs text-red-600 space-y-1"
      :data-testid="`day-time-errors-${dayNumber}`"
    >
      <div v-for="(err, i) in errors" :key="i">• {{ err }}</div>
    </div>
    <draggable
      class="space-y-2"
      :list="localItems"
      item-key="id"
      handle=".drag-handle"
      :animation="150"
      @end="onDragEnd"
    >
      <template #item="{ element, index }">
        <div class="space-y-2">
          <div
            class="flex items-center justify-between gap-2 py-2 px-2 rounded border bg-white cursor-pointer"
            :class="isSelected(element) ? 'ring-2 ring-blue-500 border-blue-500' : ''"
            :aria-selected="isSelected(element) ? 'true' : 'false'"
            @click="onSelect(element)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <button class="drag-handle cursor-grab px-1" aria-label="Drag to reorder" title="Drag to reorder">⋮⋮</button>
              <span class="truncate text-sm">{{ element.label }}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button class="text-xs px-2 py-1 border rounded" @click.stop="moveUp(index)" aria-label="Move up">↑</button>
              <button class="text-xs px-2 py-1 border rounded" @click.stop="moveDown(index)" aria-label="Move down">↓</button>
            </div>
          </div>
          <div v-if="timeEditEnabled" class="ml-6 flex items-center gap-2">
            <label :for="`start-${dayNumber}-${element.id}`" class="text-xs text-gray-600">Start</label>
            <input
              :id="`start-${dayNumber}-${element.id}`"
              class="border rounded px-1 py-0.5 text-xs"
              type="time"
              :data-testid="`start-time-${dayNumber}-${element.id}`"
              :value="getTimeFor(element.id)?.startTime"
              @input.stop="onStartChange(element.id, ($event.target as HTMLInputElement).value)"
            />
            <label :for="`end-${dayNumber}-${element.id}`" class="text-xs text-gray-600 ml-2">End</label>
            <input
              :id="`end-${dayNumber}-${element.id}`"
              class="border rounded px-1 py-0.5 text-xs"
              type="time"
              :data-testid="`end-time-${dayNumber}-${element.id}`"
              :value="getTimeFor(element.id)?.endTime"
              @input.stop="onEndChange(element.id, ($event.target as HTMLInputElement).value)"
            />
          </div>
        </div>
      </template>
    </draggable>
  </div>
</template>

<script setup lang="ts">
import draggable from 'vuedraggable'
import { ref, watch, computed, onMounted, unref } from 'vue'
import { useItineraryStore, type DayItem } from '@/stores/itinerary'
import type { ActivityItem } from '@/types/planner'

const props = defineProps<{ dayNumber: number; title: string }>()
const store = useItineraryStore()

const items = computed<DayItem[]>(() => store.getDayItems(props.dayNumber))
const localItems = ref<DayItem[]>([...items.value])
const timeEditEnabled = (((import.meta as any).env?.VITE_TIME_EDIT_ENABLED ?? '').toString().toLowerCase() === 'true')
const times = ref<ActivityItem[]>([])
const errors = computed(() => store.getTimeValidation(props.dayNumber))

watch(
  () => store.itinerary,
  () => {
    localItems.value = [...items.value]
    if (timeEditEnabled) refreshTimes()
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

function onSelect(el: DayItem) {
  store.selectActivity(props.dayNumber, el.id)
}

function isSelected(el: DayItem) {
  const sel = unref(store.selected as any)
  return !!sel && sel.dayNumber === props.dayNumber && sel.id === el.id
}

function refreshTimes() {
  times.value = store.getDayActivitiesWithTimes(props.dayNumber)
}

function getTimeFor(id: string | number) {
  const hit = times.value.find((t) => String(t.id) === String(id))
  return hit
}

function onStartChange(id: string | number, value: string) {
  store.updateActivityTime(props.dayNumber, String(id), { startTime: value })
  refreshTimes()
}

function onEndChange(id: string | number, value: string) {
  store.updateActivityTime(props.dayNumber, String(id), { endTime: value })
  refreshTimes()
}

onMounted(() => {
  if (timeEditEnabled) refreshTimes()
})
</script>

<style scoped>
</style>
