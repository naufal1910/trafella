import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import ItineraryForm from '../ItineraryForm.vue'
import { useItineraryStore } from '@/stores/itinerary'

function mountWithPinia() {
  return mount(ItineraryForm, {
    global: {
      plugins: [createTestingPinia({ stubActions: true })],
    },
  })
}

describe('ItineraryForm', () => {
  it('submits and calls store.generateItinerary with form values', async () => {
    const wrapper = mountWithPinia()
    const store = useItineraryStore()

    // Fill required fields
    await wrapper.find('input[placeholder="e.g., Paris"]').setValue('Paris')
    const dateInputs = wrapper.findAll('input[type="date"]')
    await dateInputs[0].setValue('2025-09-01')
    await dateInputs[1].setValue('2025-09-03')
    await wrapper.find('input[placeholder="art, food, culture"]').setValue('art, food')

    await wrapper.find('button[type="submit"]').trigger('submit')

    expect(store.generateItinerary).toHaveBeenCalled()
    const callArg = (store.generateItinerary as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0]
    expect(callArg.destination).toBe('Paris')
    expect(callArg.start_date).toBe('2025-09-01')
    expect(callArg.end_date).toBe('2025-09-03')
    expect(callArg.interests).toEqual(['art', 'food'])
  })
})
