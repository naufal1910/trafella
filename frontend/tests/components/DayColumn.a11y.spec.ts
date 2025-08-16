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

describe('DayColumn accessibility', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders listbox and option roles with aria-selected', async () => {
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          draggable: {
            props: ['list'],
            template: '<div role="listbox" v-bind="$attrs"><slot name="item" v-for="(el, i) in list" :element="el" :index="i" /></div>',
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

    const listbox = wrapper.find('[role="listbox"]')
    expect(listbox.exists()).toBe(true)
    // aria-activedescendant should be absent before any selection
    expect(listbox.attributes('aria-activedescendant')).toBeUndefined()

    const options = wrapper.findAll('[role="option"]')
    expect(options.length).toBe(3)
    // None selected initially
    expect(options.some((o) => o.attributes('aria-selected') === 'true')).toBe(false)
  })

  it('Enter/Space selects item and updates aria-selected', async () => {
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          draggable: {
            props: ['list'],
            template: '<div role="listbox" v-bind="$attrs"><slot name="item" v-for="(el, i) in list" :element="el" :index="i" /></div>',
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

    const first = wrapper.findAll('[role="option"]')[0]
    await first.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()

    const selectedState = (store as any).selected
    expect(selectedState).toEqual({ dayNumber: 1, id: 'morning' })
    // Should now have one aria-selected=true
    const selected = wrapper.find('[role="option"][aria-selected="true"]')
    expect(selected.exists()).toBe(true)
    // Focus management: aria-activedescendant should reference the selected option id
    const listboxAfter = wrapper.find('[role="listbox"]')
    expect(listboxAfter.attributes('aria-activedescendant')).toBe('day-1-item-morning')
  })

  it('Alt/Ctrl + ArrowDown triggers moveItemDown', async () => {
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          draggable: {
            props: ['list'],
            template: '<div role="listbox" v-bind="$attrs"><slot name="item" v-for="(el, i) in list" :element="el" :index="i" /></div>',
          },
        },
      },
      props: { dayNumber: 1, title: 'Day 1' },
    })

    const store = useItineraryStore()
    const spyDown = vi.spyOn(store, 'moveItemDown')
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any
    await wrapper.vm.$nextTick()

    const first = wrapper.findAll('[role="option"]')[0]
    await first.trigger('keydown', { key: 'ArrowDown', altKey: true })

    expect(spyDown).toHaveBeenCalledWith(1, 0)
  })

  it('announces via live region on selection and clears', async () => {
    vi.useFakeTimers()
    const wrapper = mount(DayColumn, {
      global: {
        plugins: [createTestingPinia({ createSpy: vi.fn, stubActions: false })],
        stubs: {
          draggable: {
            props: ['list'],
            template: '<div role="listbox" v-bind="$attrs"><slot name="item" v-for="(el, i) in list" :element="el" :index="i" /></div>',
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

    const status = wrapper.find('[role="status"][aria-live="polite"]')
    expect(status.exists()).toBe(true)
    expect(status.text()).toBe('')

    const first = wrapper.findAll('[role="option"]')[0]
    await first.trigger('keydown', { key: 'Enter' })
    await wrapper.vm.$nextTick()
    expect(status.text()).toContain('Selected')

    vi.advanceTimersByTime(1000)
    await wrapper.vm.$nextTick()
    expect(status.text()).toBe('')
    vi.useRealTimers()
  })
})
