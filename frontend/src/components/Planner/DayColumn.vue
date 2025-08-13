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
        <div
          class="flex items-center justify-between gap-2 py-2 px-2 rounded border bg-white cursor-pointer"
          :class="isSelected(element) ? 'ring-2 ring-blue-500 border-blue-500' : ''"
          @click="onSelect(element)"
        >
          <div class="flex items-center gap-2 min-w-0">
            <button class="drag-handle cursor-grab px-1" aria-label="Drag to reorder" title="Drag to reorder">⋮⋮</button>
            <span class="truncate text-sm">{{ element.label }}</span>
          </div>
          <div class="flex items-center gap-2 shrink-0">
            <template v-if="timeEditEnabled">
              <div class="flex items-center gap-1" @click.stop>
                <label :for="`${element.id}-start`" class="sr-only">Start time for {{ element.label }}</label>
                <input
                  :id="`${element.id}-start`"
                  type="time"
                  class="border rounded px-2 py-1 text-xs"
                  :value="activityById(element.id)?.startTime || ''"
                  @change="onTimeInput(element.id, 'startTime', ($event.target as HTMLInputElement).value)"
                  data-testid="time-start"
                />
                <span class="text-xs">–</span>
                <label :for="`${element.id}-end`" class="sr-only">End time for {{ element.label }}</label>
                <input
                  :id="`${element.id}-end`"
                  type="time"
                  class="border rounded px-2 py-1 text-xs"
                  :value="activityById(element.id)?.endTime || ''"
                  @change="onTimeInput(element.id, 'endTime', ($event.target as HTMLInputElement).value)"
                  data-testid="time-end"
                />
              </div>
              <p v-if="errors[element.id]" class="text-xs text-red-600" role="alert">{{ errors[element.id] }}</p>
            </template>
            <button class="text-xs px-2 py-1 border rounded" @click.stop="moveUp(index)" aria-label="Move up">↑</button>
            <button class="text-xs px-2 py-1 border rounded" @click.stop="moveDown(index)" aria-label="Move down">↓</button>
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
import * as Sentry from '@sentry/vue'
import { validateTimes } from '@/utils/timeUtils'

const props = defineProps<{ dayNumber: number; title: string }>()
const store = useItineraryStore()

const items = computed<DayItem[]>(() => store.getDayItems(props.dayNumber))
const localItems = ref<DayItem[]>([...items.value])
const timeEditEnabled = (import.meta as any).env?.VITE_TIME_EDIT_ENABLED === 'true'
const errors = ref<Record<string, string | null>>({})

const activities = computed(() => (timeEditEnabled ? store.getDayActivitiesWithTimes(props.dayNumber) : []))
function activityById(id: DayItem['id']) {
  return activities.value.find((a) => String(a.id) === String(id))
}

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

function onSelect(el: DayItem) {
  store.selectActivity(props.dayNumber, el.id)
}

function isSelected(el: DayItem) {
  const sel = store.selected
  return !!sel && sel.dayNumber === props.dayNumber && sel.id === el.id
}

function onTimeInput(id: DayItem['id'], field: 'startTime' | 'endTime', value: string) {
  if (!timeEditEnabled) return
  // Basic format guard: HH:MM
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/
  if (!timeRegex.test(value)) {
    errors.value[String(id)] = 'Invalid time (HH:MM)'
    try {
      Sentry.addBreadcrumb?.({
        category: 'planner:time_edit',
        type: 'error',
        level: 'error',
        message: 'invalid_time_format',
        data: { id, field, value },
      })
    } catch {}
    return
  }

  const list = store.getDayActivitiesWithTimes(props.dayNumber)
  const idx = list.findIndex((x) => String(x.id) === String(id))
  if (idx === -1) return
  const candidate = list.map((x, i) => (i === idx ? { ...x, [field]: value } : x))
  const res = validateTimes(candidate)
  if (!res.isValid) {
    // Allow reflow to handle most issues, but surface an inline hint
    errors.value[String(id)] = res.errors.find((e) => e.includes(list[idx].name)) || 'Please adjust times within 06:00–23:00'
  } else {
    errors.value[String(id)] = null
  }
  store.updateActivityTime(props.dayNumber, String(id), { [field]: value } as any)
}
</script>

<style scoped>
</style>
