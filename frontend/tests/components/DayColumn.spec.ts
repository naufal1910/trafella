import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import DayColumn from '@/components/Planner/DayColumn.vue'
import { useItineraryStore, type ItineraryResponse } from '@/stores/itinerary'

function sampleItinerary(): ItineraryResponse {
  return {
    destination: 'Tokyo',
    duration_days: 1,
    itinerary: {
      days: [
        {
          day_number: 1,
          date: '2025-01-01',
          title: 'Day 1',
          summary: 'Intro day',
          activities: {
            morning: 'Visit Senso-ji Temple',
            afternoon: 'Explore Akihabara',
            evening: 'Shibuya Crossing & dinner',
          },
          tips: '',
        },
      ],
    },
  }
}

describe('DayColumn (Planner M1)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders items and supports drag reorder via @end event', async () => {
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false }),
        ],
        stubs: {
          // Stub draggable to simplify testing: render slot content and expose @end
          draggable: {
            template: '<div><slot name="item" v-for="(el, i) in $attrs.list" :element="el" :index="i" /></div>',
          },
        },
      },
      props: { dayNumber: 1, title: 'Day 1' },
    })

    const store = useItineraryStore()
    // Seed real store state after mount so computed can pick it up
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any
    await wrapper.vm.$nextTick()

    // Verify initial order
    const labels = wrapper.findAll('span.truncate').map((n) => n.text())
    expect(labels).toEqual([
      'Visit Senso-ji Temple',
      'Explore Akihabara',
      'Shibuya Crossing & dinner',
    ])

    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem')

    // Simulate drag end oldIndex:0 -> newIndex:2 by calling component method
    // Access component vm to invoke onDragEnd directly
    // @ts-ignore accessing internal
    await (wrapper.vm as any).onDragEnd({ oldIndex: 0, newIndex: 2 })

    await wrapper.vm.$nextTick()

    const labelsAfter = wrapper.findAll('span.truncate').map((n) => n.text())
    expect(labelsAfter).toEqual([
      'Explore Akihabara',
      'Shibuya Crossing & dinner',
      'Visit Senso-ji Temple',
    ])

    expect(setItemSpy).toHaveBeenCalled()
  })

  it('keyboard fallback: up/down buttons call store helpers', async () => {
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          draggable: {
            template: '<div><slot name="item" v-for="(el, i) in $attrs.list" :element="el" :index="i" /></div>',
          },
        },
      },
      props: { dayNumber: 1, title: 'Day 1' },
    })

    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any
    await wrapper.vm.$nextTick()

    const buttons = wrapper.findAll('button')
    // buttons order: many; filter up/down by text
    const upBtn = buttons.find((b) => b.text() === '↑')!
    const downBtn = buttons.find((b) => b.text() === '↓')!

    await downBtn.trigger('click') // move index 0 -> 1
    await wrapper.vm.$nextTick()

    let labels = wrapper.findAll('span.truncate').map((n) => n.text())
    expect(labels[0]).toBe('Explore Akihabara')

    await upBtn.trigger('click') // attempt to move up first item (now index 0) — no change
    await wrapper.vm.$nextTick()

    labels = wrapper.findAll('span.truncate').map((n) => n.text())
    expect(labels[0]).toBe('Explore Akihabara')
  })
})
