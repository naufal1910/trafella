import { beforeEach, describe, expect, it } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
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

describe('useItineraryStore (Planner M3 time edits)', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    sessionStorage.clear()
  })

  it('seeds default times for a day via getDayActivitiesWithTimes', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    const items = store.getDayActivitiesWithTimes(1)
    expect(items.map((i) => i.name)).toEqual([
      'Visit Senso-ji Temple',
      'Explore Akihabara',
      'Shibuya Crossing & dinner',
    ])
    expect(items.map((i) => `${i.startTime}-${i.endTime}`)).toEqual([
      '09:00-10:30',
      '11:00-12:30',
      '14:00-16:00',
    ])
  })

  it('extends an activity and reflows subsequent items contiguously preserving durations', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    // seed
    let items = store.getDayActivitiesWithTimes(1)
    expect(items[0].endTime).toBe('10:30')

    // Extend first activity to 11:30
    store.updateActivityTime(1, 'morning', { endTime: '11:30' })

    items = store.getDayActivitiesWithTimes(1)
    expect(items[0].endTime).toBe('11:30')
    // second should start at 11:30 and keep 90min duration -> 13:00
    expect(items[1].startTime).toBe('11:30')
    expect(items[1].endTime).toBe('13:00')
  })

  it('moving an activity start earlier shortens previous end to match', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    // seed
    store.getDayActivitiesWithTimes(1)

    // Move afternoon start earlier to 10:00 -> previous (morning) end should become 10:00
    store.updateActivityTime(1, 'afternoon', { startTime: '10:00' })
    const items = store.getDayActivitiesWithTimes(1)
    expect(items[0].endTime).toBe('10:00')
    expect(items[1].startTime).toBe('10:00')
  })

  it('shortening an activity only pulls the immediate next earlier, keeping others as-is', () => {
    const store = useItineraryStore()
    const data = sampleItinerary()
    store.itinerary = JSON.parse(JSON.stringify(data)) as any
    store.originalItinerary = JSON.parse(JSON.stringify(data)) as any

    // seed
    store.getDayActivitiesWithTimes(1)

    // Shorten afternoon from 12:30 to 12:00
    store.updateActivityTime(1, 'afternoon', { endTime: '12:00' })

    const items = store.getDayActivitiesWithTimes(1)
    // Afternoon becomes 11:00-12:00
    expect(items[1].startTime).toBe('11:00')
    expect(items[1].endTime).toBe('12:00')
    // Evening should pull earlier to start at 12:00 and keep 120 min -> 14:00
    expect(items[2].startTime).toBe('12:00')
    expect(items[2].endTime).toBe('14:00')
  })
})
