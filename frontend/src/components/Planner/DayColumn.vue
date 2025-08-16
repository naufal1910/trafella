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
    <p class="sr-only" aria-live="polite" role="status">{{ liveMsg }}</p>
    <draggable
      class="space-y-2"
      :list="localItems"
      item-key="id"
      handle=".drag-handle"
      :animation="150"
      @end="onDragEnd"
      role="listbox"
      :aria-label="`Activities for ${title}`"
      :aria-activedescendant="activeDescendantId"
    >
      <template #item="{ element, index }">
        <div class="space-y-2">
          <div
            class="flex items-center justify-between gap-2 py-2 px-2 rounded border bg-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :class="isSelected(element) ? 'ring-2 ring-blue-500 border-blue-500' : ''"
            :aria-selected="isSelected(element) ? 'true' : 'false'"
            role="option"
            :id="`day-${dayNumber}-item-${element.id}`"
            :tabindex="0"
            @click="onSelect(element)"
            @keydown="onItemKeydown($event, element, index)"
          >
            <div class="flex items-center gap-2 min-w-0">
              <button
                class="drag-handle cursor-grab inline-flex items-center justify-center w-8 h-8 rounded hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                aria-label="Drag to reorder"
                title="Drag to reorder"
              >⋮⋮</button>
              <span class="truncate text-sm">{{ element.label }}</span>
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button
                class="inline-flex items-center justify-center w-8 h-8 text-xs border rounded hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                @click.stop="moveUp(index)"
                aria-label="Move up"
              >↑</button>
              <button
                class="inline-flex items-center justify-center w-8 h-8 text-xs border rounded hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500"
                @click.stop="moveDown(index)"
                aria-label="Move down"
              >↓</button>
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
const timeEditEnabled = (String(import.meta.env?.VITE_TIME_EDIT_ENABLED ?? '').toLowerCase() === 'true')
const times = ref<ActivityItem[]>([])
const errors = computed(() => store.getTimeValidation(props.dayNumber))
const liveMsg = ref('')
const activeDescendantId = computed(() => {
  const sel = unref(store.selected as any)
  return sel && sel.dayNumber === props.dayNumber ? `day-${props.dayNumber}-item-${sel.id}` : undefined
})

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
    const movedLabel = localItems.value?.[from]?.label ?? String(from)
    store.reorderActivity(props.dayNumber, from, to)
    announce(`Moved ${movedLabel} from position ${from + 1} to ${to + 1}`)
  }
}

function moveUp(index: number) {
  store.moveItemUp(props.dayNumber, index)
  const lbl = localItems.value?.[index]?.label ?? ''
  announce(`Moved ${lbl} up`)
}

function moveDown(index: number) {
  const len = localItems.value.length
  if (index >= len - 1) return
  store.moveItemDown(props.dayNumber, index)
  const lbl = localItems.value?.[index]?.label ?? ''
  announce(`Moved ${lbl} down`)
}

function onSelect(el: DayItem) {
  store.selectActivity(props.dayNumber, el.id)
  announce(`Selected ${el.label}`)
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

function onItemKeydown(e: KeyboardEvent, el: DayItem, index: number) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault()
    onSelect(el)
    return
  }
  if ((e.key === 'ArrowUp' || (e as any).key === 'Up') && (e.altKey || e.ctrlKey)) {
    e.preventDefault()
    moveUp(index)
    return
  }
  if ((e.key === 'ArrowDown' || (e as any).key === 'Down') && (e.altKey || e.ctrlKey)) {
    e.preventDefault()
    moveDown(index)
    return
  }
}

function announce(msg: string) {
  try {
    liveMsg.value = msg
    // Clear message after a short delay so repeated updates are announced
    window.setTimeout(() => {
      liveMsg.value = ''
    }, 1000)
  } catch {}
}

onMounted(() => {
  if (timeEditEnabled) refreshTimes()
})
</script>

<style scoped>
</style>
