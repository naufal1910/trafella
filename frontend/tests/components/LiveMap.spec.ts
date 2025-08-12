import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref, nextTick } from 'vue'

// Mock Leaflet (dynamic import in component)
const mapSetView = vi.fn()
const mapGetZoom = vi.fn(() => 2)
const mapRemove = vi.fn()
const tileAddTo = vi.fn()
const layerGroupAddTo = vi.fn()
const layerGroupRemove = vi.fn()
const circleAddTo = vi.fn((layer: any) => layer)
const circleOn = vi.fn()
const circleSetStyle = vi.fn()
const circleBringToFront = vi.fn()

vi.mock('leaflet', () => {
  return {
    default: {
      map: vi.fn(() => ({ setView: mapSetView, getZoom: mapGetZoom, remove: mapRemove })),
      tileLayer: vi.fn(() => ({ addTo: tileAddTo })),
      layerGroup: vi.fn(() => ({ addTo: layerGroupAddTo, remove: layerGroupRemove })),
      circleMarker: vi.fn(() => ({ addTo: circleAddTo, on: circleOn, setStyle: circleSetStyle, bringToFront: circleBringToFront })),
    },
  }
})

// Mock store
const selectedRef = ref<any>(null)
const getDayItemsMock = vi.fn()
const selectActivityMock = vi.fn()

vi.mock('@/stores/itinerary', () => {
  return {
    useItineraryStore: () => ({
      itinerary: {
        itinerary: {
          days: [
            { day_number: 1, activities: { morning: 'A', afternoon: 'B', evening: 'C' } },
          ],
        },
      },
      getDayItems: (dayNumber: number) => {
        // two items to mark for testing
        getDayItemsMock(dayNumber)
        return [
          { id: 'morning', label: 'Breakfast' },
          { id: 'afternoon', label: 'Museum' },
        ] as any
      },
      selected: selectedRef,
      selectActivity: selectActivityMock,
    }),
  }
})

import LiveMap from '@/components/Planner/LiveMap.vue'

function flush() {
  return new Promise((r) => setTimeout(r))
}

describe('LiveMap.vue', () => {
  beforeEach(() => {
    selectedRef.value = null
    mapSetView.mockClear()
    mapGetZoom.mockClear()
    mapRemove.mockClear()
    tileAddTo.mockClear()
    layerGroupAddTo.mockClear()
    layerGroupRemove.mockClear()
    circleAddTo.mockClear()
    circleOn.mockClear()
    circleSetStyle.mockClear()
    circleBringToFront.mockClear()
    getDayItemsMock.mockClear()
    selectActivityMock.mockClear()
  })

  it('renders markers for items', async () => {
    const wrapper = mount(LiveMap)
    await flush()
    // Ensure at least one marker was added under mocked env
    expect((circleAddTo as any).mock.calls.length).toBeGreaterThanOrEqual(1)
    wrapper.unmount()
  })

  it('pans when selection changes', async () => {
    const wrapper = mount(LiveMap)
    // wait for dynamic import + map init
    await flush()
    await nextTick()
    // trigger selection
    selectedRef.value = { dayNumber: 1, id: 'morning' }
    await flush()
    await nextTick()
    expect(mapSetView).toHaveBeenCalled()
    wrapper.unmount()
  })
})
