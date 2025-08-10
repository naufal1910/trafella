import { describe, it, expect } from 'vitest'
import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ItineraryResults from '../ItineraryResults.vue'
import { useItineraryStore } from '@/stores/itinerary'

const fakeItinerary = {
  destination: 'Paris',
  duration_days: 2,
  itinerary: {
    days: [
      {
        day_number: 1,
        date: '2025-09-01',
        title: 'Arrival and Louvre',
        summary: 'Explore Louvre and Seine walk',
        activities: {
          morning: 'Arrive and check-in',
          afternoon: 'Louvre Museum',
          evening: 'Seine river walk',
        },
        tips: 'Buy museum pass',
      },
      {
        day_number: 2,
        date: '2025-09-02',
        title: 'Eiffel and Montmartre',
        summary: 'Iconic sights and bohemian vibes',
        activities: {
          morning: 'Eiffel Tower',
          afternoon: 'Montmartre',
          evening: 'Moulin Rouge area',
        },
      },
    ],
  },
}

describe('ItineraryResults', () => {
  it('renders itinerary when store has data', async () => {
    const wrapper = mount(ItineraryResults, {
      global: { plugins: [createTestingPinia()] },
    })
    const store = useItineraryStore()
    // set store state
    store.itinerary = fakeItinerary as any
    await nextTick()
    expect(wrapper.text()).toContain('Itinerary for Paris (2 days)')
    expect(wrapper.text()).toContain('Day 1 — Arrival and Louvre')
    expect(wrapper.text()).toContain('Day 2 — Eiffel and Montmartre')
  })
})
